import Gateway from '#models/gateway'
import { GatewayFactory } from './gateway_factory.ts'
import type { TransactionData } from './payment_gateway_interface.ts'

export type GatewayProcessResult =
  | {
      success: true
      gatewayId: number
      transaction: { id: string }
    }
  | {
      success: false
      gatewayId: null
      transaction: { id: null }
    }

export class GatewayManager {
  async createTransaction(data: TransactionData): Promise<GatewayProcessResult> {
    const gateways = await Gateway.query().where('is_active', true).orderBy('priority', 'asc')

    for (const gatewayConfig of gateways) {
      const gateway = GatewayFactory.make(gatewayConfig.name)

      try {
        const result = await gateway.createTransaction(data)

        return {
          success: true,
          gatewayId: gatewayConfig.id,
          transaction: {
            id: result.id,
          },
        }
      } catch (err) {
        console.error(`Gateway ${gatewayConfig.name} failed`, err)
        continue
      }
    }
    console.error(`All gateways failed...`)
    return {
      success: false,
      gatewayId: null,
      transaction: {
        id: null,
      },
    }
  }
}
