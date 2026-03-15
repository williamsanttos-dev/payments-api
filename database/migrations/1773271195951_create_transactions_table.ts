import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'transactions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table
        .integer('client_id')
        .unsigned()
        .references('id')
        .inTable('clients')
        .onDelete('CASCADE')
        .notNullable()

      table
        .integer('gateway_id')
        .unsigned()
        .references('id')
        .inTable('gateways')
        .onDelete('CASCADE')

      table.string('external_id')

      table.enum('status', ['APPROVED', 'FAILED', 'REFUNDED']).notNullable()

      table.integer('amount').notNullable()

      table.string('card_last_numbers').notNullable()

      table.timestamps(true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
