import { PurchaseService } from '#services/purchase_service'
import { purchaseValidator } from '#validators/purchase'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class PurchasesController {
  constructor(private readonly purchaseService: PurchaseService) {}
  async handle({ request, response }: HttpContext) {
    const payload = await request.validateUsing(purchaseValidator)

    const result = await this.purchaseService.handle(payload)

    response.ok({ data: result })
  }
}
