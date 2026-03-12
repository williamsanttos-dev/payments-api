import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import jwt from 'jsonwebtoken'

import AuthService from '#services/auth_service'
import User from '#models/user'
import { UserRole } from '../../../app/enums/user_role.ts'
import env from '#start/env'

test.group('AuthService | login', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
  })

  group.each.teardown(async () => {
    await db.rollbackGlobalTransaction()
  })

  test('should login and return a JWT token', async ({ assert }) => {
    const user = await User.create({
      fullName: 'John Doe',
      email: 'john@email.com',
      password: '12345678',
      role: UserRole.USER,
    })

    const token = await AuthService.login({
      email: 'john@email.com',
      password: '12345678',
    })

    assert.isString(token)

    const decoded = jwt.verify(token, env.get('JWT_SECRET')) as any

    assert.equal(decoded.userId, user.id)
    assert.equal(decoded.role, user.role)
  })

  test('should throw error if email does not exist', async ({ assert }) => {
    await assert.rejects(
      () =>
        AuthService.login({
          email: 'notfound@email.com',
          password: '12345678',
        }),
      'Invalid credentials'
    )
  })

  test('should throw error if password is invalid', async ({ assert }) => {
    await User.create({
      fullName: 'John Doe',
      email: 'john@email.com',
      password: '12345678',
      role: UserRole.USER,
    })

    await assert.rejects(
      () =>
        AuthService.login({
          email: 'john@email.com',
          password: 'wrong-password',
        }),
      'Invalid credentials'
    )
  })
})
