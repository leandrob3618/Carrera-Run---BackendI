
import { Router } from 'express'
import Cart from '../models/cart.model.js'
import Product from '../models/product.model.js'
const router = Router()

// 1. Crear carrito
router.post('/', async (req, res) => {
    try {
        const cart = await Cart.create({ products: [] })
        res.status(201).json({ status: "success", payload: cart })
    } catch (error) {
        res.status(400).json({ status: "error", error: error.message })
    }
})

// 2. Listar productos de un carrito - ESTE ES CLAVE CON POPULATE
router.get('/:cid', async (req, res) => {
    try {
        const cart = await Cart.findById(req.params.cid).populate('products.product')
        if(!cart) return res.status(404).json({ status: "error", error: "Carrito no encontrado" })
        res.json({ status: "success", payload: cart })
    } catch (error) {
        res.status(500).json({ status: "error", error: error.message })
    }
})

// 3. Agregar producto al carrito
router.post('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params
        const cart = await Cart.findById(cid)
        if(!cart) return res.status(404).json({ status: "error", error: "Carrito no encontrado" })
        
        const productInCart = cart.products.find(p => p.product.toString() === pid)
        if(productInCart){
            productInCart.quantity += 1
        } else {
            cart.products.push({ product: pid, quantity: 1 })
        }
        
        await cart.save()
        res.json({ status: "success", payload: cart })
    } catch (error) {
        res.status(400).json({ status: "error", error: error.message })
    }
})

export default router