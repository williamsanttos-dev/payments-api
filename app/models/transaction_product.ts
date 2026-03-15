import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class TransactionProduct extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare transactionId: number

  @column()
  declare productId: number

  @column()
  declare quantity: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
