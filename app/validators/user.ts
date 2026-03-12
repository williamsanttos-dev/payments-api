import vine from '@vinejs/vine'
import type { Infer } from '@vinejs/vine/types'

import { UserRole } from '../enums/user_role.ts'

const email = () => vine.string().email().maxLength(254)
const password = () => vine.string().minLength(8).maxLength(32)

export const signupValidator = vine.create({
  fullName: vine.string().trim().minLength(3).maxLength(100),
  email: email().toLowerCase().unique({ table: 'users', column: 'email' }),
  password: password(),
  role: vine.enum(Object.values(UserRole)),
})
export type SignupData = Infer<typeof signupValidator>

export const loginValidator = vine.create({
  email: email(),
  password: vine.string(),
})
export type LoginData = Infer<typeof loginValidator>
