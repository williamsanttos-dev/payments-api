import vine from '@vinejs/vine'
import type { Infer } from '@vinejs/vine/types'

export const createProductValidation = vine.create({
  name: vine.string().trim().minLength(1).maxLength(255),
  amount: vine.number().decimal(2).positive().range([0.01, 99999999.99]),
})
export type CreateProductData = Infer<typeof createProductValidation>

export const updateProductValidation = vine.create({
  name: vine.string().trim().minLength(1).maxLength(255).optional(),
  amount: vine.number().decimal(2).positive().range([0.01, 99999999.99]).optional(),
})
export type UpdateProductData = Infer<typeof updateProductValidation>
