import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'

import Gateway from '#models/gateway'
import { GatewayService } from '#services/gateway_service'

test.group('GatewayService | updateActive', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
  })

  group.each.teardown(async () => {
    await db.rollbackGlobalTransaction()
  })

  test('should toggle gateway active status', async ({ assert }) => {
    const gateway = await Gateway.create({
      name: 'Gateway A',
      isActive: true,
      priority: 1,
    })

    const updated = await GatewayService.updateActive(gateway.id.toString())

    assert.equal(updated.isActive, false)

    const persisted = await Gateway.find(gateway.id)

    assert.exists(persisted)
    assert.equal(persisted!.isActive, false)
  })

  test('should throw error when gateway does not exist', async ({ assert }) => {
    await assert.rejects(() => GatewayService.updateActive('999999'), 'Gateway not found')
  })
})
