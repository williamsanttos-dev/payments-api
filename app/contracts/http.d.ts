import '@adonisjs/http-server/build/standalone'
import type { UserRole } from '../enums/user_role.ts'

declare module '@adonisjs/http-server' {
  interface HttpRequest {
    user?: {
      userId: string
      role: UserRole
    }
  }
}
