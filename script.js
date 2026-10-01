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
let historialPedidos = [];
let tabBuffetActiva = 'pedidos';

function cambiarModo(modo) {
    modoActual = modo;
    document.getElementById('btn-cliente').classList.toggle('active', modo === 'cliente');
    document.getElementById('btn-buffet').classList.toggle('active', modo === 'buffet');
    
    if(modo === 'cliente') {
        mostrarCliente(tabClienteActiva);
    } else {
        ordenesNuevas = 0;
        document.getElementById('notif-badge').style.display = 'none';
        mostrarBuffet(tabBuffetActiva);
    }
}

function agregarAlCarrito(index) {
    let itemMenu = menuCliente[index];
    let itemStock = stockBuffet.find(s => s.nombre === itemMenu.nombre);

    if (itemStock && itemMenu.qty >= itemStock.stock) {
        alert(`No hay más stock disponible de ${itemMenu.nombre}. (Stock actual: ${itemStock.stock})`);
        return;
    }

    itemMenu.qty++;
    actualizarVistaActual();
}

function quitarDelCarrito(index) {
    if(menuCliente[index].qty > 0) {
        menuCliente[index].qty--;
        actualizarVistaActual();
    }
}

function actualizarVistaActual() {
    if (tabClienteActiva === 1) renderizarMenuPrincipal();
    else mostrarCliente(tabClienteActiva);
}

function totalCarrito() {
    return menuCliente.reduce((acc, item) => acc + (item.precio * item.qty), 0);
}

function cantCarrito() {
    return menuCliente.reduce((acc, item) => acc + item.qty, 0);
}

