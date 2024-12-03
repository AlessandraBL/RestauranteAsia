function submitReservation() { 
    // Obtener los valores de los campos  
    const nombre = document.getElementById('nameInput').value;  
    const email = document.getElementById('emailInput').value;  
    const fecha = document.getElementById('dateInput').value;
    const hora = document.getElementById('timeInput').value;
    const personas = document.getElementById('peopleInput').value;
    const coment = document.getElementById('commentsTextarea').value;

    // Validar campos requeridos
    if (!nombre || !email || !fecha || !hora || !personas) {
        alert('Por favor, completa todos los campos requeridos.');
        return;
    }

    // Crear el objeto de datos para enviar
    const data = { nombre, correo: email, fecha, hora, personas, coment };

    // Enviar la solicitud POST al servidor
    fetch('https://restauranteasia-production.up.railway.app/Reservacion', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.ok) {
            return response.text();
        } else {
            throw new Error('Error al enviar la reservación');
        }
    })
    .then(responseText => {
        const confirmationMessage = document.getElementById("confirmationMessage");
        confirmationMessage.innerHTML = `<h3>¡Gracias, ${nombre}! Tu reservación para ${personas} personas el ${fecha} a las ${hora} ha sido realizada con éxito.</h3>`;
        confirmationMessage.style.display = "block"; 

        // Limpiar el formulario después de enviar
        document.getElementById('nameInput').value = '';
        document.getElementById('emailInput').value = '';
        document.getElementById('dateInput').value = '';
        document.getElementById('timeInput').value = '';
        document.getElementById('peopleInput').value = '';
        document.getElementById('commentsTextarea').value = '';
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Hubo un problema al realizar la reservación. Inténtalo de nuevo.');
    });
}
