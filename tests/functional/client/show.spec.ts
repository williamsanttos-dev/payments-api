import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import jwt from 'jsonwebtoken'

import Client from '#models/client'
import User from '#models/user'
import env from '#start/env'
import { UserRole } from '../../../app/enums/user_role.ts'

test.group('Clients | show', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
  })

  group.each.teardown(async () => {
    await db.rollbackGlobalTransaction()
  })

  const generateToken = (userId: number, role: UserRole) => {
    return jwt.sign({ userId, role }, env.get('JWT_SECRET'))
  }

  test('should return client when ADMIN requests', async ({ client, assert }) => {
    const admin = await User.create({
      fullName: 'Admin',
      email: 'admin@email.com',
      password: '12345678',
      role: UserRole.ADMIN,
    })

    const token = generateToken(admin.id, UserRole.ADMIN)

    const createdClient = await Client.create({
      name: 'John Doe',
      email: 'john@email.com',
    })

    const response = await client
      .get(`/api/v1/clients/${createdClient.id}`)
      .header('authorization', `Bearer ${token}`)

    response.assertStatus(200)

    const { data } = response.body()

    assert.equal(data.id, createdClient.id)
    assert.equal(data.name, createdClient.name)
    assert.equal(data.email, createdClient.email)
  })

  test('should return 404 if client does not exist', async ({ client }) => {
    const admin = await User.create({
      fullName: 'Admin',
      email: 'admin@email.com',
      password: '12345678',
      role: UserRole.ADMIN,
    })

    const token = generateToken(admin.id, UserRole.ADMIN)

    const response = await client
      .get('/api/v1/clients/999999')
      .header('authorization', `Bearer ${token}`)

    response.assertStatus(404)
  })

  test('should return 401 if token is missing', async ({ client }) => {
    const response = await client.get('/api/v1/clients/1')

    response.assertStatus(401)
    response.assertBodyContains({
      error: 'Token missing',
    })
  })

  test('should return 403 if role is not ADMIN', async ({ client }) => {
    const user = await User.create({
      fullName: 'User',
      email: 'user@email.com',
      password: '12345678',
      role: UserRole.USER,
    })

    const token = generateToken(user.id, UserRole.USER)

    const response = await client
      .get('/api/v1/clients/1')
      .header('authorization', `Bearer ${token}`)

    response.assertStatus(403)
    response.assertBodyContains({
      error: 'Insufficient permissions',
    })
  })
})
