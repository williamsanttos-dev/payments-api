import { BaseModel, column, manyToMany, computed } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'

import Transaction from './transaction.ts'

export default class Product extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare amount: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @manyToMany(() => Transaction, {
    pivotTable: 'transaction_products',
    pivotColumns: ['quantity'],
  })
  declare transactions: ManyToMany<typeof Transaction>

  @computed()
  get quantity() {
    return this.$extras.pivot_quantity
  }
}
