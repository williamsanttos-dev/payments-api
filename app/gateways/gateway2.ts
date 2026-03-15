import env from '#start/env'

import type { PaymentGateway, TransactionData } from './payment_gateway_interface.ts'

export class Gateway2 implements PaymentGateway {
  async createTransaction(data: TransactionData): Promise<any> {
    try {
      const response = await fetch(`${env.get('URL_GATEWAY')}:3002/transacoes`, {
        method: 'POST',
        headers: {
          'Gateway-Auth-Token': 'tk_f2198cc671b5289fa856',
          'Gateway-Auth-Secret': '3d15e8ed6131446ea7e3456728b1211f',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          valor: data.amount,
          nome: data.name,
          email: data.email,
          numeroCartao: data.cardNumber,
          cvv: data.cvv,
        }),
      })

      if (response.status !== 201) {
        const body = await response.text()

        console.error('Gateway returned unexpected status', {
          status: response.status,
          body,
        })

        throw new Error('Gateway transaction failed')
      }
      // melhorar handle de erro
      return await response.json()
    } catch (err) {
      console.error('Gateway request failed', err)

      throw err
    }
  }
}
