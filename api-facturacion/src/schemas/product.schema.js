import * as z from 'zod'

const productSchema = z.object({
    code: z.string().min(1).max(50),
    name: z.string().min(1).max(100),
    price: z.number().positive(),
    stock: z.number().int().nonnegative()
}).strict()

const stockAdjustmentSchema = z.object({
    stock_to_add: z.number().int().positive()
}).strict()

export const validateProduct = (product) => {
    return productSchema.safeParse(product)
}

export const validateStockAdjustment = (payload) => {
    return stockAdjustmentSchema.safeParse(payload)
}
