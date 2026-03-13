import { ClientService } from '#services/client_service'
import type { HttpContext } from '@adonisjs/core/http'

export default class ClientsController {
  async index({ response }: HttpContext) {
    const clients = await ClientService.index()

    return response.ok({
      data: clients,
    })
  }
  async show({ params, response }: HttpContext) {
    const client = await ClientService.show(params.id)
    return response.ok({ data: client })
  }
}
