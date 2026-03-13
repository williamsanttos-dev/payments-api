import Client from '#models/client'
import Product from '#models/product'
import Transaction from '#models/transaction'
import TransactionProduct from '#models/transaction_product'
import type { PurchaseData } from '#validators/purchase'
import { Exception } from '@adonisjs/core/exceptions'
import db from '@adonisjs/lucid/services/db'

import { TransactionStatus } from '../enums/transaction_status.ts'

export class PurchaseService {
  static async handle(data: PurchaseData) {
    return await db.transaction(async (tx) => {
      const productsIds = data.products.map((p) => p.productId)

      const products = await Product.query({ client: tx }).whereIn('id', productsIds)
      if (products.length !== productsIds.length)
        throw new Exception('One or more products not found', {
          status: 404,
        })

      const amount = products.reduce((total, product, i) => {
        const { quantity } = data.products[i]

        if (!product) return total
        return total + quantity * product.amount
      }, 0)

      const client = await Client.firstOrCreate(
        {
          email: data.client.email,
          name: data.client.name,
        },
        data.client,
        {
          client: tx,
        }
      )

      const random = Math.random() * (1000 - 100) + 100
      // gateway_id/external_id vai ser mock, por enquanto.
      const transaction = await Transaction.create(
        {
          clientId: client.id,
          gatewayId: random,
          amount: amount * 100, // stored like cents in database
          externalId: String(random),
          status: TransactionStatus.PENDING, // pensar em como esse status vai mudar
          cardLastNumbers: data.cardNumber.slice(-4),
        },
        {
          client: tx,
        }
      )

      for (const item of data.products) {
        await TransactionProduct.create(
          {
            transactionId: transaction.id,
            productId: item.productId,
            quantity: item.quantity,
          },
          {
            client: tx,
          }
        )
      }

      // LEMBRAR DE COLOCAR GATEWAY_ID COMO FOREIGN_KEY

      const productsMap = new Map(products.map((p) => [p.id, p]))
      const productsResponse = []

      for (const item of data.products) {
        const product = productsMap.get(item.productId)!

        const subtotal = product.amount * item.quantity

        productsResponse.push({
          productId: product.id,
          quantity: item.quantity,
          unitAmount: product.amount,
          total: subtotal,
        })
      }

      return {
        transactionId: transaction.id,
        status: transaction.status,
        totalPurchase: amount,
        products: productsResponse,
      }
    })
  }
}
