import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'

import Product from '#models/product'
import Transaction from '#models/transaction'

import { GatewayManager, type GatewayProcessResult } from '../../../app/gateways/gateway_manager.ts'
import app from '@adonisjs/core/services/app'
import Gateway from '#models/gateway'

const getGatewayId = async () =>
  await Gateway.firstOrCreate({
    name: 'gateway-test-002',
    priority: 10,
  })
const gatewayId = await getGatewayId()
class FakeGatewayManager {
  async createTransaction(): Promise<GatewayProcessResult> {
    return {
      success: true,
      gatewayId: gatewayId.id,
      transaction: { id: 'fake_tx' },
    }
  }
}

test.group('Purchases | handle', (group) => {
  group.setup(() => {
    app.container.swap(GatewayManager, () => new FakeGatewayManager())
  })

  group.each.setup(async () => {
    await db.beginGlobalTransaction()
  })

  group.each.teardown(async () => {
    await db.rollbackGlobalTransaction()
  })

  test('should create purchase successfully', async ({ client, assert }) => {
    const product = await Product.create({
      name: 'Product A',
      amount: 10,
    })

    const response = await client.post('/api/v1/purchases').json({
      client: {
        name: 'John Doe',
        email: 'john@email.com',
      },
      products: [
        {
          productId: product.id,
          quantity: 2,
        },
      ],
      cardNumber: '1234567812345678',
      cvv: '123',
    })

    response.assertStatus(200)

    const { data }: any = response.body()

    assert.exists(data.transactionId)
    assert.equal(data.totalPurchase, '20.00')

    const transaction = await Transaction.find(data.transactionId)

    assert.exists(transaction)
    assert.equal(transaction!.cardLastNumbers, '5678')
  })

  test('should return 404 when product does not exist', async ({ client }) => {
    const response = await client.post('/api/v1/purchases').json({
      client: {
        name: 'John Doe',
        email: 'john@email.com',
      },
      products: [
        {
          productId: 9999,
          quantity: 1,
        },
      ],
      cardNumber: '1234567812345678',
      cvv: '123',
    })

    response.assertStatus(404)
  })

  test('should fail validation when payload is invalid', async ({ client }) => {
    const response = await client.post('/api/v1/purchases').json({
      client: {
        name: 'Jo',
        email: 'invalid-email',
      },
      products: [],
      cardNumber: '123',
      cvv: '1',
    })

    response.assertStatus(422)
  })

  test('should calculate total purchase correctly', async ({ client, assert }) => {
    const p1 = await Product.create({
      name: 'Product A',
      amount: 10,
    })

    const p2 = await Product.create({
      name: 'Product B',
      amount: 5,
    })

    const response = await client.post('/api/v1/purchases').json({
      client: {
        name: 'Jane Doe',
        email: 'jane@email.com',
      },
      products: [
        { productId: p1.id, quantity: 2 },
        { productId: p2.id, quantity: 3 },
      ],
      cardNumber: '1234567812345678',
      cvv: '123',
    })

    response.assertStatus(200)

    const { data }: any = response.body()

    assert.equal(data.totalPurchase, '35.00')
    assert.lengthOf(data.products, 2)
  })
})
