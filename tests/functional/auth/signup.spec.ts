import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import User from '#models/user'

import { UserRole } from '../../../app/enums/user_role.ts'

test.group('Auth | signup', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
  })

  group.each.teardown(async () => {
    await db.rollbackGlobalTransaction()
  })

  test('should create a user', async ({ client, assert }) => {
    const response = await client.post('/api/v1/auth/signup').json({
      fullName: 'John Doe',
      email: 'john@email.com',
      password: '12345678',
      role: UserRole.USER,
    })

    response.assertStatus(200)

    response.assertBodyContains({
      message: 'User created successfully',
    })

    const user = await User.findBy('email', 'john@email.com')

    assert.exists(user)
    assert.equal(user!.fullName, 'John Doe')
  })

  test('should fail with invalid email', async ({ client }) => {
    const response = await client.post('/api/v1/auth/signup').json({
      fullName: 'John Doe',
      email: 'invalid-email',
      password: '12345678',
      role: UserRole.USER,
    })

    response.assertStatus(422)
  })

  test('should not allow duplicate email', async ({ client }) => {
    await client.post('/api/v1/auth/signup').json({
      fullName: 'John Doe',
      email: 'john@email.com',
      password: '12345678',
      role: UserRole.USER,
    })

    const response = await client.post('/api/v1/auth/signup').json({
      fullName: 'John Doe',
      email: 'john@email.com',
      password: '12345678',
      role: UserRole.USER,
    })

    response.assertStatus(422)
  })
})
