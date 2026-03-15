import User from '#models/user'
import type { UpdateUserData } from '#validators/user'
import { Exception } from '@adonisjs/core/exceptions'

export class UsersService {
  static async show(id: string) {
    const user = await User.find(id)
    if (!user)
      throw new Exception('User not found', {
        status: 404,
      })
    return user
  }
  static async index() {
    return await User.all()
  }
  static async update(data: UpdateUserData, id: string) {
    if (
      (data.fullName === undefined || data.fullName === null) &&
      (!data.password || data.password.trim() === '')
    ) {
      throw new Exception('At least one field must be updated', { status: 400 })
    }

    const user = await User.find(id)
    if (!user)
      throw new Exception('User not found', {
        status: 404,
      })

    user.merge({
      fullName: data.fullName,
      password: data.password,
    })
    await user.save()

    return user
  }
  static async destroy(id: string) {
    const user = await User.find(id)
    if (!user)
      throw new Exception('User not found', {
        status: 404,
      })

    user.merge({
      isActive: false,
    })
    await user.save()
    return
  }
}
