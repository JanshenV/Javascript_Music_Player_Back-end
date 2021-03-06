import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, column, belongsTo } from '@ioc:Adonis/Lucid/Orm'
import User from './User'

export default class VerifyEmailToken extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public token: string

  @column()
  public user_id: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

}
