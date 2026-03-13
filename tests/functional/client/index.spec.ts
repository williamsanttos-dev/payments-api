import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import jwt from 'jsonwebtoken'

import Client from '#models/client'
import User from '#models/user'
import env from '#start/env'
import { UserRole } from '../../../app/enums/user_role.ts'

test.group('Clients | index', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
  })

  group.each.teardown(async () => {
    await db.rollbackGlobalTransaction()
  })

  const generateToken = (userId: number, role: UserRole) =>
    jwt.sign({ userId, role }, env.get('JWT_SECRET'), { expiresIn: '1h' })

  test('should return all clients for ADMIN user', async ({ client, assert }) => {
    const admin = await User.create({
      fullName: 'Admin',
      email: 'admin@email.com',
      password: '12345678',
      role: UserRole.ADMIN,
    })

    const token = generateToken(admin.id, UserRole.ADMIN)

    await Client.create({
      name: 'John Doe',
      email: 'john@email.com',
    })

    await Client.create({
      name: 'Jane Doe',
      email: 'jane@email.com',
    })

    const response = await client.get('/api/v1/clients').header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)

    const { data }: any = response.body()

    assert.isArray(data)

    const emails = data.map((c: any) => c.email)

    assert.include(emails, 'john@email.com')
    assert.include(emails, 'jane@email.com')
  })

  test('should return 401 if token is missing', async ({ client }) => {
    const response = await client.get('/api/v1/clients')

    response.assertStatus(401)
    response.assertBodyContains({
      error: 'Token missing',
    })
  })

  test('should return 403 if role is insufficient', async ({ client }) => {
    const user = await User.create({
      fullName: 'User',
      email: 'user@email.com',
      password: '12345678',
      role: UserRole.USER,
    })

    const token = generateToken(user.id, UserRole.USER)

    const response = await client.get('/api/v1/clients').header('Authorization', `Bearer ${token}`)

    response.assertStatus(403)
    response.assertBodyContains({
      error: 'Insufficient permissions',
    })
  })
})
