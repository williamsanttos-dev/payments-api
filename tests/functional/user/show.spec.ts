import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import jwt from 'jsonwebtoken'

import User from '#models/user'
import env from '#start/env'
import { UserRole } from '../../../app/enums/user_role.ts'

test.group('Users | show', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
  })

  group.each.teardown(async () => {
    await db.rollbackGlobalTransaction()
  })

  const generateToken = (userId: number, role: UserRole) =>
    jwt.sign({ userId, role }, env.get('JWT_SECRET'), { expiresIn: '1h' })

  test('should allow ADMIN to access any user', async ({ client, assert }) => {
    const admin = await User.create({
      fullName: 'Admin',
      email: 'admin@email.com',
      password: '12345678',
      role: UserRole.ADMIN,
    })

    const targetUser = await User.create({
      fullName: 'Target',
      email: 'target@email.com',
      password: '12345678',
      role: UserRole.USER,
    })

    const token = generateToken(admin.id, UserRole.ADMIN)

    const response = await client
      .get(`/api/v1/users/${targetUser.id}`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)

    const { data }: any = response.body()

    assert.equal(data.id, targetUser.id)
    assert.equal(data.email, 'target@email.com')
  })

  test('should allow USER to access himself', async ({ client, assert }) => {
    const user = await User.create({
      fullName: 'Regular User',
      email: 'user@email.com',
      password: '12345678',
      role: UserRole.USER,
    })

    const token = generateToken(user.id, UserRole.USER)

    const response = await client
      .get(`/api/v1/users/${user.id}`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)

    const { data }: any = response.body()

    assert.equal(data.id, user.id)
  })

  test('should return 401 if user tries to access another user', async ({ client }) => {
    const user = await User.create({
      fullName: 'User One',
      email: 'user1@email.com',
      password: '12345678',
      role: UserRole.USER,
    })

    const otherUser = await User.create({
      fullName: 'User Two',
      email: 'user2@email.com',
      password: '12345678',
      role: UserRole.USER,
    })

    const token = generateToken(user.id, UserRole.USER)

    const response = await client
      .get(`/api/v1/users/${otherUser.id}`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(401)
    response.assertBodyContains({ message: 'Unauthorized' })
  })

  test('should return 401 if token is missing', async ({ client }) => {
    const user = await User.create({
      fullName: 'User',
      email: 'user@email.com',
      password: '12345678',
      role: UserRole.USER,
    })

    const response = await client.get(`/api/v1/users/${user.id}`)

    response.assertStatus(401)
  })
})
