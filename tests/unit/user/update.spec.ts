import { test } from '@japa/runner'
import User from '#models/user'
import { UsersService } from '#services/user_service'

test.group('UsersService | update', () => {
  test('should throw error if no fields are provided', async ({ assert }) => {
    await assert.rejects(() => UsersService.update({}, '1'), 'At least one field must be updated')
  })

  test('should throw error if user not found', async ({ assert }) => {
    const original = User.find

    User.find = async () => null

    await assert.rejects(() => UsersService.update({ fullName: 'New Name' }, '1'), 'User not found')

    User.find = original
  })

  test('should update fullName', async ({ assert }) => {
    const fakeUser: any = {
      id: 1,
      fullName: 'Old Name',
      password: '123',
      merge(data: any) {
        Object.assign(this, data)
      },
      async save() {},
    }

    const original = User.find
    User.find = async () => fakeUser

    const result = await UsersService.update({ fullName: 'New Name' }, '1')

    assert.equal(result.fullName, 'New Name')

    User.find = original
  })

  test('should update password', async ({ assert }) => {
    const fakeUser: any = {
      id: 1,
      fullName: 'User',
      password: 'old',
      merge(data: any) {
        Object.assign(this, data)
      },
      async save() {},
    }

    const original = User.find
    User.find = async () => fakeUser

    const result = await UsersService.update({ password: 'newPassword' }, '1')

    assert.equal(result.password, 'newPassword')

    User.find = original
  })

  test('should update fullName and password', async ({ assert }) => {
    const fakeUser: any = {
      id: 1,
      fullName: 'Old',
      password: 'old',
      merge(data: any) {
        Object.assign(this, data)
      },
      async save() {},
    }

    const original = User.find
    User.find = async () => fakeUser

    const result = await UsersService.update({ fullName: 'New', password: 'newPassword' }, '1')

    assert.equal(result.fullName, 'New')
    assert.equal(result.password, 'newPassword')

    User.find = original
  })
})
