import { test } from '@japa/runner'

import User from '#models/user'
import { UsersService } from '#services/user_service'

test.group('UsersService | show', () => {
  test('should return user when found', async ({ assert }) => {
    const fakeUser = {
      id: 1,
      email: 'user@email.com',
      fullName: 'Test User',
    }

    const original = User.find

    User.find = async () => fakeUser as any

    const result = await UsersService.show('1')

    assert.equal(result.email, 'user@email.com')
    assert.equal(result.fullName, 'Test User')

    User.find = original
  })

  test('should throw exception when user not found', async ({ assert }) => {
    const original = User.find

    User.find = async () => null

    await assert.rejects(() => UsersService.show('1'), 'User not found')

    User.find = original
  })
})
