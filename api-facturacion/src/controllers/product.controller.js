import ProductModel from '../models/product.model.js'
import { validateProduct, validateStockAdjustment } from '../schemas/product.schema.js'
import { jsonResponse } from '../helpers/json_response.js'

export const getAllProducts = async (req, res) => {
    try {
        const products = await ProductModel.getAllActive()
        return res.status(200).json(jsonResponse({
            status: 200, message: 'Listado de productos', data: products
        }))
    } catch (e) {
        return res.status(500).json(jsonResponse({ status: 500, message: e.message }))
    }
}

export const createProduct = async (req, res) => {
    const { success, data, error } = validateProduct(req.body)

    if (!success) {
        return res.status(400).json(jsonResponse({
            status: 400, message: 'No pasó las validaciones', data: JSON.parse(error.message)
        }))
    }

    try {
        const newProduct = await ProductModel.create(data)
        return res.status(201).json(jsonResponse({
            status: 201, message: 'Producto creado', data: newProduct
        }))
    } catch (e) {
        if (e.code === 'ER_DUP_ENTRY') {
            return res.status(400).json(jsonResponse({
                status: 400, message: 'Ya existe un producto con ese código', data: null
            }))
        }
        return res.status(500).json(jsonResponse({ status: 500, message: e.message }))
    }
}

export const addProductStock = async (req, res) => {
    const { id } = req.params
    const { success, data, error } = validateStockAdjustment(req.body)

    if (!success) {
        return res.status(400).json(jsonResponse({
            status: 400, message: 'No pasó las validaciones', data: JSON.parse(error.message)
        }))
    }

    try {
        const updatedProduct = await ProductModel.addStock(id, data.stock_to_add)

        if (!updatedProduct) {
            return res.status(404).json(jsonResponse({
                status: 404, message: 'Producto no encontrado', data: null
            }))
        }

        return res.status(200).json(jsonResponse({
            status: 200, message: 'Inventario actualizado', data: updatedProduct
        }))
    } catch (e) {
        return res.status(500).json(jsonResponse({ status: 500, message: e.message }))
    }
}