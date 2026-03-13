import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'

import { PurchaseService } from '#services/purchase_service'
import Product from '#models/product'
import Client from '#models/client'
import Transaction from '#models/transaction'
import TransactionProduct from '#models/transaction_product'

test.group('PurchaseService | handle', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
  })

  group.each.teardown(async () => {
    await db.rollbackGlobalTransaction()
  })

  test('should create a purchase successfully', async ({ assert }) => {
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

    const result = await PurchaseService.handle(payload)

    assert.exists(result.transactionId)
    assert.equal(result.products.length, 2)

    assert.equal(result.totalPurchase, 40) // 2*10 + 1*20

    const transaction = await Transaction.find(result.transactionId)
    assert.exists(transaction)

    const transactionProducts = await TransactionProduct.query().where(
      'transaction_id',
      transaction!.id
    )

    assert.lengthOf(transactionProducts, 2)
  })

  test('should throw error if one or more products do not exist', async ({ assert }) => {
    const payload = {
      client: {
        name: 'John Doe',
        email: 'john@email.com',
      },
      products: [{ productId: 9999, quantity: 1 }],
      cardNumber: '1234567812345678',
    }

    await assert.rejects(() => PurchaseService.handle(payload), 'One or more products not found')
  })

  test('should reuse existing client if email already exists', async ({ assert }) => {
    const client = await Client.create({
      name: 'John Doe',
      email: 'john@email.com',
    })

    const product = await Product.create({
      name: 'Product A',
      amount: 10,
    })

    const payload = {
      client: {
        name: 'John Doe',
        email: 'john@email.com',
      },
      products: [{ productId: product.id, quantity: 1 }],
      cardNumber: '1234567812345678',
    }

    await PurchaseService.handle(payload)

    const clients = await Client.query().where('email', client.email)

    assert.lengthOf(clients, 1) // não criou cliente duplicado
  })

  test('should calculate purchase total correctly', async ({ assert }) => {
    const product = await Product.create({
      name: 'Product A',
      amount: 15,
    })

    const payload = {
      client: {
        name: 'John Doe',
        email: 'john@email.com',
      },
      products: [{ productId: product.id, quantity: 3 }],
      cardNumber: '1234567812345678',
    }

    const result = await PurchaseService.handle(payload)

    assert.equal(result.totalPurchase, 45)
  })
})
