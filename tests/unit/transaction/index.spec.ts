import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'

import Transaction from '#models/transaction'
import { TransactionService } from '#services/transaction_service'
import { TransactionStatus } from '../../../app/enums/transaction_status.ts'

test.group('TransactionService | index', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
  })

  group.each.teardown(async () => {
    await db.rollbackGlobalTransaction()
  })

  test('should return all transactions', async ({ assert }) => {
    await Transaction.create({
      clientId: 1,
      gatewayId: 100,
      amount: 5000,
      externalId: 'ext_1',
      status: TransactionStatus.PENDING,
      cardLastNumbers: '1234',
    })

    await Transaction.create({
      clientId: 1,
      gatewayId: 200,
      amount: 8000,
      externalId: 'ext_2',
      status: TransactionStatus.PENDING,
      cardLastNumbers: '4321',
    })

    const transactions = await TransactionService.index()

    assert.isArray(transactions)

    const cardLastNumbers = transactions.map((c: any) => c.cardLastNumbers)

    assert.include(cardLastNumbers, '1234')
    assert.include(cardLastNumbers, '4321')
  })
})
