import User from '#models/user'
import type { LoginData, SignupData } from '#validators/user'
import hash from '@adonisjs/core/services/hash'
import { Exception } from '@adonisjs/core/exceptions'
import env from '#start/env'

import jwt from 'jsonwebtoken'

export default class AuthService {
  static async signup(data: SignupData) {
    return await User.create(data)
  }
  static async login(data: LoginData) {
    const user = await User.findBy('email', data.email)

    if (!user || !(await hash.verify(user?.password, data.password)))
      throw new Exception('Invalid credentials', { status: 401 })

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      env.get('JWT_SECRET'),
      { expiresIn: '8h' }
    )
    return token
  }
}
