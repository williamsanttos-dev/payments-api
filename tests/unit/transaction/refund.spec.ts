import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'

import Transaction from '#models/transaction'
import Gateway from '#models/gateway'
import Client from '#models/client'
import Product from '#models/product'
import { TransactionService } from '#services/transaction_service'
import { TransactionStatus } from '../../../app/enums/transaction_status.ts'

class FakeGatewayManager {
  public refunded = false

  async refund() {
    this.refunded = true
  }
}

test.group('TransactionService | refund', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
  })

  group.each.teardown(async () => {
    await db.rollbackGlobalTransaction()
  })

  const createApprovedTransaction = async () => {
    const client = await Client.create({
      name: 'John Doe',
      email: 'john@email.com',
    })

    const product = await Product.create({
      name: 'Product A',
      amount: 10,
    })

    const gateway = await Gateway.create({
      name: 'gateway-test',
      priority: 1,
      isActive: true,
    })

    const transaction = await Transaction.create({
      clientId: client.id,
      gatewayId: gateway.id,
      externalId: 'ext_123',
      amount: 1000,
      status: TransactionStatus.APPROVED,
      cardLastNumbers: '5678',
    })

    await transaction.related('products').attach({
      [product.id]: { quantity: 1 },
    })

    return { transaction, gateway }
  }

  test('should refund an approved transaction', async ({ assert }) => {
    const { transaction } = await createApprovedTransaction()

    const gatewayManager = new FakeGatewayManager()

    const service = new TransactionService(gatewayManager as any)

    const result = await service.refund(transaction.id.toString())

    assert.isTrue(gatewayManager.refunded)

    const updated = await Transaction.findOrFail(transaction.id)

    assert.equal(updated.status, TransactionStatus.REFUNDED)

    assert.equal(result.id, transaction.id)
  })

  test('should throw error if transaction not approved', async ({ assert }) => {
    const client = await Client.create({
      name: 'John',
      email: 'john@email.com',
    })

    const transaction = await Transaction.create({
      clientId: client.id,
      amount: 1000,
      status: TransactionStatus.FAILED,
      cardLastNumbers: '4567',
    })

    const service = new TransactionService(new FakeGatewayManager() as any)

    await assert.rejects(
      () => service.refund(transaction.id.toString()),
      'The transaction not was approved and do not be refunded'
    )
  })

  test('should throw error if externalId is missing', async ({ assert }) => {
    const client = await Client.create({
      name: 'John',
      email: 'john@email.com',
    })

    const gateway = await Gateway.create({
      name: 'gateway-test',
      priority: 1,
      isActive: true,
    })

    const transaction = await Transaction.create({
      clientId: client.id,
      gatewayId: gateway.id,
      amount: 1000,
      status: TransactionStatus.APPROVED,
      externalId: null,
      cardLastNumbers: '4567',
    })

    const service = new TransactionService(new FakeGatewayManager() as any)

    await assert.rejects(
      () => service.refund(transaction.id.toString()),
      'Transaction external id missing'
    )
  })

  test('should throw error if gatewayId is missing', async ({ assert }) => {
    const client = await Client.create({
      name: 'John',
      email: 'john@email.com',
    })

    const transaction = await Transaction.create({
      clientId: client.id,
      amount: 1000,
      status: TransactionStatus.APPROVED,
      externalId: 'ext_123',
      gatewayId: null,
      cardLastNumbers: '4567',
    })

    const service = new TransactionService(new FakeGatewayManager() as any)

    await assert.rejects(() => service.refund(transaction.id.toString()), 'gatewayId id missing')
  })

  test('should throw error if gateway is inactive or not found', async ({ assert }) => {
    const client = await Client.create({
      name: 'John',
      email: 'john@email.com',
    })

    const gateway = await Gateway.create({
      name: 'gateway-test',
      priority: 1,
      isActive: false,
    })

    const transaction = await Transaction.create({
      clientId: client.id,
      gatewayId: gateway.id,
      externalId: 'ext_123',
      amount: 1000,
      status: TransactionStatus.APPROVED,
      cardLastNumbers: '4567',
    })

    const service = new TransactionService(new FakeGatewayManager() as any)

    await assert.rejects(
      () => service.refund(transaction.id.toString()),
      'Gateway responsible by transaction not found or inactive'
    )
  })
})
