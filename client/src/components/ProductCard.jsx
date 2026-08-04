
import Swal from 'sweetalert2';

export default function ProductCard({ product, onAddToCart }) {
    const handleAdd = () => {
    onAddToCart(product);
    Swal.fire({
        icon: "success",
        title: "Producto agregado",
        text: `${product.name} fue añadido al carrito`,
        timer: 1200,
        showConfirmButton: false,
    });
    };

    return (
    <div className="card">
        <img src={product.img} alt={product.name} />
        <h3>{product.name}</h3>
        <p className="price">$ {product.price.toLocaleString("es-AR")}</p>
        <button onClick={handleAdd}>Añadir al carrito</button>
    </div>
    );
}