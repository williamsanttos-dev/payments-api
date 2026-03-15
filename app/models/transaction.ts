import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

import { TransactionStatus } from '../enums/transaction_status.ts'
import Product from './product.ts'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'

export default class Transaction extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare clientId: number

  @column()
  declare gatewayId: number | null

  @column()
  declare externalId: string | null

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

  @manyToMany(() => Product, {
    pivotTable: 'transaction_products',
    pivotColumns: ['quantity'],
  })
  declare products: ManyToMany<typeof Product>
}
