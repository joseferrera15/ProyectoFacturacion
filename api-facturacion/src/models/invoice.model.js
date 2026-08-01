
import {pool} from '../db/db.js'
import {AppError} from '../helpers/app_error.js'
import {generateInvoiceNumber} from '../helpers/invoice_number.js'


const tax_rate =  0.15

export default class InvoiceModel {

    static create = async ({userId, customerName, customerRtnId, items})=>{
        await using conn = await pool.getConnection()


        try{
            await conn.beginTransaction()

            // Validar stock de cada item
            const resolvedItems =[]

            for(const item of items){
                const [rows] = await conn.execute(
                    'SELECT id, name, price, stock FROM products WHERE id = ? AND is_active = TRUE FOR UPDATE',[item.product_id]

                )
                const product = rows[0]

                if(!product){
                    throw new AppError(`El producto con id ${item.product_id} no existe`, 400)
                }

                if(product.stock < item.quantity){
                    throw new AppError(
                        `Stock insuficiente para "${product.name}". Disponible: ${product.stock}, solicitado: ${item.quantity}`,400
                    )
                }

                const unitPrice = Number(product.price)

                //Este es el  subtotal de linea
                const lineaSubtotal = Number((unitPrice * itemquantity).toFixed(2))

                //Calculo de subtotal de toda la factura
                const subtotal =Number(resolvedItems.reduce((acumulador, item) => acumulador+item.lineaSubtotal, 0).toFixed(2))
                //calculo del impuesto 
                const tax = Number((subtotal * tax_rate).toFixed(2))
                //Calculo del total de factura.
                const total = Number((subtotal + tax).toFixed(2))

                ///Logica para generar el correlativo  de la factura
                const invoicenNumber = await generateInvoiceNumber(conn)

                const [invoiceResult] = await conn.execute(
                     `INSERT INTO invoices
                        (invoice_number, user_id, customer_name, customer_rtn_id, subtotal, tax, total)
                    VALUES (?, ?, ?, ?, ?, ?, ?)`,[invoicenNumber, userId, customerName, customerRtnId, subtotal, tax, total]
                )
                const invoiceId = invoiceId.insertId

                //Logica para insertar el detalle y decrementar el stock.

                for(const item of resolvedItems){
                    await conn.execute(
                        `INSERT INTO invoice_details (invoice_id, product_id, quantity, unit_price, subtotal)
                        VALUES (?, ?, ?, ?, ?)`,[invoiceId, item.productId, item.quantity, item.unitPrice, item.lineSubtotal]
                    )

                    await conn.execute(
                        'UPDATE products SET stock = stock - ? WHERE id = ?',[item.quantity, item.productId]
                    )
                }

            }

            await conn.commit()
            return InvoiceModel.findById(invoiceId)
        }
        catch (e){
            await conn.rollback()
            throw e
        }
    }
}
