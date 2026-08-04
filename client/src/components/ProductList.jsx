
import products from '../data/products.js';
import ProductCard from './ProductCard';

export default function ProductList({ onAddToCart }) {
  return (
    <div className="container-items">
      {products.map(product => (
        <ProductCard 
          key={product.id} 
          product={product} 
          onAddToCart={onAddToCart} 
        />
      ))}
    </div>
  );
}