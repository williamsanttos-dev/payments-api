import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'

import { ProductService } from '#services/product_service'
import Product from '#models/product'

test.group('ProductService | index', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
  })

  group.each.teardown(async () => {
    await db.rollbackGlobalTransaction()
  })

  test('should return all products', async ({ assert }) => {
    await Product.create({
      name: 'Product 1',
      amount: 10.5,
    })

    await Product.create({
      name: 'Product 2',
      amount: 20,
    })

    const products = await ProductService.index()

    assert.isArray(products)

    const names = products.map((p) => p.name)
    assert.include(names, 'Product 1')
    assert.include(names, 'Product 2')
  })
})
