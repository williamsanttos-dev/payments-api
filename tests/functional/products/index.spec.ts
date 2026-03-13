import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import jwt from 'jsonwebtoken'

import User from '#models/user'
import Product from '#models/product'
import { UserRole } from '../../../app/enums/user_role.ts'
import env from '#start/env'

test.group('Products | index', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
  })

  group.each.teardown(async () => {
    await db.rollbackGlobalTransaction()
  })

  const generateToken = (userId: number, role: UserRole) =>
    jwt.sign({ userId, role }, env.get('JWT_SECRET'), { expiresIn: '1h' })

  test('should return all products for ADMIN user', async ({ client, assert }) => {
    const admin = await User.create({
      fullName: 'Admin User',
      email: 'admin@email.com',
      password: '12345678',
      role: UserRole.ADMIN,
    })

    const token = generateToken(admin.id, UserRole.ADMIN)

    await Product.create({ name: 'Product 1', amount: 10 })
    await Product.create({ name: 'Product 2', amount: 20 })

    const response = await client.get('/api/v1/products').header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)

    const { data }: any = response.body()
    assert.isArray(data)

    const names = data.map((p: any) => p.name)
    assert.include(names, 'Product 1')
    assert.include(names, 'Product 2')
  })

  test('should return 401 if token is missing', async ({ client }) => {
    const response = await client.get('/api/v1/products')
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

    const response = await client.get('/api/v1/products').header('Authorization', `Bearer ${token}`)

    response.assertStatus(403)
    response.assertBodyContains({ error: 'Insufficient permissions' })
  })
})
