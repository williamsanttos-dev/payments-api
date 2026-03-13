import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import jwt from 'jsonwebtoken'

import Transaction from '#models/transaction'
import User from '#models/user'
import env from '#start/env'
import { UserRole } from '../../../app/enums/user_role.ts'
import { TransactionStatus } from '../../../app/enums/transaction_status.ts'

test.group('Transactions | index', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
  })

  group.each.teardown(async () => {
    await db.rollbackGlobalTransaction()
  })

  const generateToken = (userId: number, role: UserRole) => {
    return jwt.sign({ userId, role }, env.get('JWT_SECRET'))
  }

  test('should return all transactions for ADMIN', async ({ client, assert }) => {
    const admin = await User.create({
      fullName: 'Admin',
      email: 'admin@email.com',
      password: '12345678',
      role: UserRole.ADMIN,
    })

    const token = generateToken(admin.id, UserRole.ADMIN)

    await Transaction.create({
      clientId: 1,
      gatewayId: 100,
      amount: 5000,
      externalId: 'ext_1',
      status: TransactionStatus.PENDING,
      cardLastNumbers: '1234',
    })

    await Transaction.create({
      clientId: 1,
      gatewayId: 200,
      amount: 8000,
      externalId: 'ext_2',
      status: TransactionStatus.PENDING,
      cardLastNumbers: '4321',
    })

    const response = await client
      .get('/api/v1/transactions')
      .header('authorization', `Bearer ${token}`)

    response.assertStatus(200)

    const { data }: any = response.body()

    assert.isArray(data)

    const cardLastNumbers = data.map((c: any) => c.cardLastNumbers)

    assert.include(cardLastNumbers, '1234')
    assert.include(cardLastNumbers, '4321')
  })

  test('should return 401 when token is missing', async ({ client }) => {
    const response = await client.get('/api/v1/transactions')

    response.assertStatus(401)
    response.assertBodyContains({
      error: 'Token missing',
    })
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
      .get('/api/v1/transactions')
      .header('authorization', `Bearer ${token}`)

    response.assertStatus(403)
    response.assertBodyContains({
      error: 'Insufficient permissions',
    })
  })
})
