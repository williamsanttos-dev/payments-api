import User from '#models/user'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { UserRole } from '../../app/enums/user_role.ts'

export default class extends BaseSeeder {
  async run() {
    // Write your database queries inside the run method
    await User.create({
      fullName: 'john Doe',
      email: 'johnDoe998@example.com',
      password: 'JohnDoe001#',
      isActive: true,
      role: UserRole.ADMIN,
    })
  }
}
