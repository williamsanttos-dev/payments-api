import Transaction from '#models/transaction'
import { inject } from '@adonisjs/core'
import { Exception } from '@adonisjs/core/exceptions'
import { GatewayManager } from '../gateways/gateway_manager.ts'
import Gateway from '#models/gateway'
import { TransactionStatus } from '../enums/transaction_status.ts'
import db from '@adonisjs/lucid/services/db'
import { TransactionData } from '#validators/transaction'
import Product from '#models/product'
import Client from '#models/client'

@inject()
export class TransactionService {
  async create(data: TransactionData) {
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
        totalTransaction: amount.toFixed(2),
        products: productsResponse,
      }
    })
  }
  constructor(private readonly gatewayManager: GatewayManager) {}
  static async index() {
    const transactions = await Transaction.query().preload('products').orderBy('id', 'desc')

    return transactions.map((t) => ({
      ...t.serialize(),
      amount: Number((t.amount / 100).toFixed(2)), // convert cents for real (R$)
    }))
  }
  static async show(id: string) {
    const transaction = await Transaction.query().where('id', id).preload('products').first()
    if (!transaction)
      throw new Exception('Transaction not found', {
        status: 404,
      })

    const { amount, ...rest } = transaction.serialize()
    return {
      ...rest,
      amount: Number((amount / 100).toFixed(2)), // convert cents for real (R$)
    }
  }
  async refund(id: string) {
    return await db.transaction(async (tx) => {
      const transaction = await Transaction.query({ client: tx })
        .where({
          id,
          status: TransactionStatus.APPROVED,
        })
        .first()
      if (!transaction)
        throw new Exception('The transaction not was approved and do not be refunded', {
          status: 400,
        })

      if (!transaction.externalId)
        throw new Exception('Transaction external id missing', { status: 500 })
      if (!transaction.gatewayId) throw new Exception('gatewayId id missing', { status: 500 })

      const externalTransactionId = transaction.externalId

      const gateway = await Gateway.query({ client: tx })
        .where({
          id: transaction.gatewayId,
          is_active: true,
        })
        .first()
      if (!gateway)
        throw new Exception('Gateway responsible by transaction not found or inactive', {
          status: 500,
        })

      await this.gatewayManager.refund({
        externalTransactionId,
        gatewayName: gateway.name,
      })

      transaction.useTransaction(tx)
      transaction.status = TransactionStatus.REFUNDED
      await transaction.save()

      return transaction
    })
  }
}
