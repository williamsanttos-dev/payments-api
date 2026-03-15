import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'

import Transaction from '#models/transaction'
import { TransactionService } from '#services/transaction_service'
import { TransactionStatus } from '../../../app/enums/transaction_status.ts'
import Client from '#models/client'
import Gateway from '#models/gateway'

test.group('TransactionService | show', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
  })

  group.each.teardown(async () => {
    await db.rollbackGlobalTransaction()
  })

  test('should return transaction when it exists', async ({ assert }) => {
    const clientId = await Client.create({
      name: 'johnDoe',
      email: 'johnDoe567@gmail.com',
    })
    const gatewayId = await Gateway.create({
      name: 'gateway-test-001',
      priority: 1,
    })

    const transaction = await Transaction.create({
      clientId: clientId.id,
      gatewayId: gatewayId.id,
      amount: 5000,
      externalId: 'ext_1',
      status: TransactionStatus.APPROVED,
      cardLastNumbers: '1234',
    })

    const result = await TransactionService.show(transaction.id.toString())

    assert.exists(result)
    assert.equal(result.id, transaction.id)
  })

  test('should throw error when transaction does not exist', async ({ assert }) => {
    await assert.rejects(() => TransactionService.show('999999'), 'Transaction not found')
  })
})
