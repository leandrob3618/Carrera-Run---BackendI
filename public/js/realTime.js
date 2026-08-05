
const socket = io();
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

const form = document.getElementById('form-producto');
const listado = document.getElementById('listado-productos');
const burbuja = document.querySelector('.burbuja');
const modalCarrito = document.getElementById('modal-carrito');
const contenedorCarrito = document.getElementById('contenedor-carrito');
const totalElement = document.getElementById('total');

// CARGAR PRODUCTOS AL INICIO
socket.emit('getProducts');

// 1. AGREGAR PRODUCTO DESDE EL FORM
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    data.price = Number(data.price);
    data.stock = Number(data.stock);
    data.status = true;
    data.thumbnails = [data.thumbnails];
     if(data.title.trim() === '' || data.price <= 0 || data.stock < 0 || data.code.trim() === ''){
        alert('Completa todos los campos. El precio debe ser mayor a 0 y el stock no puede ser negativo 😡');
        return; // frena todo si hay error
    }
    socket.emit('newProduct', data);
    form.reset();
});

// 2. CUANDO LLEGA LA LISTA NUEVA DE PRODUCTOS
socket.on('products', (products) => {
    listado.innerHTML = '';
    products.forEach(p => {
        listado.innerHTML += `
            <div class="card" id="prod-${p._id}">
                <img src="${p.thumbnails[0]}" alt="${p.title}" onerror="this.src='https://via.placeholder.com/300'">
                <h3>${p.title}</h3>
                <p class="precio">$ ${p.price}</p>
                <button class="btn-agregar" onclick="addToCart('${p._id}')">Agregar</button>
                <button class="btn-eliminar" onclick="deleteProduct('${p._id}')">Eliminar</button>
            </div>
        `;
    });
});

// 3. ELIMINAR PRODUCTO CON CONFIRM
window.deleteProduct = (id) => {
    const confirmar = confirm('¿Seguro que quieres eliminar este producto?');
    if(confirmar){
        socket.emit('deleteProduct', id);
    }
}

// 4. CARRITO
window.addToCart = (id) => {
    const prod = document.getElementById(`prod-${id}`);
    const title = prod.querySelector('h3').innerText;
    const price = Number(prod.querySelector('.precio').innerText.replace('$ ', ''));
    const img = prod.querySelector('img').src;

    const item = carrito.find(p => p.id === id);
    if(item) item.cantidad++;
    else carrito.push({ id, title, price, img, cantidad: 1 });

    actualizarCarrito();
}

function actualizarCarrito() {
    burbuja.innerText = carrito.reduce((acc, p) => acc + p.cantidad, 0);
    contenedorCarrito.innerHTML = '';
    let total = 0;

    // 2. MENSAJE "CARRITO VACÍO" 
    if(carrito.length === 0){
        contenedorCarrito.innerHTML = `<p style="text-align:center; padding:20px;">Tu carrito está vacío 😢</p>`;
    } else {
        carrito.forEach(p => {
            total += p.price * p.cantidad;
            contenedorCarrito.innerHTML += `
                <div class="item-carrito">
                    <img src="${p.img}" onerror="this.src='https://via.placeholder.com/60'">
                    <div class="info">
                        <p class="nombre">${p.title}</p>
                        <p>$${p.price}</p>
                    </div>
                    <div class="controles">
                        <button onclick="restar('${p.id}')">-</button>
                        <span> ${p.cantidad} </span>
                        <button onclick="sumar('${p.id}')">+</button>
                    </div>
                    <p class="precio">$ ${p.price * p.cantidad}</p>
                    <span class="btn-borrar" onclick="borrarItem('${p.id}')">×</span>
                </div>
            `;
        });
    }
    
    totalElement.innerText = `Total: $${total}`;
    localStorage.setItem('carrito', JSON.stringify(carrito)); // <-- LO MOVÍ ACÁ ADENTRO
}

window.restar = (id) => {
    const item = carrito.find(p => p.id === id);
    item.cantidad--;
    if(item.cantidad === 0) carrito = carrito.filter(p => p.id !== id);
    actualizarCarrito();
}

window.sumar = (id) => {
    const item = carrito.find(p => p.id === id);
    item.cantidad++;
    actualizarCarrito();
}

window.borrarItem = (id) => {
    carrito = carrito.filter(p => p.id !== id);
    actualizarCarrito();
}

// ABRIR Y CERRAR MODAL
document.querySelector('.carrito').addEventListener('click', () => {
    modalCarrito.style.display = 'block';
});

document.getElementById('btn-finalizar').onclick = () => {
    alert('Compra finalizada! Gracias por tu compra 😊');
    carrito = [];
    actualizarCarrito();
    modalCarrito.style.display = 'none';
}

actualizarCarrito(); // Para cargar el carrito guardado al inicio