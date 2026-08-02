import { pool } from '../db/db.js'

export default class ProductModel {

    static getAllActive = async () => {
        const conn = await pool.getConnection()
        try {
            const [rows] = await conn.query(
                'SELECT id, code, name, price, stock, is_active FROM products WHERE is_active = TRUE ORDER BY id'
            )
            return rows
        } finally {
            conn.release()
        }
    }

    static findById = async (id) => {
        const conn = await pool.getConnection()
        try {
            const [rows] = await conn.query(
                'SELECT id, code, name, price, stock, is_active FROM products WHERE id = ?',
                [id]
            )
            return rows[0]
        } finally {
            conn.release()
        }
    }

    static create = async (product) => {
        const conn = await pool.getConnection()
        try {
            const [result] = await conn.execute(
                'INSERT INTO products (code, name, price, stock) VALUES (:code, :name, :price, :stock)',
                product
            )
            return ProductModel.findById(result.insertId)
        } finally {
            conn.release()
        }
    }

    static addStock = async (id, stockToAdd) => {
        const conn = await pool.getConnection()
        try {
            const [result] = await conn.execute(
                'UPDATE products SET stock = stock + ? WHERE id = ?',
                [stockToAdd, id]
            )
            if (result.affectedRows === 0) return null
            return ProductModel.findById(id)
        } finally {
            conn.release()
        }
    }
}