const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middleware necesario para leer JSON en las peticiones POST
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cliente.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// --- CREDENCIALES FIJAS DEL ADMIN ---
const ADMIN_USER = "buffet";
const ADMIN_PASS = "unm2026"; // Podes cambiar la contraseña acá

// --- RUTA PARA VALIDAR EL LOGIN DEL ADMIN ---
app.post('/api/login-admin', (req, res) => {
    const { usuario, password } = req.body;
    if (usuario === ADMIN_USER && password === ADMIN_PASS) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: "Credenciales incorrectas" });
    }
});

let estadoBuffet = {
    stock: [
        { nombre: "Menú Estudiantil (Guiso + Pan)", stock: 15 },
        { nombre: "Menú Ejecutivo (Milanesa con Puré)", stock: 10 },
        { nombre: "Menú Especial Veggie (Wok)", stock: 8 },
        { nombre: "Porción de Pastel de Papa", stock: 12 },
        { nombre: "Tarta de Jamón y Queso (Porción)", stock: 14 },
        { nombre: "Ñoquis Caseros con Salsa", stock: 10 },
        { nombre: "Empanadas de Carne (Unidad)", stock: 30 },
        { nombre: "Sánguche de Milanesa Completo", stock: 12 },
        { nombre: "Sánguche de Miga (Jamón y Queso)", stock: 20 },
        { nombre: "Alfajor Regional Triple", stock: 25 },
        { nombre: "Turrón / Barrita de Cereal", stock: 30 },
        { nombre: "Café con 2 Medialunas", stock: 15 },
        { nombre: "Té o Mate cocido con bizcochitos", stock: 15 },
        { nombre: "Agua Saborizada 500ml", stock: 25 },
        { nombre: "Gaseosa Línea Pepsi 500ml", stock: 25 }
    ],
    pedidos: [],
    historial: [],
    tiempoEspera: 5
};

io.on('connection', (socket) => {
    console.log('Usuario conectado:', socket.id);
    socket.emit('actualizar-estado', estadoBuffet);

    socket.on('nuevo-pedido', (data) => {
        data.items.forEach(itemPedido => {
            let itemStock = estadoBuffet.stock.find(s => s.nombre === itemPedido.nombre);
            if (itemStock) {
                itemStock.stock = Math.max(0, itemStock.stock - itemPedido.qty);
            }
        });

        estadoBuffet.pedidos.push(data.orden);
        estadoBuffet.tiempoEspera = estadoBuffet.pedidos.length === 0 ? 0 : 4 + (estadoBuffet.pedidos.length * 3);

        io.emit('actualizar-estado', estadoBuffet);
        io.emit('alerta-nueva-orden', data.orden);
    });

    socket.on('cambiar-estado-orden', (index) => {
        let orden = estadoBuffet.pedidos[index];
        if (orden) {
            if (orden.estado === "En preparación") {
                orden.estado = "Listo para retirar";
            } else if (orden.estado === "Listo para retirar") {
                orden.estado = "Entregado";
                estadoBuffet.pedidos.splice(index, 1);
                estadoBuffet.historial.unshift(orden);
            }
            estadoBuffet.tiempoEspera = estadoBuffet.pedidos.length === 0 ? 0 : 4 + (estadoBuffet.pedidos.length * 3);
            io.emit('actualizar-estado', estadoBuffet);
        }
    });

    socket.on('modificar-stock', ({ index, delta }) => {
        if (estadoBuffet.stock[index]) {
            estadoBuffet.stock[index].stock = Math.max(0, estadoBuffet.stock[index].stock + delta);
            io.emit('actualizar-estado', estadoBuffet);
        }
    });

    socket.on('disconnect', () => {
        console.log('Usuario desconectado:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en la red en el puerto ${PORT}`);
});
