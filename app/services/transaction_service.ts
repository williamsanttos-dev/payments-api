import Transaction from '#models/transaction'
import { inject } from '@adonisjs/core'
import { Exception } from '@adonisjs/core/exceptions'
import { GatewayManager } from '../gateways/gateway_manager.ts'
import Gateway from '#models/gateway'
import { TransactionStatus } from '../enums/transaction_status.ts'
import db from '@adonisjs/lucid/services/db'

@inject()
export class TransactionService {
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

      await Transaction.query({ client: tx })
        .where({
          id: transaction.id,
          status: TransactionStatus.APPROVED,
        })
        .update({
          status: TransactionStatus.REFUNDED,
        })

      return transaction
    })
  }
}
