/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.ts'

router.get('/', () => {
  return { hello: 'world' }
})

router
  .group(() => {
    router
      .group(() => {
        router.post('signup', '#controllers/auth_controller.signup')
        router.post('login', '#controllers/auth_controller.login')
      })
      .prefix('auth')

    router
      .group(() => {
        router.post('', '#controllers/products_controller.store')
        router.get('', '#controllers/products_controller.index')
        router.get(':id', '#controllers/products_controller.show')
        router.patch(':id', '#controllers/products_controller.update')
        router.delete(':id', '#controllers/products_controller.destroy')
      })
      .prefix('products')
      .middleware(middleware.auth(['ADMIN']))

    router.group(() => {
      router.post('purchases', '#controllers/purchases_controller.handle')
    })

    router
      .group(() => {
        router.get('', '#controllers/clients_controller.index')
        router.get(':id', '#controllers/clients_controller.show')
      })
      .prefix('clients')
      .middleware(middleware.auth(['ADMIN']))

    router
      .group(() => {
        router.get('', '#controllers/transactions_controller.index')
        router.get(':id', '#controllers/transactions_controller.show')
      })
      .prefix('transactions')
      .middleware(middleware.auth(['ADMIN']))

    router
      .group(() => {
        router.patch(':id/activate', '#controllers/gateways_controller.updateActive')
        router.patch(':id/priority', '#controllers/gateways_controller.updatePriority')
      })
      .prefix('gateways')
      .middleware(middleware.auth(['ADMIN']))
  })
  .prefix('/api/v1')
