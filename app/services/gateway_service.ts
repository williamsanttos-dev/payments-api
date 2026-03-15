import Gateway from '#models/gateway'
import { Exception } from '@adonisjs/core/exceptions'

export class GatewayService {
  static async updateActive(id: string) {
    const gateway = await Gateway.find(id)
    if (!gateway)
      throw new Exception('Gateway not found', {
        status: 404,
      })

    gateway.isActive = !gateway.isActive

    await gateway.save()

    return gateway
  }
  static async updatePriority(id: string, priority: number) {
    const gateway = await Gateway.find(id)
    if (!gateway)
      throw new Exception('Gateway not found', {
        status: 404,
      })

    gateway.priority = priority
    await gateway.save()

    return gateway
  }
}
