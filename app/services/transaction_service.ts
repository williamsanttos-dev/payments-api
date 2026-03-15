import Transaction from '#models/transaction'
import { Exception } from '@adonisjs/core/exceptions'

export class TransactionService {
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
}
