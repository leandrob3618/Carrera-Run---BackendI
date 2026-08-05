
import CartModel from '../models/cart.model.js'

class CartDao {
    getById = async (id) => {
        return await CartModel.findById(id).populate('products.product')
    }
    create = async () => {
        return await CartModel.create({ products: [] })
    }
    addProduct = async (cid, pid) => {
        const cart = await CartModel.findById(cid)
        const productInCart = cart.products.find(p => p.product.toString() === pid)
        if (productInCart) {
            productInCart.quantity++
        } else {
            cart.products.push({ product: pid, quantity: 1 })
        }
        return await cart.save()
    }
}

export default new CartDao()