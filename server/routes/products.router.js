import { Router } from 'express'
import { Product } from '../models/product.model.js'
const router = Router()

// GET /api/products?limit=10&page=1&sort=asc&query=ropa
router.get('/', async (req, res) => {
    try {
        const { limit=10, page=1, sort, query } = req.query
        const options = { limit: parseInt(limit), page: parseInt(page), lean: true }
        if(sort) options.sort = { price: sort === 'asc'? 1 : -1 }
        
        const filter = query? { category: query } : {}
        const result = await Product.paginate(filter, options)
        res.send({ status: 'success', payload: result })
    } catch (error) {
        res.status(500).send({ status: 'error', error: error.message })
    }
})

// GET by ID
router.get('/:pid', async (req, res) => {
    const product = await Product.findById(req.params.pid)
    if(!product) return res.status(404).send({status: 'error', error: 'Producto no encontrado'})
    res.send({ status: 'success', payload: product })
})

// POST - Crear producto
router.post('/', async (req, res) => {
    try {
        const product = await Product.create(req.body)

        // EMITIR A TIEMPO REAL
        const products = await Product.find().lean()
        const io = req.app.get('io')
        io.emit('updateProducts', products)

        res.status(201).send({ status: 'success', payload: product })
    } catch (error) {
        res.status(400).send({ status: 'error', error: error.message })
    }
})

// PUT - Actualizar
router.put('/:pid', async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.pid, req.body, {new: true})

        // EMITIR A TIEMPO REAL
        const products = await Product.find().lean()
        const io = req.app.get('io')
        io.emit('updateProducts', products)

        res.send({ status: 'success', payload: product })
    } catch (error) {
        res.status(500).send({ status: 'error', error: error.message })
    }
})

// DELETE
router.delete('/:pid', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.pid)

        // EMITIR A TIEMPO REAL
        const products = await Product.find().lean()
        const io = req.app.get('io')
        io.emit('updateProducts', products)

        res.send({ status: 'success', message: 'Producto eliminado' })
    } catch (error) {
        res.status(500).send({ status: 'error', error: error.message })
    }
})

export default router