import { Gateway1 } from './gateway1.ts'
import { Gateway2 } from './gateway2.ts'
import { type PaymentGateway } from './payment_gateway_interface.ts'

export class GatewayFactory {
  static make(name: string): PaymentGateway {
    switch (name) {
      case 'gateway-1':
        return new Gateway1()
      case 'gateway-2':
        return new Gateway2()
      default:
        throw new Error('Gateway not supported')
    }
  }
}
