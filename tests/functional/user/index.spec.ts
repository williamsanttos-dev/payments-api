import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import jwt from 'jsonwebtoken'

import User from '#models/user'
import { UserRole } from '../../../app/enums/user_role.ts'
import env from '#start/env'

test.group('Users | index', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
  })

  group.each.teardown(async () => {
    await db.rollbackGlobalTransaction()
  })

  const generateToken = (userId: number, role: UserRole) =>
    jwt.sign({ userId, role }, env.get('JWT_SECRET'), { expiresIn: '1h' })

  test('should return all users for ADMIN user', async ({ client, assert }) => {
    const admin = await User.create({
      fullName: 'Admin User',
      email: 'admin@email.com',
      password: '12345678',
      role: UserRole.ADMIN,
    })

    const token = generateToken(admin.id, UserRole.ADMIN)

    await User.create({
      fullName: 'User One',
      email: 'user1@email.com',
      password: '12345678',
      role: UserRole.USER,
    })

    await User.create({
      fullName: 'User Two',
      email: 'user2@email.com',
      password: '12345678',
      role: UserRole.USER,
    })

    const response = await client.get('/api/v1/users').header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)

    const { data }: any = response.body()

    assert.isArray(data)

    const emails = data.map((u: any) => u.email)

    assert.include(emails, 'admin@email.com')
    assert.include(emails, 'user1@email.com')
    assert.include(emails, 'user2@email.com')
  })

  test('should return 401 if token is missing', async ({ client }) => {
    const response = await client.get('/api/v1/users')

    response.assertStatus(401)
    response.assertBodyContains({ error: 'Token missing' })
  })

  test('should return 403 if user role is insufficient', async ({ client }) => {
    const user = await User.create({
      fullName: 'Regular User',
      email: 'user@email.com',
      password: '12345678',
      role: UserRole.USER,
    })

    const token = generateToken(user.id, UserRole.USER)

    const response = await client.get('/api/v1/users').header('Authorization', `Bearer ${token}`)

    response.assertStatus(403)
    response.assertBodyContains({ error: 'Insufficient permissions' })
  })
})
