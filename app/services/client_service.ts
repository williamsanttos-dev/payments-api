import Client from '#models/client'
import Transaction from '#models/transaction'
import { Exception } from '@adonisjs/core/exceptions'

export class ClientService {
  static async index() {
    return await Client.all()
  }
  static async show(id: string) {
    const client = await Client.find(id)
    if (!client)
      throw new Exception('Client not found', {
        status: 404,
      })

    const transactions = await Transaction.query().where('clientId', id)

    return { client, transactions }
  }
}
