import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import jwt from 'jsonwebtoken'

import User from '#models/user'
import env from '#start/env'
import { UserRole } from '../../../app/enums/user_role.ts'

test.group('Users | update', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
  })

  group.each.teardown(async () => {
    await db.rollbackGlobalTransaction()
  })

  const generateToken = (userId: number, role: UserRole) =>
    jwt.sign({ userId, role }, env.get('JWT_SECRET'), { expiresIn: '1h' })

  test('ADMIN should update any user', async ({ client, assert }) => {
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
      .patch(`/api/v1/users/${targetUser.id}`)
      .header('Authorization', `Bearer ${token}`)
      .json({
        fullName: 'Updated Name',
      })

    response.assertStatus(200)

    const { data }: any = response.body()

    assert.equal(data.fullName, 'Updated Name')
  })

  test('USER should update himself', async ({ client, assert }) => {
    const user = await User.create({
      fullName: 'User',
      email: 'user@email.com',
      password: '12345678',
      role: UserRole.USER,
    })

    const token = generateToken(user.id, UserRole.USER)

    const response = await client
      .patch(`/api/v1/users/${user.id}`)
      .header('Authorization', `Bearer ${token}`)
      .json({
        fullName: 'New Self Name',
      })

    response.assertStatus(200)

    const { data }: any = response.body()

    assert.equal(data.fullName, 'New Self Name')
  })

  test('USER should not update another user', async ({ client }) => {
    const user = await User.create({
      fullName: 'User 1',
      email: 'user1@email.com',
      password: '12345678',
      role: UserRole.USER,
    })

    const otherUser = await User.create({
      fullName: 'User 2',
      email: 'user2@email.com',
      password: '12345678',
      role: UserRole.USER,
    })

    const token = generateToken(user.id, UserRole.USER)

    const response = await client
      .patch(`/api/v1/users/${otherUser.id}`)
      .header('Authorization', `Bearer ${token}`)
      .json({
        fullName: 'Hack',
      })

    response.assertStatus(401)
  })

  test('should return 401 if token missing', async ({ client }) => {
    const user = await User.create({
      fullName: 'User',
      email: 'user@email.com',
      password: '12345678',
      role: UserRole.USER,
    })

    const response = await client.patch(`/api/v1/users/${user.id}`).json({
      fullName: 'New Name',
    })

    response.assertStatus(401)
  })
})
