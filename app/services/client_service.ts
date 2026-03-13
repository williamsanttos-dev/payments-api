import Client from '#models/client'
import { Exception } from '@adonisjs/core/exceptions'

export class ClientService {
  static async index() {
    return await Client.all()
  }
  static async show(id: string) {
    const client = await Client.find(id)
    if (!client)
      throw new Exception('Client', {
        status: 404,
      })
    return client
  }
}
