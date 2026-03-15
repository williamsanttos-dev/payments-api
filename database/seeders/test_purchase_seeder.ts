import Gateway from '#models/gateway'
import Product from '#models/product'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    // Write your database queries inside the run method
    await Product.firstOrCreate({
      name: 'product-one',
      amount: 2790.99,
    })
    await Product.firstOrCreate({
      name: 'product-two',
      amount: 5900.67,
    })
    await Gateway.firstOrCreate(
      { name: 'gateway-1' },
      {
        priority: 1,
        isActive: true,
      }
    )
    await Gateway.firstOrCreate(
      { name: 'gateway-2' },
      {
        priority: 2,
        isActive: true,
      }
    )
  }
}
