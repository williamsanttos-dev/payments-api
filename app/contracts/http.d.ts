import '@adonisjs/http-server/build/standalone'
import type { AuthUser } from '../types/auth_user.ts'

declare module '@adonisjs/http-server' {
  interface HttpRequest {
    user?: AuthUser
  }
}
