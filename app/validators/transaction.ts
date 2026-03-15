import vine from '@vinejs/vine'
import type { Infer } from '@vinejs/vine/types'

export const transactionValidator = vine.create({
  client: vine.object({
    name: vine.string().trim().minLength(3).maxLength(128),
    email: vine.string().email().maxLength(254),
  }),

  products: vine
    .array(
      vine.object({
        productId: vine.number().positive(),
        quantity: vine.number().positive(),
      })
    )
    .minLength(1),

  cardNumber: vine.string().regex(/^\d{16}$/),
  cvv: vine.string().regex(/^\d{3,4}$/),
})

export type TransactionData = Infer<typeof transactionValidator>
