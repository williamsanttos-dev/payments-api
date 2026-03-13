import { PurchaseService } from '#services/purchase_service'
import { purchaseValidator } from '#validators/purchase'
import type { HttpContext } from '@adonisjs/core/http'

export default class PurchasesController {
  async handle({ request, response }: HttpContext) {
    const payload = await request.validateUsing(purchaseValidator)

    const result = await PurchaseService.handle(payload)

    response.ok({ data: result })
  }
}
