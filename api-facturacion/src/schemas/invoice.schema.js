
//Schema de validacion para facturas

import * as z from 'zod'

//Validacion del producto en factura
const invoiceItemSchema = z.object({

    product_id: z.number().int().positive(),
    quantity: z.number().int().positive()


}).strict()



//Validacion de la factura completa
const invoiceSchema = z.object({

customer_name: z.string().min(1).max(150),
customer_rtn_id: z.string().min(1).max(20).optional.default('CF'),
items: z.array(invoiceItemSchema).min(1,'La factura debe tener al menos un producto.')

}).strict()

export const validateInvoice =(invoice) =>{
    return invoiceSchema.safeParse(invoice)
}
