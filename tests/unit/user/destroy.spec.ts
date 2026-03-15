import { test } from '@japa/runner'
import User from '#models/user'
import { UsersService } from '#services/user_service'

test.group('UsersService | destroy', () => {
  test('should throw error if user not found', async ({ assert }) => {
    const original = User.find

    User.find = async () => null

    await assert.rejects(() => UsersService.destroy('1'), 'User not found')

    User.find = original
  })

  test('should set isActive to false', async ({ assert }) => {
    const fakeUser: any = {
      id: 1,
      isActive: true,
      merge(data: any) {
        Object.assign(this, data)
      },
      async save() {},
    }

    const original = User.find

    User.find = async () => fakeUser

    await UsersService.destroy('1')

    assert.isFalse(fakeUser.isActive)

    User.find = original
  })
})
