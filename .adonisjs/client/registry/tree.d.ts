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
  clients: {
    index: typeof routes['clients.index']
    show: typeof routes['clients.show']
  }
  transactions: {
    index: typeof routes['transactions.index']
    show: typeof routes['transactions.show']
  }
  gateways: {
    updateActive: typeof routes['gateways.update_active']
    updatePriority: typeof routes['gateways.update_priority']
  }
}
