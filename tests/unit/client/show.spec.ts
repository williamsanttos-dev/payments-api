import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'

import Client from '#models/client'
import { ClientService } from '#services/client_service'

test.group('ClientService | show', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
  })

  group.each.teardown(async () => {
    await db.rollbackGlobalTransaction()
  })

  test('should return a client when it exists', async ({ assert }) => {
    const client = await Client.create({
      name: 'John Doe',
      email: 'john@email.com',
    })

    const result = await ClientService.show(client.id.toString())

    assert.exists(result)
    assert.equal(result.client.id, client.id)
    assert.equal(result.client.name, client.name)
    assert.equal(result.client.email, client.email)
  })

  test('should throw error if client does not exist', async ({ assert }) => {
    await assert.rejects(() => ClientService.show('99999'), 'Client not found')
  })
})
