import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'

import Client from '#models/client'
import { ClientService } from '#services/client_service'

test.group('ClientService | index', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
  })

  group.each.teardown(async () => {
    await db.rollbackGlobalTransaction()
  })

  test('should return all clients', async ({ assert }) => {
    await Client.create({
      name: 'John Doe',
      email: 'john@email.com',
    })

    await Client.create({
      name: 'Jane Doe',
      email: 'jane@email.com',
    })

    const clients = await ClientService.index()

    assert.isArray(clients)

    const emails = clients.map((c) => c.email)

    assert.include(emails, 'john@email.com')
    assert.include(emails, 'jane@email.com')
  })
})