function renderizarMenuPrincipal() {
    const qtyPlato0 = document.getElementById('qty-plato-0');
    if (qtyPlato0) qtyPlato0.innerText = menuCliente[0].qty;

    let stockPlato0 = stockBuffet.find(s => s.nombre === menuCliente[0].nombre);
    let contenedorPlatoBtn = document.getElementById('contenedor-plato-dia-btn');
    
    if (stockPlato0 && stockPlato0.stock <= 0) {
        if(contenedorPlatoBtn) {
            contenedorPlatoBtn.innerHTML = `<span style="font-size:11px; background:#ef4444; color:#fff; padding:4px 8px; border-radius:8px; font-weight:bold;">Agotado</span>`;
        }
        if (menuCliente[0].qty > stockPlato0.stock) menuCliente[0].qty = stockPlato0.stock;
    } else {
        if(contenedorPlatoBtn && !contenedorPlatoBtn.innerHTML.includes('agregarAlCarrito')) {
            contenedorPlatoBtn.innerHTML = `
                <button onclick="quitarDelCarrito(0)" style="background: rgba(0,0,0,0.3); border: none; width: 28px; height: 28px; border-radius: 8px; font-weight: bold; color: #fff; cursor: pointer;">-</button>
                <span id="qty-plato-0" style="color: #fff; font-weight: bold; font-size: 14px;">${menuCliente[0].qty}</span>
                <button onclick="agregarAlCarrito(0)" style="background: var(--naranja-rapidin); border: none; width: 28px; height: 28px; border-radius: 8px; font-weight: bold; color: var(--azul-rapidin); cursor: pointer;">+</button>
            `;
        }
    }
    
    let listaHtml = document.getElementById('lista-menu-html');
    if (listaHtml) {
        listaHtml.innerHTML = menuCliente.slice(1).map((item, idx) => {
            let realIdx = idx + 1;
            let stockItem = stockBuffet.find(s => s.nombre === item.nombre);
            let sinStock = stockItem && stockItem.stock <= 0;

            if (sinStock && item.qty > stockItem.stock) {
                item.qty = stockItem.stock;
            }

            return `
                <div style="background: #fff; padding: 10px 14px; border-radius: 14px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 5px rgba(0,0,0,0.03);">
                    <div>
                        <div style="font-size: 13px; font-weight: 700; color: var(--azul-rapidin);">${item.nombre}</div>
                        <div style="font-size: 11px; color: var(--gris-texto);">$${item.precio.toLocaleString()} ${sinStock ? '• <b style="color:#ef4444;">Agotado</b>' : `• Stock: ${stockItem.stock}`}</div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <button onclick="quitarDelCarrito(${realIdx})" style="background: #e5e7eb; border: none; width: 26px; height: 26px; border-radius: 8px; font-weight: bold; cursor: pointer;">-</button>
                        <span style="font-size: 13px; font-weight: 700; min-width: 12px; text-align: center;">${item.qty}</span>
                        ${sinStock ? '' : `<button onclick="agregarAlCarrito(${realIdx})" style="background: var(--naranja-rapidin); border: none; width: 26px; height: 26px; border-radius: 8px; font-weight: bold; cursor: pointer; color: var(--azul-rapidin);">+</button>`}
                    </div>
                </div>
            `;
        }).join('');
    }

    let contenedorBoton = document.getElementById('contenedor-boton-ver-pedido');
    if (contenedorBoton) {
        if (cantCarrito() > 0) {
            contenedorBoton.innerHTML = `
                <div onclick="mostrarCliente(3)" style="background: var(--azul-rapidin); color: #fff; padding: 12px 18px; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; font-weight: 700; font-size: 13px; margin-top: auto; box-shadow: 0 4px 12px rgba(11,41,57,0.2);">
                    <span>Ver Pedido (${cantCarrito()} ítems)</span>
                    <span>$${totalCarrito().toLocaleString()} ➔</span>
                </div>
            `;
        } else {
            contenedorBoton.innerHTML = '';
        }
    }
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
                <div style="display: flex; align-items: center; gap: 6px;" id="contenedor-plato-dia-btn">
                    <button onclick="quitarDelCarrito(0)" style="background: rgba(0,0,0,0.3); border: none; width: 28px; height: 28px; border-radius: 8px; font-weight: bold; color: #fff; cursor: pointer;">-</button>
                    <span id="qty-plato-0" style="color: #fff; font-weight: bold; font-size: 14px;">0</span>
                    <button onclick="agregarAlCarrito(0)" style="background: var(--naranja-rapidin); border: none; width: 28px; height: 28px; border-radius: 8px; font-weight: bold; color: var(--azul-rapidin); cursor: pointer;">+</button>
                </div>
            </div>

            <div style="font-weight: 700; font-size:14px; color: var(--azul-rapidin); margin-top:2px;">Menú Rápido:</div>
            <div style="display: flex; flex-direction: column; gap: 8px;" id="lista-menu-html"></div>
            <div id="contenedor-boton-ver-pedido"></div>
        `;
        renderizarMenuPrincipal();
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

        let esListo = pedidoActual.estado === "Listo para retirar";
        let esEntregado = pedidoActual.estado === "Entregado";
        let colorEstadoBg = esEntregado ? "#e5e7eb" : (esListo ? "#d1fae5" : "#fef3c7");
        let colorEstadoTxt = esEntregado ? "#374151" : (esListo ? "#065f46" : "#b45309");

        container.innerHTML = `
            <div style="font-weight: 700; color: var(--azul-rapidin); margin-top: 5px; display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size: 15px;">Tu Ticket Activo</span>
                ${!esEntregado ? `<button onclick="abrirModal()" style="background:var(--azul-rapidin); color:#fff; border:none; padding:6px 12px; border-radius:10px; font-size:11px; font-weight:600; cursor:pointer;"><i class="fa-solid fa-qrcode"></i> Ver QR</button>` : ''}
            </div>
            <div class="ticket-box">
                <p style="font-size:14px; font-weight:700; color: var(--azul-rapidin);">${pedidoActual.detalleText}</p>
                <p style="font-size:12px; color:var(--gris-texto); margin-top:8px;">Estado del pedido:</p>
                <div style="background: ${colorEstadoBg}; color: ${colorEstadoTxt}; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 700; display: inline-block; margin-top: 4px;">${pedidoActual.estado}</div>
            </div>
            
            ${esEntregado ? `
                <div style="text-align:center; margin-top:10px;">
                    <p style="font-size:12px; color:var(--gris-texto); margin-bottom:10px;">¡Gracias por usar Rapidin!</p>
                    <button onclick="reiniciarPedido()" style="background:var(--naranja-rapidin); border:none; padding:12px; border-radius:14px; font-weight:700; cursor:pointer; color:var(--azul-rapidin); width:100%;">Hacer Nuevo Pedido</button>
                </div>
            ` : `
                <div class="badge-codigo">CODIGO DE RETIRO RÁPIDO</div>
                <div class="codigo-grande">${pedidoActual.idNro}</div>
            `}
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

    for (let itemCliente of menuCliente) {
        if (itemCliente.qty > 0) {
            let itemStock = stockBuffet.find(s => s.nombre === itemCliente.nombre);
            if (itemStock && itemCliente.qty > itemStock.stock) {
                alert(`No hay suficiente stock para ${itemCliente.nombre}. Stock disponible: ${itemStock.stock}`);
                return;
            }
        }
    }

    alert("¡Pago acreditado con éxito! Generando orden...");

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

function reiniciarPedido() {
    pedidoActual = { idNro: null, estado: "Sin confirmar", detalleText: "", total: 0 };
    mostrarCliente(1);
}

function abrirModal() { document.getElementById('modal-comprobante').style.display = 'flex'; }
function cerrarModal() { document.getElementById('modal-comprobante').style.display = 'none'; }

// --- VISTA BUFFET ---
function mostrarBuffet(seccion) {
    tabBuffetActiva = seccion;
    const container = document.getElementById('app-screen');
    const nav = document.getElementById('nav-bar');

    nav.innerHTML = `
        <button class="nav-icon ${seccion==='pedidos'?'active':''}" onclick="mostrarBuffet('pedidos')"><i class="fa-solid fa-list-check"></i> Órdenes</button>
        <button class="nav-icon ${seccion==='historial'?'active':''}" onclick="mostrarBuffet('historial')"><i class="fa-solid fa-clock-rotate-left"></i> Historial</button>
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
    } else if(seccion === 'historial') {
        container.innerHTML = `
            <div class="buffet-header">Historial del Día</div>
            ${historialPedidos.length > 0 ? historialPedidos.map(ord => `
                <div style="background: #fff; border-radius: 18px; padding: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.03); border-left: 6px solid #10b981;">
                    <div style="display:flex; justify-content:space-between; font-weight:700; font-size:14px;">
                        <span style="color:var(--azul-rapidin);">Orden #${ord.id}</span>
                        <span style="color:#059669;">Entregado</span>
                    </div>
                    <p style="font-size:12px; color:#4b5563; margin-top:4px;">${ord.detalle}</p>                     <div style="font-size:11px; color:var(--gris-texto); margin-top:6px;">Total recaudado: <b>$${ord.total.toLocaleString()}</b></div>
                </div>
            `).join('') : '<p style="text-align:center; color:var(--gris-texto); margin-top:40px; font-size:13px;">Aún no hay pedidos entregados en el historial.</p>'}
        `;
    } else {
        container.innerHTML = `
            <div class="buffet-header">Control de Stock Diario</div>
            ${stockBuffet.map((item, idx) => `
                <div class="stock-control-card">
                    <div>
                        <h4 style="font-size:13px; font-weight:700; color:var(--azul-rapidin);">${item.nombre}</h4>
                        <p style="font-size:11px; color:var(--gris-texto);">Disponibles actualmente</p>
                    </div>
                    <div style="display:flex; gap:6px; align-items: center;">
                        <button onclick="modificarStock(${idx}, -1)" style="background:#f3f4f6; border:1px solid #d1d5db; width:26px; height:26px; border-radius:8px; font-weight:bold; cursor:pointer;">-</button>
                        <input type="number" value="${item.stock}" min="0" onchange="actualizarStockTipeado(${idx}, this.value)" style="width: 45px; text-align: center; border: 1px solid #d1d5db; border-radius: 8px; padding: 4px; font-weight: bold; font-size: 13px;">
                        <button onclick="modificarStock(${idx}, 1)" style="background:#f3f4f6; border:1px solid #d1d5db; width:26px; height:26px; border-radius:8px; font-weight:bold; cursor:pointer;">+</button>
                    </div>
                </div>
            `).join('')}
        `;
    }
}

function actualizarStockTipeado(index, valor) {
    let nuevoValor = parseInt(valor);
    if (isNaN(nuevoValor) || nuevoValor < 0) nuevoValor = 0;
    stockBuffet[index].stock = nuevoValor;
}

function cambiarEstado(index) {
    let estados = ["Recibido", "En preparación", "Listo para retirar", "Entregado"];
    let ordenActual = pedidosBuffet[index];
    let actualIdx = estados.indexOf(ordenActual.estado);

    if (actualIdx < estados.length - 1) {
        ordenActual.estado = estados[actualIdx + 1];
        
        if (ordenActual.estado === "Entregado") {
            pedidosBuffet.splice(index, 1);
            historialPedidos.unshift(ordenActual);
        }
    }

    if (pedidoActual.idNro === ordenActual.id) {
        pedidoActual.estado = ordenActual.estado;
    }

    mostrarBuffet('pedidos');
}

function modificarStock(index, delta) {
    stockBuffet[index].stock = Math.max(0, stockBuffet[index].stock + delta);
    mostrarBuffet('stock');
}

// Ocultar el spinner inicial suavemente
window.addEventListener('load', () => {
    setTimeout(() => {
        const loader = document.getElementById('app-loader');
        if(loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 500);
        }
    }, 800);
});

renderizarMenuPrincipal();