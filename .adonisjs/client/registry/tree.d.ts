/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  auth: {
    signup: typeof routes['auth.signup']
    login: typeof routes['auth.login']
  }
  products: {
    store: typeof routes['products.store']
    index: typeof routes['products.index']
    show: typeof routes['products.show']
    update: typeof routes['products.update']
    destroy: typeof routes['products.destroy']
  }
  purchases: typeof routes['purchases']
}
