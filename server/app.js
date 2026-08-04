
import express from 'express'
import { engine } from 'express-handlebars' // <- USAMOS ESTO PARA NODE 24
import { Server } from 'socket.io'
import http from 'http'
import mongoose from 'mongoose'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const server = http.createServer(app)
const io = new Server(server)

const PORT = 8080
const MONGO_URL = 'mongodb://localhost:27017/coder' 

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(join(__dirname, 'public')))

app.engine('handlebars', engine()) // <- DESCOMENTADO
app.set('views', join(__dirname, 'views')) 
app.set('view engine', 'handlebars') // <- DESCOMENTADO
app.set('io', io)

app.get('/realtimeproducts', async (req, res) => {
    const { Product } = await import('./models/product.model.js') // <- DESCOMENTADO
    const products = await Product.find().lean() // <- DESCOMENTADO
    res.render('realTimeProducts', { products })
})

io.on('connection', async (socket) => {
    console.log('Cliente conectado al WebSocket')
    const { Product } = await import('./models/product.model.js')
    const products = await Product.find().lean()
    socket.emit('updateProducts', products)

    socket.on('addProduct', async (prod) => {
        try {
            await Product.create(prod)
            const products = await Product.find().lean()
            io.emit('updateProducts', products)
        } catch (error) { console.log("Error al agregar:", error) }
    })

    socket.on('deleteProduct', async (id) => {
        try {
            await Product.findByIdAndDelete(id)
            const products = await Product.find().lean()
            io.emit('updateProducts', products)
        } catch (error) { console.log(error) }
    })
})

mongoose.connect(MONGO_URL)
.then(() => {
    console.log('Conectado a Mongo')
    server.listen(PORT, () => console.log(`Server on ${PORT}`))
})
.catch(err => console.log(err))