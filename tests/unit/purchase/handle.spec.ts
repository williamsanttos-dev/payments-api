import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import Product from '#models/product'
import Client from '#models/client'
import Transaction from '#models/transaction'
import { PurchaseService } from '#services/purchase_service'
import { TransactionStatus } from '../../../app/enums/transaction_status.ts'
import type { GatewayProcessResult } from '../../../app/gateways/gateway_manager.ts'
import Gateway from '#models/gateway'

class FakeGatewayManager {
  public result: GatewayProcessResult

  constructor(result: GatewayProcessResult) {
    this.result = result
  }

  async createTransaction() {
    return this.result
  }
}

test.group('PurchaseService | handle', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
  })

  group.each.teardown(async () => {
    await db.rollbackGlobalTransaction()
  })

  const purchasePayload = {
    client: {
      name: 'John Doe',
      email: 'john@email.com',
    },
    products: [
      { productId: 1, quantity: 2 },
      { productId: 2, quantity: 1 },
    ],
    cardNumber: '1234567812345678',
    cvv: '123',
  }

  const getGatewayId = async () =>
    await Gateway.firstOrCreate({
      name: 'gateway-test-002',
      priority: 10,
    })

  test('should create purchase with APPROVED status when gateway succeeds', async ({ assert }) => {
    const p1 = await Product.create({ name: 'Product A', amount: 10 })
    const p2 = await Product.create({ name: 'Product B', amount: 20 })

    const gatewayId = await getGatewayId()
    const gateway = new FakeGatewayManager({
      success: true,
      gatewayId: gatewayId.id,
      transaction: { id: 'ext_123' },
    })

    const service = new PurchaseService(gateway as any)

    const result = await service.handle({
      ...purchasePayload,
      products: [
        { productId: p1.id, quantity: 2 },
        { productId: p2.id, quantity: 1 },
      ],
    })

    assert.exists(result.transactionId)
    assert.equal(result.status, TransactionStatus.APPROVED)
    assert.equal(result.totalPurchase, '40.00')

    const transaction = await Transaction.find(result.transactionId)

    assert.exists(transaction)
    assert.equal(transaction!.amount, 4000)
    assert.equal(transaction!.cardLastNumbers, '5678')
  })

  test('should create purchase with FAILED status when gateway fails', async ({ assert }) => {
    const product = await Product.create({ name: 'Product A', amount: 15 })

    const gateway = new FakeGatewayManager({
      success: false,
      gatewayId: null,
      transaction: { id: null },
    })

    const service = new PurchaseService(gateway as any)

    const result = await service.handle({
      ...purchasePayload,
      products: [{ productId: product.id, quantity: 2 }],
    })

    assert.equal(result.status, TransactionStatus.FAILED)

    const transaction = await Transaction.find(result.transactionId)

    assert.exists(transaction)
    assert.equal(transaction!.status, TransactionStatus.FAILED)
  })

  test('should throw error when one or more products do not exist', async ({ assert }) => {
    const gatewayId = await getGatewayId()
    const gateway = new FakeGatewayManager({
      success: true,
      gatewayId: gatewayId.id,
      transaction: { id: 'ext_123' },
    })

    const service = new PurchaseService(gateway as any)

    await assert.rejects(
      () =>
        service.handle({
          ...purchasePayload,
          products: [{ productId: 999, quantity: 1 }],
        }),
      'One or more products not found'
    )
  })

  test('should reuse existing client instead of creating new one', async ({ assert }) => {
    const product = await Product.create({ name: 'Product A', amount: 10 })

    const existingClient = await Client.create({
      name: 'John Doe',
      email: 'john@email.com',
    })

    const gatewayId = await getGatewayId()
    const gateway = new FakeGatewayManager({
      success: true,
      gatewayId: gatewayId.id,
      transaction: { id: 'ext_123' },
    })

    const service = new PurchaseService(gateway as any)

    await service.handle({
      ...purchasePayload,
      products: [{ productId: product.id, quantity: 1 }],
    })

    const clients = await Client.query().where('email', existingClient.email)

    assert.lengthOf(clients, 1)
  })

  test('should correctly attach products to transaction', async ({ assert }) => {
    const product = await Product.create({ name: 'Product A', amount: 12 })

    const gatewayId = await getGatewayId()
    const gateway = new FakeGatewayManager({
      success: true,
      gatewayId: gatewayId.id,
      transaction: { id: 'ext_123' },
    })

    const service = new PurchaseService(gateway as any)

    const result = await service.handle({
      ...purchasePayload,
      products: [{ productId: product.id, quantity: 3 }],
    })

    const transaction = await Transaction.findOrFail(result.transactionId)

    const relatedProducts = await transaction.related('products').query()

    assert.lengthOf(relatedProducts, 1)
    assert.equal(relatedProducts[0].id, product.id)
  })
})
