
import ProductModel from '../models/product.model.js'

class ProductDao {
    getAll = async () => {
        return await ProductModel.find()
    }
    getById = async (id) => {
        return await ProductModel.findById(id)
    }
    create = async (product) => {
        return await ProductModel.create(product)
    }
    update = async (id, product) => {
        return await ProductModel.findByIdAndUpdate(id, product, { new: true })
    }
    delete = async (id) => {
        return await ProductModel.findByIdAndDelete(id)
    }
}

export default new ProductDao()