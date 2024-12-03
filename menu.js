let carrito = [];
let total = 0;

// Función para agregar un producto al carrito o incrementar su cantidad
function agregarAlCarrito(id, nombre, precio) {
    // Verificar si el producto ya está en el carrito
    const productoExistente = carrito.find(producto => producto.id === id);

    if (productoExistente) {
        // Incrementar la cantidad si ya existe
        productoExistente.cantidad++;
    } else {
        // Añadir un nuevo producto al carrito
        carrito.push({ id, nombre, precio, cantidad: 1 });
    }

    // Actualizar la vista del ticket
    actualizarTicket();
}

// Función para disminuir la cantidad de un producto o eliminarlo si la cantidad llega a 0
function disminuirCantidad(id) {
    const productoExistente = carrito.find(producto => producto.id === id);

    if (productoExistente) {
        productoExistente.cantidad--;

        // Si la cantidad llega a 0, eliminar el producto del carrito
        if (productoExistente.cantidad === 0) {
            carrito = carrito.filter(producto => producto.id !== id);
        }
    }

    // Actualizar la vista del ticket
    actualizarTicket();
}

// Función para eliminar un producto del carrito completamente
function eliminarDelCarrito(id) {
    carrito = carrito.filter(producto => producto.id !== id);

    // Actualizar la vista del ticket
    actualizarTicket();
}

// Función para actualizar el ticket
function actualizarTicket() {
    const ticketList = document.getElementById('ticket-list');
    const totalElement = document.getElementById('total');

    // Limpiar la lista
    ticketList.innerHTML = '';

    // Reiniciar el total
    total = 0;

    // Agregar cada producto al ticket
    carrito.forEach(producto => {
        const li = document.createElement('li');
        li.textContent = `${producto.nombre} - $${producto.precio.toFixed(2)} x ${producto.cantidad}`;

        // Crear botón para incrementar cantidad
        const btnIncrementar = document.createElement('button');
        btnIncrementar.textContent = '+';
        btnIncrementar.className = 'btn btn-success btn-sm';
        btnIncrementar.style.marginLeft = '5px';
        btnIncrementar.onclick = () => agregarAlCarrito(producto.id, producto.nombre, producto.precio);

        // Crear botón para disminuir cantidad
        const btnDisminuir = document.createElement('button');
        btnDisminuir.textContent = '-';
        btnDisminuir.className = 'btn btn-warning btn-sm';
        btnDisminuir.style.marginLeft = '5px';
        btnDisminuir.onclick = () => disminuirCantidad(producto.id);

        // Crear botón de eliminar
        const btnEliminar = document.createElement('button');
        btnEliminar.textContent = 'Eliminar';
        btnEliminar.className = 'btn btn-danger btn-sm';
        btnEliminar.style.marginLeft = '5px';
        btnEliminar.onclick = () => eliminarDelCarrito(producto.id);

        // Agregar botones al elemento de la lista
        li.appendChild(btnIncrementar);
        li.appendChild(btnDisminuir);
        li.appendChild(btnEliminar);

        // Agregar el elemento a la lista
        ticketList.appendChild(li);

        // Sumar al total
        total += producto.precio * producto.cantidad;
    });

    // Actualizar el total en el DOM
    totalElement.textContent = total.toFixed(2);
}

// Función para confirmar el pedido
// Función para confirmar el pedido
function confirmarPedido() {
    if (carrito.length === 0) {
        alert('Pedido Confirmado.');
        window.location.href = "framework.html";

        return;
    }

    // Crear un objeto con los datos del pedido
    const pedido = {
        carrito: carrito,
        total: total
    };

    // Enviar los datos al servidor
    fetch('https://restauranteasia-production.up.railway.app/confirmarPedido', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(pedido)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al confirmar el pedido');
        }
        return response.text();
    })
    .then(message => {
        alert(message);
        carrito = [];
        actualizarTicket();
        // Redirigir a ticket.html
        window.location.href = "https://restauranteasia-production.up.railway.app/ticket.html";
    })
    .catch(error => {
        console.error(error);
        alert('No se pudo confirmar el pedido');
    });
}

document.addEventListener('DOMContentLoaded', function() {
    obtenerUltimoPedido();  // Llamar a la función cuando la página haya cargado
});

function obtenerUltimoPedido() {
    fetch('https://restauranteasia-production.up.railway.app/ultimoPedido')
        .then(response => response.json())
        .then(pedido => {
            console.log('Último pedido recibido:', pedido);  // Verifica la respuesta
            mostrarResumenPedido(pedido);
        })
        .catch(error => console.error('Error al obtener el último pedido:', error));
}

function mostrarResumenPedido(pedido) {
    const ticket = document.getElementById('ticket');
    ticket.innerHTML = ''; // Limpiar contenido anterior

    // Mostrar los platillos
    pedido.platillos.forEach(platillo => {
        const p = document.createElement('p');
        p.innerHTML = `<strong>Producto:</strong> ${platillo.nombre} <br> <strong>Cantidad:</strong> ${platillo.cantidad}`;
        ticket.appendChild(p);
    });

    // Mostrar el total
    const total = document.createElement('p');
    total.innerHTML = `<strong>Total:</strong> $${pedido.total}`;
    ticket.appendChild(total);

    // Mostrar el ID del pedido
    const id = document.createElement('p');
    id.innerHTML = `<strong>ID del pedido:</strong> ${pedido.id}`;
    ticket.appendChild(id);

    // Guardar el ID del pedido en una variable global
    window.pedidoId = pedido.id;  // Asignar el ID del pedido a una variable global
    console.log('ID del pedido guardado:', window.pedidoId);  // Verifica que se haya guardado
}



function cancelarPedido() {
    const idPedido = window.pedidoId;  // Obtener el ID desde la variable global
    console.log('ID del pedido en cancelarPedido:', idPedido);  // Verifica si el ID es correcto
    

    if (!idPedido) {
        console.error("No se pudo obtener el ID del pedido.");
        return;
    }

    const confirmacion = confirm('¿Estás seguro de que deseas cancelar el pedido?');
    if (confirmacion) {
        // Enviar la solicitud al servidor para cancelar el pedido
        fetch('https://restauranteasia-production.up.railway.app/cancelarPedido', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: idPedido }) // Usar el ID correcto
            
        })
        
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error('Error:', error));
        window.location.href = "framework.html";

    }
}
// Eliminar un pedido de la base de datos
  /*  function cancelarPedido(id) {
    const confirmacion = confirm('¿Estás seguro de que deseas cancelar el pedido?');
    if (confirmacion) {
    fetch(`http://localhost:3000/cancelarPedido/${id}`, {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        alert('Pedido cancelado con éxito');
        window.location.href = "framework.html"; // Redirige a otra página
    })
    .catch(error => {
        console.error('Error al cancelar el pedido:', error);
        alert('Hubo un error al cancelar el pedido');
    });
    }
    }*/
