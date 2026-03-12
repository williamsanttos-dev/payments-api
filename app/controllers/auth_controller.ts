import type { HttpContext } from '@adonisjs/core/http'
import { signupValidator, loginValidator } from '#validators/user'
import AuthService from '#services/auth_service'

export default class AuthController {
  async signup({ request, response }: HttpContext) {
    const payload = await request.validateUsing(signupValidator)

    await AuthService.signup(payload)

    return response.ok({
      message: 'User created successfully',
    })
  }
  async login({ request, response }: HttpContext) {
    const payload = await request.validateUsing(loginValidator)

    const accessToken = await AuthService.login(payload)

    return response.ok({
      accessToken,
    })
  }
}
