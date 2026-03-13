import { TransactionSchema } from '#database/schema'
import { column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

import { TransactionStatus } from '../enums/transaction_status.ts'

export default class Transaction extends TransactionSchema {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare clientId: number

  @column()
  declare gatewayId: number

  @column()
  declare externalId: string

  @column()
  declare status: TransactionStatus

  @column()
  declare amount: number

  @column()
  declare cardLastNumbers: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
