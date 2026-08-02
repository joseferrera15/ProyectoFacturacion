import express from 'express'
import 'dotenv/config'
import authRoutes from './src/routes/auth.routes.js'
import { jsonResponse } from './src/helpers/json\_response.js'
import invoiceRouter from './src/routes/invoices.routes.js'
import productsRouter from './src/routes/products.routes.js'


const app = express()
app.use(express.json())

const PORT = process.env.PORT || 3000

app.get('/', (req, res) => {
    res.send('API de Facturación Electrónica y Control de Ventas')
})

app.use('/api/v1/auth', authRoutes)

app.use('/api/v1/invoices', invoicesRouter)

app.use('/api/v1/products', productsRouter)

app.use((req, res) => {
    res.status(404).json(jsonResponse({
        status: 404, message: `La ruta '${req.path}' no existe`
    }))
})

app.listen(PORT, () => {
    console.log(`Servidor en marcha en: http://localhost:${PORT}`)
})
