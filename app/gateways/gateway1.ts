import env from '#start/env'

import type { PaymentGateway, TransactionData } from './payment_gateway_interface.ts'

export class Gateway1 implements PaymentGateway {
  async createTransaction(data: TransactionData): Promise<any> {
    try {
      const response = await fetch(`${env.get('URL_GATEWAY')}:3001/transactions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${await this.getToken()}`,
        },
        body: JSON.stringify(data),
      })

      if (response.status !== 201) {
        const body = await response.text()

        console.error('Gateway returned unexpected status', {
          status: response.status,
          body,
        })

        throw new Error('Gateway transaction failed')
      }

      return await response.json()
    } catch (err) {
      console.error('Gateway request failed', err)

      throw err
    }
  }
  async refund(ExternalTransactionId: string): Promise<any> {
    try {
      const response = await fetch(
        `${env.get('URL_GATEWAY')}:3001/transactions/${ExternalTransactionId}/charge_back`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${await this.getToken()}`,
          },
        }
      )

      if (response.status !== 201) {
        const body = await response.text()

        console.error('Gateway returned unexpected status', {
          status: response.status,
          body,
        })

        throw new Error('Gateway transaction refund failed')
      }

      return {
        gateway: 'gateway-1',
        refundedAt: new Date(),
      }
    } catch (err) {
      console.error('Gateway request failed', err)

      throw err
    }
  }

  private async getToken(): Promise<string> {
    const response = await fetch(`${env.get('URL_GATEWAY')}:3001/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'dev@betalent.tech',
        token: 'FEC9BB078BF338F464F96B48089EB498',
      }),
    })

    const body = (await response.json()) as any
    return body.token
  }
}
