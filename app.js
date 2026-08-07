
import express from 'express'
import 'dotenv/config' 
import { createServer } from 'http'
import { Server } from 'socket.io'
import handlebars from 'express-handlebars'
import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'

// Importar rutas y modelos
import productsRouter from './server/routes/products.router.js'
import cartsRouter from './server/routes/carts.router.js'
import Product from './server/models/product.model.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer)
const PORT = process.env.PORT || 8080 

// Middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))

// Handlebars
app.engine('handlebars', handlebars.engine())
app.set('view engine', 'handlebars')
app.set('views', path.join(__dirname, 'views'))

// Para poder usar io en los routers
app.use((req, res, next) => { 
    req.io = io
    next() 
})

// Rutas API
app.use('/api/products', productsRouter)
app.use('/api/carts', cartsRouter)
// Rutas de Vistas
app.get('/realtimeproducts', async (req, res) => {
    const products = await Product.find()
    res.render('realTimeProducts', { products })
})

// Conexión a Mongo
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Conectado a MongoDB Atlas'))
    .catch(err => console.error(err))

// WebSockets - SOLO UNA VEZ
io.on('connection', async (socket) => {
    console.log('Cliente conectado')
    
    socket.on('getProducts', async () => {
        const products = await Product.find()
        socket.emit('products', products)
    })

    socket.on('newProduct', async (data) => {
        try {
            const product = await Product.create(data)
            const products = await Product.find()
            io.emit('products', products) 
        } catch (error) {
            console.log(error)
        }
    })

    socket.on('deleteProduct', async (id) => {
        try {
            await Product.findByIdAndDelete(id)
            const products = await Product.find()
            io.emit('products', products) 
        } catch (error) {
            console.log(error)
        }
    })
})

httpServer.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`)
})