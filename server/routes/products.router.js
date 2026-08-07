
import { Router } from 'express'
import Product from '../models/product.model.js'
const router = Router()

// VER TODOS LOS PRODUCTOS
router.get('/', async (req, res) => {
    try {
        const { limit = 10, page = 1, query, sort } = req.query
        let filter = {}
        if(query) filter.category = query
        
        let sortOption = {}
        if(sort === 'asc') sortOption.price = 1
        if(sort === 'desc') sortOption.price = -1

        const products = await Product.find(filter, 'title').lean()
            .limit(Number(limit))
            .skip((Number(page)-1)*Number(limit))
            .sort(sortOption)
            
        const total = await Product.countDocuments(filter)
        const totalPages = Math.ceil(total/limit)
        const hasPrevPage = Number(page) > 1
        const hasNextPage = Number(page) < totalPages
        const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`
        
        const prevLink = hasPrevPage ? `${baseUrl}?limit=${limit}&page=${Number(page)-1}&query=${query || ''}&sort=${sort || ''}` : null
        const nextLink = hasNextPage ? `${baseUrl}?limit=${limit}&page=${Number(page)+1}&query=${query || ''}&sort=${sort || ''}` : null

        res.json({
            status: "success",
            payload: products,
            totalPages: totalPages,
            prevPage: hasPrevPage ? Number(page) - 1 : null,
            nextPage: hasNextPage ? Number(page) + 1 : null,
            page: Number(page),
            hasPrevPage: hasPrevPage,
            hasNextPage: hasNextPage,
            prevLink: prevLink,
            nextLink: nextLink
        })
    } catch (error) {
        res.status(500).json({ status: "error", error: error.message })
    }
})

// VER PRODUCTOS DE MANERA INDIVIDUAL
router.get('/:identifier', async (req, res) => {
    try {
        const { identifier } = req.params
        const isObjectId = identifier.match(/^[0-9a-fA-F]{24}$/)

        let product
        if(isObjectId) {
            product = await Product.findById(identifier)
        } else {
            product = await Product.findOne({ code: identifier })
        }
        
        if(!product) return res.status(404).json({ status: "error", error: "Producto no encontrado" })
        res.json({ status: "success", payload: product })
    } catch (error) {
        res.status(500).json({ status: "error", error: error.message })
    }
})



// CREAR PRODUCTO
router.post('/', async (req, res) => {
    try {
        const product = await Product.create(req.body)
        req.io.emit('newProduct', product)
        res.status(201).json({ status: "success", payload: product })
    } catch (error) {
        res.status(400).json({ status: "error", error: error.message })
    }
})

// ACTUALIZAR PRODUCTO
router.put('/:identifier', async (req, res) => {
    try {
        const { identifier } = req.params
        const isObjectId = identifier.match(/^[0-9a-fA-F]{24}$/)

        let productUpdated
        if(isObjectId) {
            // 1 Si es _id
            productUpdated = await Product.findByIdAndUpdate(identifier, req.body, { new: true })
        } else {
            // Si es code
            productUpdated = await Product.findOneAndUpdate({ code: identifier }, req.body, { new: true })
        }
        
        if(!productUpdated) return res.status(404).json({ status: "error", error: "Producto no encontrado" })
        
        req.io.emit('updateProduct', productUpdated)
        res.json({ status: "success", payload: productUpdated })
    } catch (error) {
        res.status(400).json({ status: "error", error: error.message })
    }
})

// BORRAR PRODUCTO
router.delete('/:identifier', async (req, res) => {
    try {
        const { identifier } = req.params
        const isObjectId = identifier.match(/^[0-9a-fA-F]{24}$/)

        let productDeleted
        if(isObjectId) {
            // 1Borrar por _id
            productDeleted = await Product.findByIdAndDelete(identifier)
        } else {
            // 2 Borrar por code
            productDeleted = await Product.findOneAndDelete({ code: identifier })
        }
        
        if(!productDeleted) return res.status(404).json({ status: "error", error: "Producto no encontrado" })
        
        req.io.emit('deleteProduct', productDeleted._id)
        res.json({ status: "success", message: "Producto eliminado", payload: productDeleted })
    } catch (error) {
        res.status(400).json({ status: "error", error: error.message })
    }
})

export default router





