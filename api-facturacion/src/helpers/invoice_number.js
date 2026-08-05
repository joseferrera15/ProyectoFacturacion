//Generar correlativo de factura en formato FAC-000001
const prefix = 'FAC-'
const pad_length = 6

export const generateInvoiceNumber = async(conn)=>{

    const [rows] = await conn.query('SELECT COUNT (*) as total FROM  invoices FOR UPDATE')

    const nextSequence = rows[0].total+1

    return `${prefix}${String(nextSequence).padStart(pad_length, '0')}`
}