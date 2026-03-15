import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

import jwt from 'jsonwebtoken'
import env from '#start/env'

import type { AuthUser } from '../types/auth_user.ts'

export default class Auth {
  async handle(ctx: HttpContext, next: NextFn, args: string[]) {
    const authHeader = ctx.request.header('authorization')
    if (!authHeader) return ctx.response.unauthorized({ error: 'Token missing' })

    const token = authHeader.split(' ')[1]

    try {
      const payload = jwt.verify(token, env.get('JWT_SECRET')) as AuthUser

      ctx.request['user'] = payload

      if (args.length && !args.includes(payload.role))
        return ctx.response.forbidden({
          error: 'Insufficient permissions',
        })

      await next()
    } catch (err) {
      return ctx.response.unauthorized({ error: 'Invalid token' })
    }
  }
}
