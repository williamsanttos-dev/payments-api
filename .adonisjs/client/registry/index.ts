/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'auth.signup': {
    methods: ["POST"],
    pattern: '/api/v1/auth/signup',
    tokens: [{"old":"/api/v1/auth/signup","type":0,"val":"api","end":""},{"old":"/api/v1/auth/signup","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/signup","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['auth.signup']['types'],
  },
  'auth.login': {
    methods: ["POST"],
    pattern: '/api/v1/auth/login',
    tokens: [{"old":"/api/v1/auth/login","type":0,"val":"api","end":""},{"old":"/api/v1/auth/login","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/login","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['auth.login']['types'],
  },
  'products.store': {
    methods: ["POST"],
    pattern: '/api/v1/products',
    tokens: [{"old":"/api/v1/products","type":0,"val":"api","end":""},{"old":"/api/v1/products","type":0,"val":"v1","end":""},{"old":"/api/v1/products","type":0,"val":"products","end":""}],
    types: placeholder as Registry['products.store']['types'],
  },
  'products.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/products',
    tokens: [{"old":"/api/v1/products","type":0,"val":"api","end":""},{"old":"/api/v1/products","type":0,"val":"v1","end":""},{"old":"/api/v1/products","type":0,"val":"products","end":""}],
    types: placeholder as Registry['products.index']['types'],
  },
  'products.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/products/:id',
    tokens: [{"old":"/api/v1/products/:id","type":0,"val":"api","end":""},{"old":"/api/v1/products/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/products/:id","type":0,"val":"products","end":""},{"old":"/api/v1/products/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['products.show']['types'],
  },
  'products.update': {
    methods: ["PATCH"],
    pattern: '/api/v1/products/:id',
    tokens: [{"old":"/api/v1/products/:id","type":0,"val":"api","end":""},{"old":"/api/v1/products/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/products/:id","type":0,"val":"products","end":""},{"old":"/api/v1/products/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['products.update']['types'],
  },
  'products.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/products/:id',
    tokens: [{"old":"/api/v1/products/:id","type":0,"val":"api","end":""},{"old":"/api/v1/products/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/products/:id","type":0,"val":"products","end":""},{"old":"/api/v1/products/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['products.destroy']['types'],
  },
  'purchases': {
    methods: ["POST"],
    pattern: '/api/v1/purchases',
    tokens: [{"old":"/api/v1/purchases","type":0,"val":"api","end":""},{"old":"/api/v1/purchases","type":0,"val":"v1","end":""},{"old":"/api/v1/purchases","type":0,"val":"purchases","end":""}],
    types: placeholder as Registry['purchases']['types'],
  },
  'clients.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/clients',
    tokens: [{"old":"/api/v1/clients","type":0,"val":"api","end":""},{"old":"/api/v1/clients","type":0,"val":"v1","end":""},{"old":"/api/v1/clients","type":0,"val":"clients","end":""}],
    types: placeholder as Registry['clients.index']['types'],
  },
  'clients.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/clients/:id',
    tokens: [{"old":"/api/v1/clients/:id","type":0,"val":"api","end":""},{"old":"/api/v1/clients/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/clients/:id","type":0,"val":"clients","end":""},{"old":"/api/v1/clients/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['clients.show']['types'],
  },
  'transactions.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/transactions',
    tokens: [{"old":"/api/v1/transactions","type":0,"val":"api","end":""},{"old":"/api/v1/transactions","type":0,"val":"v1","end":""},{"old":"/api/v1/transactions","type":0,"val":"transactions","end":""}],
    types: placeholder as Registry['transactions.index']['types'],
  },
  'transactions.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/transactions/:id',
    tokens: [{"old":"/api/v1/transactions/:id","type":0,"val":"api","end":""},{"old":"/api/v1/transactions/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/transactions/:id","type":0,"val":"transactions","end":""},{"old":"/api/v1/transactions/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['transactions.show']['types'],
  },
  'gateways.update_active': {
    methods: ["PATCH"],
    pattern: '/api/v1/gateways/:id/activate',
    tokens: [{"old":"/api/v1/gateways/:id/activate","type":0,"val":"api","end":""},{"old":"/api/v1/gateways/:id/activate","type":0,"val":"v1","end":""},{"old":"/api/v1/gateways/:id/activate","type":0,"val":"gateways","end":""},{"old":"/api/v1/gateways/:id/activate","type":1,"val":"id","end":""},{"old":"/api/v1/gateways/:id/activate","type":0,"val":"activate","end":""}],
    types: placeholder as Registry['gateways.update_active']['types'],
  },
  'gateways.update_priority': {
    methods: ["PATCH"],
    pattern: '/api/v1/gateways/:id/priority',
    tokens: [{"old":"/api/v1/gateways/:id/priority","type":0,"val":"api","end":""},{"old":"/api/v1/gateways/:id/priority","type":0,"val":"v1","end":""},{"old":"/api/v1/gateways/:id/priority","type":0,"val":"gateways","end":""},{"old":"/api/v1/gateways/:id/priority","type":1,"val":"id","end":""},{"old":"/api/v1/gateways/:id/priority","type":0,"val":"priority","end":""}],
    types: placeholder as Registry['gateways.update_priority']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
