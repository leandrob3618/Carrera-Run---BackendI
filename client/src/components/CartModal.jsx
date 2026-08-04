
export default function CartModal({ isOpen, onClose, cart, onRemove, onUpdateQuantity, onClear, totalPrice }) {
  if (!isOpen) return null;

  const handleBuy = () => {
    Swal.fire({
      title: "¿Confirmar compra?",
      html: `Total a pagar: <b>$${totalPrice.toLocaleString('es-AR')}</b>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Comprar",
      cancelButtonText: "Cancelar",
      allowOutsideClick: false
    }).then(async (result) => {
      if (result.isConfirmed) {
        onClose();
        try {
          const response = await fetch("http://localhost:3000/create_preference", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              items: cart.map(p => ({
                title: p.name,
                quantity: p.quantity, // <- corregido
                unit_price: Number(p.price),
                currency_id: "ARS"
              }))
            }),
          });
          const data = await response.json();
          window.location.href = `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${data.id}`;
        } catch (error) {
          Swal.fire("Error", "No se pudo iniciar el pago", "error");
        }
      }
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}> {/* Overlay envuelve todo */}
      <div className="modal-container" onClick={(e) => e.stopPropagation()}> {/* StopPropagation para que no se cierre al hacer clic adentro */}
        <div className="modal-header">
          <div className="modal-close" onClick={onClose}>❌</div>
          <div className="modal-title">Tu compra 😊🛒</div>
        </div>

        {cart.length === 0 ? (
          <h2 className="modal-body">El carrito está vacío</h2>
        ) : (
          <>
            {cart.map((product) => (
              <div key={product.id} className="modal-body">
                <div className="product">
                  <img className="product-img" src={product.image} alt={product.name} /> {/* <- corregido: img -> image */}
                  <div className="product-info"><h4>{product.name}</h4></div>
                  <div className="quantity">
                    <span className="quantity-btn-decrese" onClick={() => onUpdateQuantity(product.id, product.quantity - 1)}>-</span>
                    <span className="quantity-input">{product.quantity}</span> {/* <- corregido: quanty -> quantity */}
                    <span className="quantity-btn-increse" onClick={() => onUpdateQuantity(product.id, product.quantity + 1)}>+</span>
                  </div>
                  <div className="price">$ {(product.price * product.quantity).toLocaleString('es-AR')}</div> {/* <- corregido */}
                  <div className="delete-product" onClick={() => onRemove(product.id)}>❌</div>
                </div>
              </div>
            ))}
            <div className="modal-footer">
              <div className="total-price">Total a pagar: $ {totalPrice.toLocaleString('es-AR')}</div>
              <button className="btn-primary" onClick={handleBuy}>Finalizar compra</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}