
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import handlebars from 'express-handlebars'
import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'

// Importar rutas y modelos
import productsRouter from './server/routes/products.router.js'
import Product from './server/models/product.model.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer)
const PORT = 8080

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

// Rutas de Vistas
app.get('/realtimeproducts', async (req, res) => {
    const products = await Product.find()
    res.render('realTimeProducts', { products })
})

// Conexión a Mongo
mongoose.connect('mongodb://localhost:27017/ecommerce')
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.error(err))

// WebSockets
io.on('connection', async (socket) => {
    console.log('Cliente conectado')

    // WebSockets
io.on('connection', async (socket) => {
    console.log('Cliente conectado')
    
    // 1. MANDAR PRODUCTOS AL ENTRAR A LA PAGINA
    socket.on('getProducts', async () => {
        const products = await Product.find()
        socket.emit('products', products)
    })

    // 2. Cuando se crea producto desde el form de la vista
    socket.on('newProduct', async (data) => {
        try {
            const product = await Product.create(data)
            const products = await Product.find()
            io.emit('products', products) // le manda a todos la lista nueva
        } catch (error) {
            console.log(error)
        }
    })

    // ELIMINAR PRODUCTO
    socket.on('deleteProduct', async (id) => {
        try {
            await Product.findByIdAndDelete(id)
            const products = await Product.find()
            io.emit('products', products) // actualiza a todos
        } catch (error) {
            console.log(error)
        }
    })
})
    
    socket.on('newProduct', async (data) => {
        try {
            const product = await Product.create(data)
            const products = await Product.find()
            io.emit('products', products) // le manda a todos la lista nueva
        } catch (error) {
            console.log(error)
        }
    })
})

httpServer.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`)
})