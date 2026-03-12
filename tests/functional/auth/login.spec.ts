import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import User from '#models/user'

import { UserRole } from '../../../app/enums/user_role.ts'

test.group('Auth | login', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
  })

  group.each.teardown(async () => {
    await db.rollbackGlobalTransaction()
  })

  test('should login successfully and return access token', async ({ client }) => {
    await User.create({
      fullName: 'John Doe',
      email: 'john@email.com',
      password: '12345678',
      role: UserRole.USER,
    })

    const response = await client.post('/api/v1/auth/login').json({
      email: 'john@email.com',
      password: '12345678',
    })

    response.assertStatus(200)

    response.assertBodyContains({
      accessToken: response.body().accessToken,
    })
  })

  test('should fail with invalid password', async ({ client }) => {
    await User.create({
      fullName: 'John Doe',
      email: 'john@email.com',
      password: '12345678',
      role: UserRole.USER,
    })

    const response = await client.post('/api/v1/auth/login').json({
      email: 'john@email.com',
      password: 'wrong-password',
    })

    response.assertStatus(401)
  })

  test('should fail when user does not exist', async ({ client }) => {
    const response = await client.post('/api/v1/auth/login').json({
      email: 'notfound@email.com',
      password: '12345678',
    })

    response.assertStatus(401)
  })

  test('should fail with invalid email format', async ({ client }) => {
    const response = await client.post('/api/v1/auth/login').json({
      email: 'invalid-email',
      password: '12345678',
    })

    response.assertStatus(422)
  })
})
