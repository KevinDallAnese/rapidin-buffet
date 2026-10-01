let modoActual = 'cliente';
let ordenesNuevas = 0;
let tabClienteActiva = 1;

let pedidoActual = {
    idNro: null,
    estado: "Sin confirmar",
    detalleText: "",
    total: 0
};

let menuCliente = [
    { id: 1, nombre: "Guiso de Lentejas", precio: 12000, qty: 0 },
    { id: 2, nombre: "Sánguche de Milanesa", precio: 10000, qty: 0 },
    { id: 3, nombre: "Fideos con salsa", precio: 8500, qty: 0 },
    { id: 4, nombre: "Café con Medialunas", precio: 4500, qty: 0 },
    { id: 5, nombre: "Agua Saborizada 500ml", precio: 2000, qty: 0 }
];

let stockBuffet = [
    { nombre: "Guiso de Lentejas", stock: 15 },
    { nombre: "Sánguche de Milanesa", stock: 24 },
    { nombre: "Fideos con salsa", stock: 20 },
    { nombre: "Café con Medialunas", stock: 40 },
    { nombre: "Agua Saborizada 500ml", stock: 30 }
];

let pedidosBuffet = [];

function cambiarModo(modo) {
    modoActual = modo;
    document.getElementById('btn-cliente').classList.toggle('active', modo === 'cliente');
    document.getElementById('btn-buffet').classList.toggle('active', modo === 'buffet');
    
    if(modo === 'cliente') {
        mostrarCliente(tabClienteActiva);
    } else {
        ordenesNuevas = 0;
        document.getElementById('notif-badge').style.display = 'none';
        mostrarBuffet('pedidos');
    }
}

function agregarAlCarrito(index) {
    menuCliente[index].qty++;
    mostrarCliente(tabClienteActiva);
}

function quitarDelCarrito(index) {
    if(menuCliente[index].qty > 0) {
        menuCliente[index].qty--;
        mostrarCliente(tabClienteActiva);
    }
}

function totalCarrito() {
    return menuCliente.reduce((acc, item) => acc + (item.precio * item.qty), 0);
}

function cantCarrito() {
    return menuCliente.reduce((acc, item) => acc + item.qty, 0);
}

