require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Error al conectar a la base de datos:', err);
    } else {
        console.log('✅ ¡Base de datos conectada con éxito a Neon!', res.rows[0].now);
    }
});

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cliente.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

const ADMIN_USER = "buffet";
const ADMIN_PASS = "unm2026";

app.post('/api/login-admin', (req, res) => {
    const { usuario, password } = req.body;
    if (usuario === ADMIN_USER && password === ADMIN_PASS) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: "Credenciales incorrectas" });
    }
});

let estadoBuffet = {
    stock: [], 
    pedidos: [],
    historial: [],
    tiempoEspera: 5,
    modoAutonomo: false
};

let modoAutonomo = false;

async function inicializarConfigAutonomia() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS config_sistema (
                clave VARCHAR(50) PRIMARY KEY,
                valor BOOLEAN NOT NULL
            )
        `);
        await pool.query(`
            INSERT INTO config_sistema (clave, valor)
            VALUES ('modo_autonomo', false)
            ON CONFLICT (clave) DO NOTHING
        `);
        const res = await pool.query(`SELECT valor FROM config_sistema WHERE clave = 'modo_autonomo'`);
        if (res.rows.length > 0) {
            modoAutonomo = res.rows[0].valor;
            estadoBuffet.modoAutonomo = modoAutonomo;
        }
    } catch (error) {
        console.error("❌ Error al cargar config de autonomía:", error);
    }
}

async function cargarDatosDesdeDB() {
    try {
        await inicializarConfigAutonomia();

        const resProductos = await pool.query('SELECT id, nombre, precio, stock, categoria, imagen FROM productos ORDER BY id ASC');
        
        estadoBuffet.stock = resProductos.rows.map(p => {
            let cat = (p.categoria || 'platos').toLowerCase();
            let imgDefault = "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=150&auto=format&fit=crop&q=80";
            let imgUrl = p.imagen ? p.imagen : imgDefault;

            if (imgUrl.includes('drive.google.com')) {
                let match = imgUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) || imgUrl.match(/id=([a-zA-Z0-9_-]+)/);
                if (match && match[1]) {
                    let fileId = match[1];
                    imgUrl = `https://lh3.googleusercontent.com/d/${fileId}=s220`; 
                }
            }

            return {
                id: p.id,
                nombre: p.nombre,
                precio: Number(p.precio),
                stock: p.stock,
                categoria: cat,
                imagen: imgUrl
            };
        });

        const resPedidos = await pool.query(`
            SELECT p.id, p.codigo_ticket, p.estado, p.total,
                   (SELECT string_agg(dp.cantidad || 'x ' || pr.nombre, ', ') 
                    FROM detalle_pedido dp 
                    JOIN productos pr ON dp.producto_id = pr.id 
                    WHERE dp.pedido_id = p.id) as detalle
            FROM pedidos p
            WHERE p.estado != 'Entregado'
            ORDER BY p.id ASC
        `);

        estadoBuffet.pedidos = resPedidos.rows.map(p => ({
            id: p.id,
            codigoTicket: p.codigo_ticket || p.id,
            estado: p.estado,
            total: Number(p.total),
            detalle: p.detalle || "Pedido de cantina",
            nota: ""
        }));

        estadoBuffet.tiempoEspera = estadoBuffet.pedidos.length === 0 ? 0 : 4 + (estadoBuffet.pedidos.length * 3);

        console.log(`📦 Datos sincronizados desde Neon. Modo autónomo: ${modoAutonomo ? 'ON' : 'OFF'}`);
    } catch (error) {
        console.error("❌ Error al sincronizar con la base de datos:", error);
    }
}

cargarDatosDesdeDB();

