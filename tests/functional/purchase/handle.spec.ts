import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'

import Product from '#models/product'
import Transaction from '#models/transaction'
import TransactionProduct from '#models/transaction_product'

test.group('Purchases | handle', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
  })

  group.each.teardown(async () => {
    await db.rollbackGlobalTransaction()
  })

  test('should create a purchase successfully', async ({ client, assert }) => {
    const product1 = await Product.create({ name: 'Product A', amount: 10 })
    const product2 = await Product.create({ name: 'Product B', amount: 20 })

    const payload = {
      client: {
        name: 'John Doe',
        email: 'john@email.com',
      },
      products: [
        { productId: product1.id, quantity: 2 },
        { productId: product2.id, quantity: 1 },
      ],
      cardNumber: '1234567812345678',
    }

    const response = await client.post('/api/v1/purchases').json(payload)

    response.assertStatus(200)

    const { data }: any = response.body()

    assert.exists(data.transactionId)
    assert.equal(data.totalPurchase, 40)
    assert.lengthOf(data.products, 2)

    const transaction = await Transaction.find(data.transactionId)
    assert.exists(transaction)

    const transactionProducts = await TransactionProduct.query().where(
      'transaction_id',
      transaction!.id
    )

    assert.lengthOf(transactionProducts, 2)
  })

  test('should return 404 if one or more products do not exist', async ({ client }) => {
    const payload = {
      client: {
        name: 'John Doe',
        email: 'john@email.com',
      },
      products: [{ productId: 9999, quantity: 1 }],
      cardNumber: '1234567812345678',
    }

    const response = await client.post('/api/v1/purchases').json(payload)

    response.assertStatus(404)
    response.assertBodyContains({
      message: 'One or more products not found',
    })
  })

  test('should fail with invalid payload', async ({ client }) => {
    const response = await client.post('/api/v1/purchases').json({
      client: {
        name: 'Jo',
        email: 'invalid-email',
      },
      products: [],
      cardNumber: '123',
    })

    response.assertStatus(422)
  })
})
