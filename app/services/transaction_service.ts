import Transaction from '#models/transaction'
import { Exception } from '@adonisjs/core/exceptions'

export class TransactionService {
  static async index() {
    const transactions = await Transaction.all()
    return transactions
  }
  static async show(id: string) {
    const transaction = await Transaction.find(id)
    if (!transaction)
      throw new Exception('Transaction not found', {
        status: 404,
      })
    return transaction
  }
}