io.on('connection', (socket) => {
    console.log('Usuario conectado:', socket.id);

    // Enviar estado actual (incluye modoAutonomo) apenas se conecta
    socket.emit('actualizar-estado', estadoBuffet);
    socket.emit('estado-autonomia', modoAutonomo);

    // Listener global para prender/apagar el modo autónomo y guardarlo en Neon
    socket.on('toggle-autonomia', async (estado) => {
        modoAutonomo = Boolean(estado);
        estadoBuffet.modoAutonomo = modoAutonomo;
        try {
            await pool.query(
                `UPDATE config_sistema SET valor = $1 WHERE clave = 'modo_autonomo'`,
                [modoAutonomo]
            );
        } catch (error) {
            console.error("❌ Error al guardar estado de autonomía:", error);
        }
        io.emit('estado-autonomia', modoAutonomo);
        io.emit('actualizar-estado', estadoBuffet);
        console.log(`Modo autónomo global: ${modoAutonomo ? 'ACTIVADO' : 'APAGADO'}`);
    });

    socket.on('nuevo-pedido', async (data) => {
        try {
            const totalPedido = data.orden.total || 0;
            const codigoTicket = data.orden.codigoTicket || Math.floor(1000 + Math.random() * 9000);
            
            const queryPedido = `INSERT INTO pedidos (usuario_id, estado, total, codigo_ticket) VALUES ($1, $2, $3, $4) RETURNING id`;
            const resPedido = await pool.query(queryPedido, [1, 'En preparación', totalPedido, codigoTicket]);
            const nuevoPedidoId = resPedido.rows[0].id;

            for (let itemPedido of data.items) {
                let itemStock = estadoBuffet.stock.find(s => s.id === itemPedido.id || s.nombre === itemPedido.nombre);
                
                if (itemStock) {
                    itemStock.stock = Math.max(0, itemStock.stock - itemPedido.qty);

                    await pool.query(
                        'UPDATE productos SET stock = $1 WHERE id = $2',
                        [itemStock.stock, itemStock.id]
                    );

                    await pool.query(
                        'INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad) VALUES ($1, $2, $3)',
                        [nuevoPedidoId, itemStock.id, itemPedido.qty]
                    );
                }
            }

            data.orden.id = nuevoPedidoId;
            data.orden.codigoTicket = codigoTicket;
            data.orden.estado = "En preparación";
            
            estadoBuffet.pedidos.push(data.orden);
            estadoBuffet.tiempoEspera = estadoBuffet.pedidos.length === 0 ? 0 : 4 + (estadoBuffet.pedidos.length * 3);

            io.emit('actualizar-estado', estadoBuffet);
            io.emit('alerta-nueva-orden', data.orden);
            console.log(`✅ Pedido #${codigoTicket} guardado en Neon con éxito.`);

            // SIMULACIÓN AUTÓNOMA, RÁPIDA Y RE-STOCK ROBUSTO PARA LA MUESTRA
            if (modoAutonomo) {
                setTimeout(async () => {
                    let indexOrden = estadoBuffet.pedidos.findIndex(o => o.codigoTicket === codigoTicket);
                    if (indexOrden !== -1 && estadoBuffet.pedidos[indexOrden].estado === "En preparación") {
                        estadoBuffet.pedidos[indexOrden].estado = "Listo para retirar";
                        
                        await pool.query(
                            'UPDATE pedidos SET estado = $1 WHERE id = $2',
                            ["Listo para retirar", nuevoPedidoId]
                        );

                        io.emit('actualizar-estado', estadoBuffet);
                        console.log(`[Modo Autónomo] Orden #${codigoTicket} lista para retirar.`);

                        setTimeout(async () => {
                            let indexActual = estadoBuffet.pedidos.findIndex(o => o.codigoTicket === codigoTicket);
                            if (indexActual !== -1 && estadoBuffet.pedidos[indexActual].estado === "Listo para retirar") {
                                let ordenEntregada = estadoBuffet.pedidos.splice(indexActual, 1)[0];
                                ordenEntregada.estado = "Entregado";
                                estadoBuffet.historial.unshift(ordenEntregada);

                                await pool.query(
                                    'UPDATE pedidos SET estado = $1 WHERE id = $2',
                                    ["Entregado", nuevoPedidoId]
                                );

                                for (let itemPedido of data.items) {
                                    let itemStock = estadoBuffet.stock.find(s => 
                                        s.id == itemPedido.id || 
                                        s.nombre.toLowerCase().trim() === (itemPedido.nombre || '').toLowerCase().trim()
                                    );

                                    if (itemStock) {
                                        itemStock.stock = 50; 
                                        await pool.query(
                                            'UPDATE productos SET stock = $1 WHERE id = $2',
                                            [50, itemStock.id]
                                        );
                                        console.log(`🔄 [Re-stock] Producto "${itemStock.nombre}" restablecido a 50.`);
                                    }
                                }

                                await cargarDatosDesdeDB();

                                estadoBuffet.tiempoEspera = estadoBuffet.pedidos.length === 0 ? 0 : 4 + (estadoBuffet.pedidos.length * 3);
                                io.emit('actualizar-estado', estadoBuffet);
                                console.log(`[Modo Autónomo] Pedido archivado y stock repuesto automáticamente a 50.`);
                            }
                        }, 8000); 
                    }
                }, 5000); 
            }

        } catch (error) {
            console.error("❌ Error al procesar y guardar el nuevo pedido:", error);
        }
    });

    socket.on('cambiar-estado-orden', async (index) => {
        let orden = estadoBuffet.pedidos[index];
        if (orden) {
            if (orden.estado === "En preparación") {
                orden.estado = "Listo para retirar";
            } else if (orden.estado === "Listo para retirar") {
                orden.estado = "Entregado";
                estadoBuffet.pedidos.splice(index, 1);
                estadoBuffet.historial.unshift(orden);
            }
            
            if (orden.id) {
                try {
                    await pool.query(
                        'UPDATE pedidos SET estado = $1 WHERE id = $2',
                        [orden.estado, orden.id]
                    );
                } catch (error) {
                    console.error("❌ Error al actualizar estado en Neon:", error);
                }
            }

            estadoBuffet.tiempoEspera = estadoBuffet.pedidos.length === 0 ? 0 : 4 + (estadoBuffet.pedidos.length * 3);
            io.emit('actualizar-estado', estadoBuffet);
        }
    });

    socket.on('modificar-stock', async ({ index, delta }) => {
        if (estadoBuffet.stock[index]) {
            estadoBuffet.stock[index].stock = Math.max(0, estadoBuffet.stock[index].stock + delta);
            let productoModificado = estadoBuffet.stock[index];

            try {
                await pool.query(
                    'UPDATE productos SET stock = $1 WHERE id = $2',
                    [productoModificado.stock, productoModificado.id]
                );
            } catch (error) {
                console.error("❌ Error al modificar stock en Neon:", error);
            }

            io.emit('actualizar-estado', estadoBuffet);
        }
    });

    socket.on('agregar-producto', async (nuevoProd) => {
        try {
            const query = `INSERT INTO productos (nombre, precio, stock, categoria, imagen, disponible) VALUES ($1, $2, $3, $4, $5, true) RETURNING id`;
            await pool.query(query, [nuevoProd.nombre, nuevoProd.precio, nuevoProd.stock, nuevoProd.categoria || 'platos', nuevoProd.imagen || '']);
            
            await cargarDatosDesdeDB();
            io.emit('actualizar-estado', estadoBuffet);
            console.log(`✅ Producto "${nuevoProd.nombre}" agregado con éxito.`);
        } catch (error) {
            console.error("❌ Error al agregar producto en Neon:", error);
        }
    });

    socket.on('modificar-nombre-producto', async ({ id, nombre }) => {
        try {
            await pool.query('UPDATE productos SET nombre = $1 WHERE id = $2', [nombre, id]);
            
            await cargarDatosDesdeDB();
            io.emit('actualizar-estado', estadoBuffet);
            console.log(`✅ Producto ID ${id} actualizado a "${nombre}".`);
        } catch (error) {
            console.error("❌ Error al modificar nombre:", error);
        }
    });

    socket.on('modificar-precio-producto', async ({ id, precio }) => {
        try {
            await pool.query('UPDATE productos SET precio = $1 WHERE id = $2', [precio, id]);
            
            await cargarDatosDesdeDB();
            io.emit('actualizar-estado', estadoBuffet);
            console.log(`✅ Producto ID ${id} actualizado a precio: $${precio}.`);
        } catch (error) {
            console.error("❌ Error al modificar precio:", error);
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
