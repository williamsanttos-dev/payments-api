import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Gateway extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare isActive: boolean

  @column()
  declare priority: number
}
