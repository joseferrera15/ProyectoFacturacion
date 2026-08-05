
import { Router} from "express";
import { createInvoice, getAllInvoices, getInvoiceById, voidInvoice } from "../controllers/invoice.controller.js";
import {isAuth} from '../middlewares/isAuth.js'
import { hasRole } from "../middlewares/hasRole.js";

const invoicesRouter = Router()

invoicesRouter.post('/', isAuth, hasRole('CASHIER', 'ADMIN'), createInvoice)
invoicesRouter.get('/', isAuth, hasRole('CASHIER', 'ADMIN'), getAllInvoices)
invoicesRouter.get('/:id', isAuth, hasRole('CASHIER', 'ADMIN'), getInvoiceById)
invoicesRouter.patch( '/:id/void', isAuth, hasRole('ADMIN'), voidInvoice)


export default invoicesRouter