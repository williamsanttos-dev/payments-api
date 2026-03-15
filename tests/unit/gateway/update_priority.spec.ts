import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'

import Gateway from '#models/gateway'
import { GatewayService } from '#services/gateway_service'

test.group('GatewayService | updatePriority', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
  })

  group.each.teardown(async () => {
    await db.rollbackGlobalTransaction()
  })

  test('should update gateway priority', async ({ assert }) => {
    const gateway = await Gateway.create({
      name: 'Gateway A',
      isActive: true,
      priority: 1,
    })

    const updated = await GatewayService.updatePriority(gateway.id.toString(), 5)

    assert.equal(updated.priority, 5)

    const persisted = await Gateway.find(gateway.id)

    assert.exists(persisted)
    assert.equal(persisted!.priority, 5)
  })

  test('should throw error when gateway does not exist', async ({ assert }) => {
    await assert.rejects(() => GatewayService.updatePriority('999999', 2), 'Gateway not found')
  })
})
