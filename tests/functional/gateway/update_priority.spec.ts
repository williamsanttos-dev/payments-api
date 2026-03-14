import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import jwt from 'jsonwebtoken'

import Gateway from '#models/gateway'
import User from '#models/user'
import env from '#start/env'
import { UserRole } from '../../../app/enums/user_role.ts'

test.group('Gateways | updatePriority', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
  })

  group.each.teardown(async () => {
    await db.rollbackGlobalTransaction()
  })

  const generateToken = (userId: number, role: UserRole) => {
    return jwt.sign({ userId, role }, env.get('JWT_SECRET'))
  }

  test('should update gateway priority for ADMIN', async ({ client, assert }) => {
    const admin = await User.create({
      fullName: 'Admin',
      email: 'admin@email.com',
      password: '12345678',
      role: UserRole.ADMIN,
    })

    const token = generateToken(admin.id, UserRole.ADMIN)

    const gateway = await Gateway.create({
      name: 'Gateway A',
      isActive: true,
      priority: 1,
    })

    const response = await client
      .patch(`/api/v1/gateways/${gateway.id}/priority`)
      .json({ priority: 10 })
      .header('authorization', `Bearer ${token}`)

    response.assertStatus(200)

    const { data } = response.body()

    assert.equal(data.id, gateway.id)
    assert.equal(data.priority, 10)
  })

  test('should return 400 when priority is not integer', async ({ client }) => {
    const admin = await User.create({
      fullName: 'Admin',
      email: 'admin@email.com',
      password: '12345678',
      role: UserRole.ADMIN,
    })

    const token = generateToken(admin.id, UserRole.ADMIN)

    const gateway = await Gateway.create({
      name: 'Gateway A',
      isActive: true,
      priority: 1,
    })

    const response = await client
      .patch(`/api/v1/gateways/${gateway.id}/priority`)
      .json({ priority: 'abc' })
      .header('authorization', `Bearer ${token}`)

    response.assertStatus(400)
    response.assertBodyContains({
      message: 'Priority must be an integer',
    })
  })

  test('should return 404 when gateway does not exist', async ({ client }) => {
    const admin = await User.create({
      fullName: 'Admin',
      email: 'admin@email.com',
      password: '12345678',
      role: UserRole.ADMIN,
    })

    const token = generateToken(admin.id, UserRole.ADMIN)

    const response = await client
      .patch('/api/v1/gateways/999999/priority')
      .json({ priority: 2 })
      .header('authorization', `Bearer ${token}`)

    response.assertStatus(404)
  })

  test('should return 401 when token is missing', async ({ client }) => {
    const response = await client.patch('/api/v1/gateways/1/priority').json({ priority: 2 })

    response.assertStatus(401)
  })

  test('should return 403 when role is not ADMIN', async ({ client }) => {
    const user = await User.create({
      fullName: 'User',
      email: 'user@email.com',
      password: '12345678',
      role: UserRole.USER,
    })

    const token = generateToken(user.id, UserRole.USER)

    const response = await client
      .patch('/api/v1/gateways/1/priority')
      .json({ priority: 2 })
      .header('authorization', `Bearer ${token}`)

    response.assertStatus(403)
  })
})
