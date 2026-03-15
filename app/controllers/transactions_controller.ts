import { TransactionService } from '#services/transaction_service'
import { transactionValidator } from '#validators/transaction'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class TransactionsController {
  constructor(private readonly transactionService: TransactionService) {}
  async create({ request, response }: HttpContext) {
    const payload = await request.validateUsing(transactionValidator)

    const result = await this.transactionService.create(payload)

    response.ok({ data: result })
  }
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
  async refund({ params, response }: HttpContext) {
    const refund = await this.transactionService.refund(params.id)
    return response.ok({
      data: refund,
    })
  }
}