// --- VISTA CLIENTE ---
function mostrarCliente(id) {
    tabClienteActiva = id;
    const container = document.getElementById('app-screen');
    const nav = document.getElementById('nav-bar');
    
    nav.innerHTML = `
        <button class="nav-icon ${id===1?'active':''}" onclick="mostrarCliente(1)"><i class="fa-solid fa-house"></i></button>
        <button class="nav-icon ${id===2?'active':''}" onclick="mostrarCliente(2)"><i class="fa-solid fa-ticket"></i></button>
        <button class="nav-icon ${id===3?'active':''}" onclick="mostrarCliente(3)"><i class="fa-solid fa-wallet"></i></button>
    `;

    if(id === 1) {
        container.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 5px;">
                <span style="font-weight: 800; font-size: 20px; font-family: 'Rhodesia'; color: var(--azul-rapidin);">Rapidin</span>
                <span style="font-size: 11px; background: #e5e7eb; padding: 4px 10px; border-radius: 20px; font-weight: 600;">UNM Moreno</span>
            </div>

            <!-- Plato del Día -->
            <div class="plato-banner">
                <div>
                    <span style="font-size: 10px; text-transform: uppercase; color: var(--naranja-rapidin); font-weight:800;">Plato del día</span>
                    <h2>PLATO<br>DEL DÍA</h2>
                    <p style="font-size:12px; opacity:0.9; margin-top: 4px;">guiso de lentejas • $12.000</p>
                </div>
                <div style="display: flex; align-items: center; gap: 6px;">
                    <button onclick="quitarDelCarrito(0)" style="background: rgba(0,0,0,0.3); border: none; width: 28px; height: 28px; border-radius: 8px; font-weight: bold; color: #fff; cursor: pointer;">-</button>
                    <span style="color: #fff; font-weight: bold; font-size: 14px;">${menuCliente[0].qty}</span>
                    <button onclick="agregarAlCarrito(0)" style="background: var(--naranja-rapidin); border: none; width: 28px; height: 28px; border-radius: 8px; font-weight: bold; color: var(--azul-rapidin); cursor: pointer;">+</button>
                </div>
            </div>

            <div style="font-weight: 700; font-size:14px; color: var(--azul-rapidin); margin-top:2px;">Menú Rápido:</div>
            
            <div style="display: flex; flex-direction: column; gap: 8px;">
                ${menuCliente.slice(1).map((item, idx) => `
                    <div style="background: #fff; padding: 10px 14px; border-radius: 14px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 5px rgba(0,0,0,0.03);">
                        <div>
                            <div style="font-size: 13px; font-weight: 700; color: var(--azul-rapidin);">${item.nombre}</div>                             <div style="font-size: 11px; color: var(--gris-texto);">$${item.precio.toLocaleString()}</div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <button onclick="quitarDelCarrito(${idx + 1})" style="background: #e5e7eb; border: none; width: 26px; height: 26px; border-radius: 8px; font-weight: bold; cursor: pointer;">-</button>
                            <span style="font-size: 13px; font-weight: 700; min-width: 12px; text-align: center;">${item.qty}</span>
                            <button onclick="agregarAlCarrito(${idx + 1})" style="background: var(--naranja-rapidin); border: none; width: 26px; height: 26px; border-radius: 8px; font-weight: bold; cursor: pointer; color: var(--azul-rapidin);">+</button>
                        </div>
                    </div>
                `).join('')}
            </div>

            ${cantCarrito() > 0 ? `
                <div onclick="mostrarCliente(3)" style="background: var(--azul-rapidin); color: #fff; padding: 12px 18px; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; font-weight: 700; font-size: 13px; margin-top: auto; box-shadow: 0 4px 12px rgba(11,41,57,0.2);">
                    <span>Ver Pedido (${cantCarrito()} ítems)</span>                     <span>$${totalCarrito().toLocaleString()} ➔</span>
                </div>
            ` : ''}
        `;
    } else if(id === 2) {
        if(!pedidoActual.idNro) {
            container.innerHTML = `
                <div style="text-align: center; margin-top: 100px; color: var(--azul-rapidin);">
                    <i class="fa-solid fa-receipt" style="font-size: 48px; color: var(--naranja-rapidin); margin-bottom: 15px;"></i>
                    <h3 style="font-family: 'Rhodesia'; font-size: 20px;">No tenés ningún ticket activo</h3>
                    <p style="font-size: 13px; color: var(--gris-texto); margin: 10px 0 20px 0;">Armá tu pedido en el menú y abonalo para generar tu código QR de retiro.</p>
                    <button onclick="mostrarCliente(1)" style="background: var(--naranja-rapidin); border: none; padding: 10px 20px; border-radius: 14px; font-weight: 700; cursor: pointer; color: var(--azul-rapidin);">Ir al Menú</button>
                </div>
            `;
            return;
        }

        // Estilos dinámicos según el estado del pedido
        let esListo = pedidoActual.estado === "Listo para retirar" || pedidoActual.estado === "Entregado";
        let colorEstadoBg = esListo ? "#d1fae5" : "#fef3c7";
        let colorEstadoTxt = esListo ? "#065f46" : "#b45309";

        container.innerHTML = `
            <div style="font-weight: 700; color: var(--azul-rapidin); margin-top: 5px; display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size: 15px;">Tu Ticket Activo</span>
                <button onclick="abrirModal()" style="background:var(--azul-rapidin); color:#fff; border:none; padding:6px 12px; border-radius:10px; font-size:11px; font-weight:600; cursor:pointer;"><i class="fa-solid fa-qrcode"></i> Ver QR</button>
            </div>
            <div class="ticket-box">
                <p style="font-size:14px; font-weight:700; color: var(--azul-rapidin);">${pedidoActual.detalleText}</p>
                <p style="font-size:12px; color:var(--gris-texto); margin-top:8px;">Estado del pedido:</p>
                <div style="background: ${colorEstadoBg}; color: ${colorEstadoTxt}; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 700; display: inline-block; margin-top: 4px;">${pedidoActual.estado}</div>
            </div>
            <div class="badge-codigo">CODIGO DE RETIRO RÁPIDO</div>
            <div class="codigo-grande">${pedidoActual.idNro}</div>
        `;
    } else if(id === 3) {
        let itemsEnCarrito = menuCliente.filter(i => i.qty > 0);
        
        container.innerHTML = `
            <div style="font-weight: 700; color: var(--azul-rapidin); margin-top: 5px; font-size: 15px;">Revisá y modificá tu pedido:</div>
            
            <div style="background: #fff; padding: 12px; border-radius: 14px; font-size: 13px; max-height: 180px; overflow-y: auto; box-shadow: 0 2px 5px rgba(0,0,0,0.03);">
                ${itemsEnCarrito.length > 0 ? itemsEnCarrito.map(i => {
                    let originalIndex = menuCliente.findIndex(m => m.id === i.id);
                    return `
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px solid #f3f4f6; padding-bottom: 6px;">
                            <div>
                                <div style="font-weight: 700; font-size: 12px;">${i.nombre}</div>                                 <div style="font-size: 11px; color: var(--gris-texto);">$${(i.precio * i.qty).toLocaleString()}</div>
                            </div>
                            <div style="display: flex; align-items: center; gap: 6px;">
                                <button onclick="quitarDelCarrito(${originalIndex})" style="background: #f3f4f6; border: 1px solid #d1d5db; width: 22px; height: 22px; border-radius: 6px; font-weight: bold; cursor: pointer;">-</button>
                                <span style="font-size: 12px; font-weight: bold; min-width: 10px; text-align: center;">${i.qty}</span>
                                <button onclick="agregarAlCarrito(${originalIndex})" style="background: var(--naranja-rapidin); border: none; width: 22px; height: 22px; border-radius: 6px; font-weight: bold; color: var(--azul-rapidin); cursor: pointer;">+</button>
                            </div>
                        </div>
                    `;
                }).join('') : '<p style="font-size:12px; color:#666; text-align:center;">El carrito está vacío. <a href="#" onclick="mostrarCliente(1)" style="color:var(--naranja-rapidin); font-weight:bold;">Volver al menú</a></p>'}
                
                ${itemsEnCarrito.length > 0 ? `
                    <div style="font-weight: 700; margin-top: 8px; font-size: 13px; display: flex; justify-content: space-between;">
                        <span>Total:</span>
                        <span style="color: #d97706;">$${totalCarrito().toLocaleString()}</span>
                    </div>
                ` : ''}
            </div>

            ${itemsEnCarrito.length > 0 ? `
                <div style="font-weight: 700; color: var(--azul-rapidin); font-size: 14px; margin-top: 2px;">Seleccioná medio de pago:</div>
                
                <div class="pay-option" onclick="procesarPagoYGenerarCodigo()">
                    <div style="width: 32px; height: 32px; background: rgba(253,151,2,0.15); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                        <i class="fa-solid fa-mobile-screen-button" style="font-size:14px; color:var(--naranja-rapidin);"></i>
                    </div>
                    <div style="font-size: 13px;">Mercado Pago (QR)</div>
                </div>
                <div class="pay-option" onclick="procesarPagoYGenerarCodigo()">
                    <div style="width: 32px; height: 32px; background: rgba(253,151,2,0.15); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                        <i class="fa-solid fa-building-columns" style="font-size:14px; color:var(--naranja-rapidin);"></i>
                    </div>
                    <div style="font-size: 13px;">Transferencia Bancaria (Alias UNM)</div>
                </div>
                <div class="pay-option" onclick="procesarPagoYGenerarCodigo()">
                    <div style="width: 32px; height: 32px; background: rgba(253,151,2,0.15); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                        <i class="fa-solid fa-money-bill-wave" style="font-size:14px; color:var(--naranja-rapidin);"></i>
                    </div>
                    <div style="font-size: 13px;">Efectivo en Ventanilla Flash</div>
                </div>
            ` : ''}
        `;
    }
}

function procesarPagoYGenerarCodigo() {
    if(cantCarrito() === 0) {
        alert("Por favor, sumá al menos un producto al pedido.");
        return;
    }

    menuCliente.forEach(itemCliente => {
        if(itemCliente.qty > 0) {
            let itemStock = stockBuffet.find(s => s.nombre === itemCliente.nombre);
            if(itemStock) {
                itemStock.stock = Math.max(0, itemStock.stock - itemCliente.qty);
            }
        }
    });

    let nroAleatorio = Math.floor(1000 + Math.random() * 9000);
    let detalleStr = menuCliente.filter(i => i.qty > 0).map(i => `${i.qty}x ${i.nombre}`).join(', ');

    pedidoActual = {
        idNro: nroAleatorio,
        estado: "En preparación",
        detalleText: detalleStr,
        total: totalCarrito()
    };

    document.getElementById('modal-nro-orden').innerText = '#' + nroAleatorio;

    ordenesNuevas++;
    const badge = document.getElementById('notif-badge');
    badge.style.display = 'flex';
    badge.innerText = ordenesNuevas;

    pedidosBuffet.unshift({ 
        id: nroAleatorio, 
        detalle: detalleStr, 
        total: totalCarrito(), 
        estado: "En preparación" 
    });

    menuCliente.forEach(i => i.qty = 0);
    mostrarCliente(2);
}

function abrirModal() { document.getElementById('modal-comprobante').style.display = 'flex'; }
function cerrarModal() { document.getElementById('modal-comprobante').style.display = 'none'; }

// --- VISTA BUFFET ---
function mostrarBuffet(seccion) {
    const container = document.getElementById('app-screen');
    const nav = document.getElementById('nav-bar');

    nav.innerHTML = `
        <button class="nav-icon ${seccion==='pedidos'?'active':''}" onclick="mostrarBuffet('pedidos')"><i class="fa-solid fa-list-check"></i> Órdenes</button>
        <button class="nav-icon ${seccion==='stock'?'active':''}" onclick="mostrarBuffet('stock')"><i class="fa-solid fa-boxes-stacked"></i> Stock</button>
    `;

    if(seccion === 'pedidos') {
        container.innerHTML = `
            <div class="buffet-header">Gestión de Take Away</div>
            ${pedidosBuffet.length > 0 ? pedidosBuffet.map((ord, idx) => `
                <div class="order-card">
                    <div style="display:flex; justify-content:space-between; font-weight:700; font-size:15px;">
                        <span style="color:var(--azul-rapidin);">Orden #${ord.id}</span>                         <span style="color:#d97706;">$${ord.total.toLocaleString()}</span>
                    </div>
                    <p style="font-size:13px; color:#4b5563;">${ord.detalle}</p>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
                        <span style="font-size:11px; color:var(--gris-texto);">Estado: <b style="color:var(--azul-rapidin);">${ord.estado}</b></span>
                        <button class="btn-action-buffet" onclick="cambiarEstado(${idx})">Avanzar ➔</button>
                    </div>
                </div>
            `).join('') : '<p style="text-align:center; color:var(--gris-texto); margin-top:40px; font-size:13px;">No hay órdenes entrantes en este momento.</p>'}
        `;
    } else {
        container.innerHTML = `
            <div class="buffet-header">Control de Stock Diario</div>
            ${stockBuffet.map((item, idx) => `
                <div class="stock-control-card">
                    <div>
                        <h4 style="font-size:13px; font-weight:700; color:var(--azul-rapidin);">${item.nombre}</h4>
                        <p style="font-size:11px; color:var(--gris-texto);">Disponibles: <b>${item.stock} u.</b></p>
                    </div>
                    <div style="display:flex; gap:8px;">
                        <button onclick="modificarStock(${idx}, -1)" style="background:#f3f4f6; border:1px solid #d1d5db; width:30px; height:30px; border-radius:10px; font-weight:bold; cursor:pointer;">-</button>
                        <button onclick="modificarStock(${idx}, 1)" style="background:#f3f4f6; border:1px solid #d1d5db; width:30px; height:30px; border-radius:10px; font-weight:bold; cursor:pointer;">+</button>
                    </div>
                </div>
            `).join('')}
        `;
    }
}

function cambiarEstado(index) {
    let estados = ["Recibido", "En preparación", "Listo para retirar", "Entregado"];
    let ordenActual = pedidosBuffet[index];
    let actualIdx = estados.indexOf(ordenActual.estado);

    if(actualIdx < estados.length - 1) {
        ordenActual.estado = estados[actualIdx + 1];
    } else {
        ordenActual.estado = "Entregado";
    }

    // Si la orden cambiada es la del alumno actual, sincronizamos su estado al instante
    if(pedidoActual.idNro === ordenActual.id) {
        pedidoActual.estado = ordenActual.estado;
    }

    mostrarBuffet('pedidos');
}

function modificarStock(index, delta) {
    stockBuffet[index].stock = Math.max(0, stockBuffet[index].stock + delta);
    mostrarBuffet('stock');
}

cambiarModo('cliente');
