require('dotenv').config();
const express = require ('express');
const app = express();

const mysql = require('mysql2');
const port = process.env.PORT || 3000;
//analiza los datos que vienen en las solicitudes
const bodyParser = require('body-parser');
//permite la solicitudes (evita problemas de seguridad en el navegador)
const cors = require ('cors');
app.use(cors());


const session = require('express-session');

const path = require('path');

app.use(express.static(__dirname));

app.use(session({
    secret:'secret',
    resave : false,
    saveUninitialized : false,
    cookie : {maxAge: 60000}
}));
//configura el servidor para que pueda leer datos en formato json y en formato url
app.use(bodyParser.urlencoded( { extended:true } ));
app.use(bodyParser.json());

const database = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost', 
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'RestauranteAsia',
    port: process.env.DB_PORT || '3306'
});

app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'framework.html'));
});

database.connect( (err) => {
    if(err){
        console.error('Error en la conexión: ' + err.stack);
    }
    else{
        console.log('Sí jaló, ya estás conectado:)');
    }
});
//proceso de reservas
app.post('/Reservacion', (req, res) => {
    console.log(req.body);
    const {nombre, correo, fecha, hora, personas, coment} = req.body;

    const sql_query = 'insert into reservacion(nombre,correo,fecha,hora,personas,coment) values (?, ?, ?, ?, ?, ?)';
    database.query(sql_query, [nombre, correo, fecha, hora, personas, coment], (err) => {
        if(err){
            console.error('Ha fallado la coleccion de datos de reservación: ' + err.stack);
            res.status(500).send('Error al insertar');
        }
        else{
            console.log('Funciono correctamente');
            res.status(200).send('Reservacion insertada');
        }
    });
});


// LOGIN

app.post('/login', (req, res) => {
    console.log(req.body);
    const { correo, contrasena } = req.body;

    const sql_query = 'SELECT * FROM login WHERE correo_cliente = ?';
    database.query(sql_query, [correo], (err, result) => {
        if (err) {
            console.error('Error al buscar el usuario: ' + err.stack);
            return res.status(500).send('Error al buscar el usuario');
        } else if (result.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        } else {
            // Comparar las contraseñas directamente en texto plano
            if (contrasena === result[0].contrasena) {
                req.session.usuario = result[0].nombre; // Establecer el nombre en la sesión
                return res.status(200).json({ redirect: '/framework.html' }); // Respuesta JSON para redirección
            } else {
                return res.status(401).json({ message: 'Contraseña incorrecta' });
            }
        }
    });
});

// Ruta para confirmar el pedido
app.post('/confirmarPedido', (req, res) => {
    console.log(req.body);
    const { carrito, total } = req.body;

    // Extraer nombres y cantidades
    const nombres_platillos = carrito.map(producto => producto.nombre).join(', ');
    const cantidades = carrito.map(producto => producto.cantidad).join(', ');

    const estado = 'aprobado'; // Estado por defecto

    // Insertar en la base de datos
    const sql_query = 'INSERT INTO pedidos (nombres_platillos, cantidades, total, estado) VALUES (?, ?, ?, ?)';
    database.query(sql_query, [nombres_platillos, cantidades, total, estado], (err) => {
        if (err) {
            console.error('Error al insertar el pedido: ' + err.stack);
            return res.status(500).send('Error al confirmar el pedido');
        }
        res.status(200).send('Pedido confirmado y almacenado');
    });
});


// Ruta para obtener el último pedido
app.get('/ultimoPedido', (req, res) => {
    const query = 'SELECT * FROM pedidos ORDER BY id DESC LIMIT 1';
    database.query(query, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error al obtener el pedido' });
        }

        // Asumimos que los valores en 'nombres_platillos' y 'cantidades' están separados por comas
        const nombres = result[0].nombres_platillos.split(',');
        const cantidades = result[0].cantidades.split(',');

        const pedido = {
            id: result[0].id,
            platillos: nombres.map((nombre, index) => ({
                nombre: nombre.trim(),
                cantidad: parseInt(cantidades[index].trim(), 10)
            })),
            total: result[0].total
        };

        res.json(pedido);
    });
});



// Ruta para cancelar un pedido
// Ruta para cancelar un pedido
app.post('/cancelarPedido', (req, res) => {
    console.log(req.body);
    const { id } = req.body;
    console.log('ID recibido:', id); // Para confirmar qué llega al servidor
    if (!id) {
        return res.status(400).json({ message: 'ID del pedido no proporcionado' });
    }

    const query = 'UPDATE pedidos SET estado = "cancelado" WHERE id = ?';
    database.query(query, [id], (error, results) => {
        if (error) {
            console.error('Error al cancelar el pedido:', error);
            return res.status(500).send('Error al cancelar el pedido');
        }

        if (results.affectedRows === 0) {
            console.log('Pedido no encontrado para el ID:', id);
            return res.status(404).send('Pedido no encontrado');
        }

        console.log('Pedido cancelado con éxito:', id);
        res.json({ message: 'Pedido cancelado con éxito' });
        
    });
});






app.listen(port, () => {
    console.log('Servidor iniciado en ' + port);
});