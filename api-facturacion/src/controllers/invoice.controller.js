
import InvoiceModel from "../models/invoice.model.js";
import {validateInvoice} from '../schemas/invoice.schema.js'
import {jsonResponse} from '../helpers/json_response.js'
import { AppError } from "../helpers/app_error.js";
//import { json } from "zod";

export const createInvoice = async (req, res) =>{
    const {success, data, error} = validateInvoice( req.body)

    if(!success){

        return res.status(400).json(jsonResponse({
            status: 400, message: 'No paso las validaciones', data: JSON.parse(error.message)
        }))
    }
    try{

        const invoice = await InvoiceModel.create({
            userId: req.user.id,
            customerName: data.customer_name,
            customerRtnId: data.customer_rtn_id,
            items: data.items
        })
        return res.status(201).json((jsonResponse({ status: 201, message: 'Factura Emitida', data: invoice})))
    }
    catch (e){
        if( e instanceof AppError){
            return res.status(e.statusCode).json(jsonResponse({ status: e.statusCode, message: e.message}))
        }
        return res.status(500).json(jsonResponse({ status: 500, message: e.message}))
    }


}

export const getAllInvoices = async (req, res)=>{

    try{
        const invoices = await InvoiceModel.findAllForUser({ userId: req.user.id, role: req.user.role})
        
        return res.status(200).json(jsonResponse({status: 200, message: 'Listado de facturas', data: invoices}))
    }
    catch (e){
        return res.status(500).json(jsonResponse({status: 500, message: e.message}))
    }
}

export const getInvoiceById = async (req, res) =>{
    const{ id } = req.params

    try{
        const invoice = await InvoiceModel.findById(id)

        if(!invoice){

            return res.status(404).json(jsonResponse({ status: 400, message: 'Factura no encontrada', data: null}))
        }
        if(req.user.role !== 'ADMIN'&& invoice.user.id !== req.user.id){
            return res.status(403).json(jsonResponse({
                status: 403 , message: 'No tiene permisos para ver esta factura', data: null
            }))
        }
        return res.status(200).json(jsonResponse({ status:400, message: 'Detalle de factura', data: invoice}))
    }
    catch (e) {

        return res.status(500).json(jsonResponse({ status: 500, message: e.message}))
    }
}

//
export const voidInvoice = async (req, res) =>{
    const {id} = req.params

    try{
        const invoice = await InvoiceModel.void(id)
        return res.status(200).json(jsonResponse({
            status: 200, message: 'Factura Anulada. Stock ha sido restituido', data: invoice
        }))
    }
    catch (e){
        if( e instanceof AppError){
            return res.status(e.statusCode).json(jsonResponse({ status: e.statusCode, message: e.message}))
        }
        return res.status(500).json(jsonResponse({ status: 500, message: e.message}))
    }
}