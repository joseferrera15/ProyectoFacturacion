import { Router } from 'express'
import { getAllProducts, createProduct, addProductStock } from '../controllers/product.controller.js'
import { isAuth } from '../middlewares/isAuth.js'
import { hasRole } from '../middlewares/hasRole.js'

const productsRouter = Router()

productsRouter.get('/', isAuth, getAllProducts)
productsRouter.post('/', isAuth, hasRole('ADMIN'), createProduct)
productsRouter.patch('/:id/stock', isAuth, hasRole('ADMIN'), addProductStock)

export default productsRouter