import Client from '#models/client'
import Product from '#models/product'
import Transaction from '#models/transaction'
import type { PurchaseData } from '#validators/purchase'
import { Exception } from '@adonisjs/core/exceptions'
import db from '@adonisjs/lucid/services/db'

import { TransactionStatus } from '../enums/transaction_status.ts'
import { GatewayManager } from '../gateways/gateway_manager.ts'
import { inject } from '@adonisjs/core'

@inject()
export class PurchaseService {
  constructor(private readonly gatewayManager: GatewayManager) {}

  async handle(data: PurchaseData) {
    return await db.transaction(async (tx) => {
      const productsIds = data.products.map((p) => p.productId)

      const products = await Product.query({ client: tx }).whereIn('id', productsIds)
      if (products.length !== productsIds.length)
        throw new Exception('One or more products not found', {
          status: 404,
        })

      const amount = Number(
        products
          .reduce((total, product, i) => {
            const { quantity } = data.products[i]

            if (!product) return total
            return total + quantity * product.amount
          }, 0)
          .toFixed(2)
      )

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

      const amountInCents = Number((amount * 100).toFixed(0))

      const paymentProcess = await this.gatewayManager.createTransaction({
        amount: amountInCents,
        cardNumber: data.cardNumber,
        cvv: data.cvv,
        email: data.client.email,
        name: data.client.name,
      })

      const transaction = await Transaction.create(
        {
          clientId: client.id,
          gatewayId: paymentProcess.gatewayId ?? undefined,
          amount: amountInCents,
          externalId: paymentProcess.transaction.id ?? undefined,
          status: paymentProcess.success ? TransactionStatus.APPROVED : TransactionStatus.FAILED,
          cardLastNumbers: data.cardNumber.slice(-4),
        },
        {
          client: tx,
        }
      )
      transaction.useTransaction(tx) // ensures that operation will processed inside of transaction
      await transaction
        .related('products')
        .attach(
          Object.fromEntries(data.products.map((p) => [p.productId, { quantity: p.quantity }]))
        )

      const productsMap = new Map(products.map((p) => [p.id, p]))
      const productsResponse = []

      for (const item of data.products) {
        const product = productsMap.get(item.productId)!

        const subtotal = product.amount * item.quantity

        productsResponse.push({
          productId: product.id,
          quantity: item.quantity,
          unitAmount: product.amount,
          total: subtotal.toFixed(2),
        })
      }

      return {
        transactionId: transaction.id,
        status: transaction.status,
        totalPurchase: amount.toFixed(2),
        products: productsResponse,
      }
    })
  }
}
