import { GatewayService } from '#services/gateway_service'
import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

export default class GatewaysController {
  async updateActive({ params, response }: HttpContext) {
    const gateway = await GatewayService.updateActive(params.id)

    return response.ok({
      data: gateway,
    })
  }
  async updatePriority({ params, request, response }: HttpContext) {
    const priority = Number(request.only(['priority']).priority)

    if (!Number.isInteger(priority))
      throw new Exception('Priority must be an integer', {
        status: 400,
      })

    const gateway = await GatewayService.updatePriority(params.id, priority)

    return response.ok({
      data: gateway,
    })
  }
}
