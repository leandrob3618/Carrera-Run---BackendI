
import { Router } from 'express'
import Product from '../models/product.model.js'
const router = Router()

router.get('/', async (req, res) => {
    try {
        const { limit = 10, page = 1, query, sort } = req.query
        let filter = {}
        if(query) filter.category = query
        
        let sortOption = {}
        if(sort === 'asc') sortOption.price = 1
        if(sort === 'desc') sortOption.price = -1

        const products = await Product.find(filter)
            .limit(Number(limit))
            .skip((Number(page)-1)*Number(limit))
            .sort(sortOption)
            
        const total = await Product.countDocuments(filter)
        
        res.json({
            status: "success",
            payload: products,
            totalPages: Math.ceil(total/limit),
            prevPage: Number(page) > 1 ? Number(page) - 1 : null,
            nextPage: Number(page) < Math.ceil(total/limit) ? Number(page) + 1 : null,
            page: Number(page),
            hasPrevPage: Number(page) > 1,
            hasNextPage: Number(page) < Math.ceil(total/limit),
            prevLink: null,
            nextLink: null
        })
    } catch (error) {
        res.status(500).json({ status: "error", error: error.message })
    }
})

router.post('/', async (req, res) => {
    try {
        const product = await Product.create(req.body)
        req.io.emit('newProduct', product)
        res.status(201).json({ status: "success", payload: product })
    } catch (error) {
        res.status(400).json({ status: "error", error: error.message })
    }
})

export default router