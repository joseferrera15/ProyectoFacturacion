
import {pool} from '../db/db.js'
import {AppError} from '../helpers/app_error.js'
import {generateInvoiceNumber} from '../helpers/invoice_number.js'


const tax_rate =  0.15

export default class InvoiceModel {

    static create = async ({userId, customerName, customerRtnId, items})=>{
        
        const conn = await pool.getConnection()


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
                const lineSubtotal = Number((unitPrice * item.quantity).toFixed(2))

                resolvedItems.push({
                    productId: product.id,
                    quantity: item.quantity,
                    unitPrice,
                    lineSubtotal
                })
            
            }
                //Calculo de subtotal de toda la factura
                const subtotal =Number(resolvedItems.reduce((acumulador, item) => acumulador+item.lineSubtotal, 0).toFixed(2))
                //calculo del impuesto 
                const tax = Number((subtotal * tax_rate).toFixed(2))
                //Calculo del total de factura.
                const total = Number((subtotal + tax).toFixed(2))

                ///Logica para generar el correlativo  de la factura
                const invoiceNumber = await generateInvoiceNumber(conn)

                const [invoiceResult] = await conn.execute(
                    `INSERT INTO invoices
                        (invoice_number, user_id, customer_name, customer_rtn_id, subtotal, tax, total)
                    VALUES (?, ?, ?, ?, ?, ?, ?)`,[invoiceNumber, userId, customerName, customerRtnId, subtotal, tax, total]
                )
                const invoiceId = invoiceResult.insertId

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

            await conn.commit()
            return Iinvoice;
        }
        catch (e){
            await conn.rollback()
            throw e
        }
        finally{
            conn.release()
        }
    }

    //implementacion del modelo para consultas
    static findAllForUser = async({userId, role})=>{

        const conn = await pool.getConnection()

        try{

        const query = role === 'ADMIN'
            ? 'SELECT id, invoice_number, user_id, customer_name, customer_rtn_id, subtotal, tax, total, status, created_at FROM invoices ORDER BY id DESC'
            : 'SELECT id, invoice_number, user_id, customer_name, customer_rtn_id, subtotal, tax, total, status, created_at FROM invoices WHERE user_id = ? ORDER BY id DESC'
        
        const params = role === 'ADMIN' ?[] : [userId]
        const [rows] = await conn.query( query, params)

        return rows;
        }
        finally{
        conn.release()
        }
    }
    static findById = async (id) =>{
        const conn = await pool.getConnection()
        try{
        const [invoiceRows] = await conn.execute(
            `SELECT id, invoice_number, user_id, customer_name, customer_rtn_id,
                subtotal, tax, total, status, created_at
            FROM invoices WHERE id = ?`,[id]

        )

        const invoice = invoiceRows[0]
        if(!invoice) return null

        const [detailRows] = await conn.execute(
            `SELECT d.id, d.product_id, p.name AS product_name, p.code AS product_code,
                d.quantity, d.unit_price, d.subtotal
            FROM invoice_details d
            JOIN products p ON p.id = d.product_id
            WHERE d.invoice_id = ?`,[id]
        )

        return { ...invoice, items: detailRows}
    }finally{
        conn.release()
    }
}
    //Logica para Anulación y Restitución de Inventario
    static void = async(id) =>{

        const conn = await pool.getConnection()
        try {
        await conn.beginTransaction()

        const [invoiceRows] = await conn.execute(
            'SELECT id, status FROM invoices WHERE id = ? FOR UPDATE',[id]
        )

        const invoice = invoiceRows[0]

        if (!invoice) {
            throw new AppError('Factura no encontrada', 404)
        }

        if (invoice.status === 'VOIDED') {
            throw new AppError('La factura ya se encuentra anulada', 400)
        }

        const [detailRows] = await conn.execute(
            'SELECT product_id, quantity FROM invoice_details WHERE invoice_id = ?',[id]
        )

        for (const detail of detailRows) {
            await conn.execute(
                'UPDATE products SET stock = stock + ? WHERE id = ?',
                [detail.quantity, detail.product_id]
            )
        }

        await conn.execute("UPDATE invoices SET status = 'VOIDED' WHERE id = ?", [id])

        await conn.commit()
        return InvoiceModel.findById(id)

    } catch (e) {
        await conn.rollback()
        throw e
    }finally {
        conn.release()
    }
    }
}
