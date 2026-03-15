import { UsersService } from '#services/user_service'
import type { HttpContext } from '@adonisjs/core/http'

import { Exception } from '@adonisjs/core/exceptions'
import { updateUserValidator } from '#validators/user'

import type { AuthUser } from '../types/auth_user.ts'

export default class UsersController {
  async show({ params, request, response }: HttpContext) {
    const authUser = request.user

    if (!authUser || !this.canAccessUser(authUser, Number(params.id)))
      throw new Exception('Unauthorized', {
        status: 401,
      })

    const user = await UsersService.show(params.id)

    return response.ok({ data: user })
  }
  async index({ response }: HttpContext) {
    const users = await UsersService.index()
    return response.ok({ data: users })
  }
  async update({ params, request, response }: HttpContext) {
    const authUser = request.user

    if (!authUser || !this.canAccessUser(authUser, Number(params.id)))
      throw new Exception('Unauthorized', {
        status: 401,
      })

    const payload = await request.validateUsing(updateUserValidator)

    const user = await UsersService.update(payload, params.id)

    return response.ok({ data: user })
  }
  async destroy({ params, request, response }: HttpContext) {
    const authUser = request.user

    if (!authUser || !this.canAccessUser(authUser, Number(params.id)))
      throw new Exception('Unauthorized', {
        status: 401,
      })
    await UsersService.destroy(params.id)

    return response.noContent()
  }

  private canAccessUser(authUser: AuthUser, targetUserId: number) {
    return authUser.role === 'ADMIN' || authUser.userId === targetUserId
  }
}
