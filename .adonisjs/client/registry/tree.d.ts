/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  auth: {
    auth: {
      signup: typeof routes['auth.auth.signup']
      login: typeof routes['auth.auth.login']
    }
  }
}
