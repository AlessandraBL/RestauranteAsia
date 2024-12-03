document.getElementById("formulario").addEventListener("submit", function(event) {
    event.preventDefault(); // Evitar el envío del formulario por defecto

    const correo = document.getElementById("correo").value;
    const contrasena = document.getElementById("password").value;

    fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ correo, contrasena })
    })
    .then(response => {
        if (response.ok) {
            return response.json(); // Convertir la respuesta a JSON
        } else {
            return response.text().then(text => { throw new Error(text); });
        }
    })
    .then(data => {
        // Redirige a la página especificada en la respuesta
        window.location.href = data.redirect;
    })
    .catch(error => {
        alert('Error al iniciar sesión: ' + error.message);
        console.error('Error:', error);
    });
});

function confirmarPedido() {
 
    window.location.href = "framework.html"; // Redirige a la página ticket.html

}
