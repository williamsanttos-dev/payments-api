import type { UserRole } from '../enums/user_role.ts'

export type AuthUser = {
  userId: number
  role: UserRole
}
