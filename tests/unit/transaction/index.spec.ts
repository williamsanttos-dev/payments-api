import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'

import Transaction from '#models/transaction'
import { TransactionService } from '#services/transaction_service'
import { TransactionStatus } from '../../../app/enums/transaction_status.ts'
import Client from '#models/client'
import Gateway from '#models/gateway'

test.group('TransactionService | index', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
  })

  group.each.teardown(async () => {
    await db.rollbackGlobalTransaction()
  })

  test('should return all transactions', async ({ assert }) => {
    const clientId = await Client.create({
      name: 'johnDoe',
      email: 'johnDoe567@gmail.com',
    })
    const gatewayId = await Gateway.create({
      name: 'gateway-test-001',
      priority: 1,
    })

    await Transaction.create({
      clientId: clientId.id,
      gatewayId: gatewayId.id,
      amount: 5000,
      externalId: 'ext_1',
      status: TransactionStatus.APPROVED,
      cardLastNumbers: '1234',
    })

    await Transaction.create({
      clientId: clientId.id,
      gatewayId: gatewayId.id,
      amount: 8000,
      externalId: 'ext_2',
      status: TransactionStatus.REFUNDED,
      cardLastNumbers: '4321',
    })

    const transactions = await TransactionService.index()

    assert.isArray(transactions)

    const cardLastNumbers = transactions.map((c: any) => c.cardLastNumbers)

    assert.include(cardLastNumbers, '1234')
    assert.include(cardLastNumbers, '4321')
  })
})
