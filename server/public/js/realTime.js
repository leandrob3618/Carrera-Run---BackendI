
console.log("JS de tiempo real cargado")
const socket = io()
let products = []
let carrito = []

socket.on('connect', () => console.log("Conectado al socket"))

socket.on('updateProducts', (prods) => {
    products = prods
    renderProducts()
})

function renderProducts(){
    const contenedor = document.getElementById('listado-productos')
    contenedor.innerHTML = ''
    products.forEach(prod => {
        const imagen = prod.thumbnails[0] || 'https://via.placeholder.com/300'
        contenedor.innerHTML += `
        <div class="card" id="prod-${prod._id}">
            <img src="${imagen}" alt="${prod.title}">
            <h3>${prod.title}</h3>
            <p class="precio">$ ${prod.price}</p>
            <button class="btn-agregar" onclick="addToCart('${prod._id}')">Agregar</button>
            <button class="btn-eliminar" onclick="deleteProduct('${prod._id}')">Eliminar</button>
        </div>`
    })
}

document.getElementById('form-producto').addEventListener('submit', (e) => {
    e.preventDefault()
    const producto = {
        title: e.target.title.value, 
        price: Number(e.target.price.value),
        description: e.target.description.value, 
        code: e.target.code.value,
        stock: Number(e.target.stock.value), 
        category: e.target.category.value,
        thumbnails: [e.target.thumbnails.value], 
        status: true
    }
    socket.emit('addProduct', producto)
    e.target.reset()
})

function deleteProduct(id){ socket.emit('deleteProduct', id) }

function addToCart(id){
    const prod = products.find(p => p._id === id)
    const item = carrito.find(i => i._id === id)
    if(item){ item.cantidad++ } else { carrito.push({...prod, cantidad: 1}) }
    actualizarBurbuja()
    renderCarrito()
}

function cambiarCantidad(id, cant){
    const item = carrito.find(i => i._id === id)
    item.cantidad += cant
    if(item.cantidad <= 0) eliminarDelCarrito(id)
    actualizarBurbuja()
    renderCarrito()
}

function eliminarDelCarrito(id){
    carrito = carrito.filter(i => i._id!== id)
    actualizarBurbuja()
    renderCarrito()
}

function actualizarBurbuja(){
    const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0)
    document.querySelector('.burbuja').innerText = totalItems
}

function renderCarrito(){
    const modal = document.getElementById('modal-carrito')
    const contenedor = document.getElementById('contenedor-carrito')
    let total = 0
    contenedor.innerHTML = ''
    carrito.forEach(item => {
        total += item.price * item.cantidad
        contenedor.innerHTML += `
        <div class="item-carrito">
            <img src="${item.thumbnails[0]}">
            <p style="flex:1">${item.title}</p>
            <button onclick="cambiarCantidad('${item._id}', -1)">-</button>
            <span>${item.cantidad}</span>
            <button onclick="cambiarCantidad('${item._id}', 1)">+</button>
            <p>$ ${item.price * item.cantidad}</p>
            <span onclick="eliminarDelCarrito('${item._id}')" style="color:red; cursor:pointer;">X</span>
        </div>`
    })
    document.getElementById('total').innerText = `Total a pagar: $ ${total}`
    modal.style.display = 'block'
}

document.getElementById('btn-finalizar').addEventListener('click', () => {
    const total = carrito.reduce((acc, item) => acc + item.price * item.cantidad, 0)
    alert(`Total a pagar: $ ${total}\nRedirigiendo a Mercado Pago...`)
})

document.querySelector('.carrito').addEventListener('click', renderCarrito)