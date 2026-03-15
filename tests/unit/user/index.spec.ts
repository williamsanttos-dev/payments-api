import { test } from '@japa/runner'
import { UsersService } from '#services/user_service'
import User from '#models/user'

test.group('UsersService | index', () => {
  test('should return all users', async ({ assert }) => {
    const fakeUsers = [
      { id: 1, fullName: 'John', email: 'john@mail.com' },
      { id: 2, fullName: 'Jane', email: 'jane@mail.com' },
    ]

    const original = User.all

    User.all = async () => fakeUsers as any

    const result = await UsersService.index()

    assert.equal(result.length, 2)
    assert.equal(result[0].fullName, 'John')
    assert.equal(result[1].email, 'jane@mail.com')

    User.all = original
  })
})
