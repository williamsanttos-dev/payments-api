import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'

import Transaction from '#models/transaction'
import { TransactionService } from '#services/transaction_service'
import { TransactionStatus } from '../../../app/enums/transaction_status.ts'

test.group('TransactionService | show', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
  })

  group.each.teardown(async () => {
    await db.rollbackGlobalTransaction()
  })

  test('should return transaction when it exists', async ({ assert }) => {
    const transaction = await Transaction.create({
      clientId: 1,
      gatewayId: 100,
      amount: 5000,
      externalId: 'ext_1',
      status: TransactionStatus.PENDING,
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
