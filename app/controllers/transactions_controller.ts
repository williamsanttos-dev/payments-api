import { TransactionService } from '#services/transaction_service'
import type { HttpContext } from '@adonisjs/core/http'

export default class TransactionsController {
  async index({ response }: HttpContext) {
    const transactions = await TransactionService.index()
    return response.ok({ data: transactions })
  }
  async show({ params, response }: HttpContext) {
    const transaction = await TransactionService.show(params.id)
    return response.ok({
      data: transaction,
    })
  }
}
