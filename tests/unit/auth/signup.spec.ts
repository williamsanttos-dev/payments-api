import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'

import AuthService from '#services/auth_service'
import User from '#models/user'
import { UserRole } from '../../../app/enums/user_role.ts'

test.group('AuthService | signup', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
  })

  group.each.teardown(async () => {
    await db.rollbackGlobalTransaction()
  })

  test('should create a user', async ({ assert }) => {
    const user = await AuthService.signup({
      fullName: 'John Doe',
      email: 'john@email.com',
      password: '12345678',
      role: UserRole.USER,
    })

    assert.exists(user.id)
    assert.equal(user.email, 'john@email.com')
    assert.equal(user.fullName, 'John Doe')
  })

  test('should hash password before saving', async ({ assert }) => {
    const user = await AuthService.signup({
      fullName: 'Jane Doe',
      email: 'jane@email.com',
      password: '12345678',
      role: UserRole.USER,
    })

    assert.notEqual(user.password, '12345678')

    const exists = await User.find(user.id)

    assert.exists(exists)
    assert.notEqual(exists!.password, '12345678')
  })
})
