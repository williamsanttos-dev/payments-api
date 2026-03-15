import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import app from '@adonisjs/core/services/app'
import jwt from 'jsonwebtoken'

import Transaction from '#models/transaction'
import Gateway from '#models/gateway'
import Client from '#models/client'
import User from '#models/user'

import { GatewayManager, type GatewayProcessResult } from '../../../app/gateways/gateway_manager.ts'
import { TransactionStatus } from '../../../app/enums/transaction_status.ts'
import { UserRole } from '../../../app/enums/user_role.ts'

import env from '#start/env'

const generateToken = (userId: number, role: UserRole) => {
  return jwt.sign({ userId, role }, env.get('JWT_SECRET'))
}

const getGateway = async () =>
  await Gateway.firstOrCreate({
    name: 'gateway-test-refund',
    priority: 10,
    isActive: true,
  })

const getClientId = async () =>
  await Client.firstOrCreate({
    name: 'John Doe',
    email: 'john@email.com',
  })

class FakeGatewayManager {
  async createTransaction(): Promise<GatewayProcessResult> {
    return {
      success: true,
      gatewayId: 1,
      transaction: { id: 'fake_tx' },
    }
  }

  async refund(): Promise<void> {}
}

test.group('Transactions | refund', (group) => {
  group.setup(() => {
    app.container.swap(GatewayManager, () => new FakeGatewayManager())
  })

  group.each.setup(async () => {
    await db.beginGlobalTransaction()
  })

  group.each.teardown(async () => {
    await db.rollbackGlobalTransaction()
  })

  test('should refund transaction successfully for ADMIN', async ({ client, assert }) => {
    const admin = await User.create({
      fullName: 'Admin',
      email: 'admin@email.com',
      password: '12345678',
      role: UserRole.ADMIN,
    })

    const token = generateToken(admin.id, UserRole.ADMIN)

    const gateway = await getGateway()
    const clientId = await getClientId()

    const transaction = await Transaction.create({
      clientId: clientId.id,
      status: TransactionStatus.APPROVED,
      amount: 2000,
      externalId: 'ext_123',
      gatewayId: gateway.id,
      cardLastNumbers: '5678',
    })

    const response = await client
      .post(`/api/v1/transactions/${transaction.id}/refund`)
      .header('authorization', `Bearer ${token}`)

    response.assertStatus(200)

    const { data }: any = response.body()

    assert.equal(data.id, transaction.id)

    const updatedTransaction = await Transaction.find(transaction.id)

    assert.equal(updatedTransaction!.status, TransactionStatus.REFUNDED)
  })

  test('should return 400 when transaction is not approved', async ({ client }) => {
    const admin = await User.create({
      fullName: 'Admin',
      email: 'admin2@email.com',
      password: '12345678',
      role: UserRole.ADMIN,
    })

    const token = generateToken(admin.id, UserRole.ADMIN)

    const gateway = await getGateway()
    const clientId = await getClientId()

    const transaction = await Transaction.create({
      clientId: clientId.id,
      status: TransactionStatus.FAILED,
      amount: 2000,
      externalId: 'ext_123',
      gatewayId: gateway.id,
      cardLastNumbers: '5678',
    })

    const response = await client
      .post(`/api/v1/transactions/${transaction.id}/refund`)
      .header('authorization', `Bearer ${token}`)

    response.assertStatus(400)
  })

  test('should return 401 when token is missing', async ({ client }) => {
    const gateway = await getGateway()
    const clientId = await getClientId()

    const transaction = await Transaction.create({
      clientId: clientId.id,
      status: TransactionStatus.APPROVED,
      amount: 2000,
      externalId: 'ext_123',
      gatewayId: gateway.id,
      cardLastNumbers: '5678',
    })

    const response = await client.post(`/api/v1/transactions/${transaction.id}/refund`)

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

    const gateway = await getGateway()
    const clientId = await getClientId()

    const transaction = await Transaction.create({
      clientId: clientId.id,
      status: TransactionStatus.APPROVED,
      amount: 2000,
      externalId: 'ext_123',
      gatewayId: gateway.id,
      cardLastNumbers: '5678',
    })

    const response = await client
      .post(`/api/v1/transactions/${transaction.id}/refund`)
      .header('authorization', `Bearer ${token}`)

    response.assertStatus(403)
    response.assertBodyContains({
      error: 'Insufficient permissions',
    })
  })

  test('should return 500 when gateway is inactive', async ({ client }) => {
    const admin = await User.create({
      fullName: 'Admin',
      email: 'admin3@email.com',
      password: '12345678',
      role: UserRole.ADMIN,
    })

    const token = generateToken(admin.id, UserRole.ADMIN)

    const gateway = await Gateway.create({
      name: 'inactive-gateway',
      priority: 10,
      isActive: false,
    })

    const clientId = await getClientId()

    const transaction = await Transaction.create({
      clientId: clientId.id,
      status: TransactionStatus.APPROVED,
      amount: 2000,
      externalId: 'ext_123',
      gatewayId: gateway.id,
      cardLastNumbers: '5678',
    })

    const response = await client
      .post(`/api/v1/transactions/${transaction.id}/refund`)
      .header('authorization', `Bearer ${token}`)

    response.assertStatus(500)
  })
})
