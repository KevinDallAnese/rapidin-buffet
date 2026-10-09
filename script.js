let modoActual = 'cliente';
let ordenesNuevas = 0;
let tabClienteActiva = 1;
let categoriaActiva = 'todos';

let pedidoActual = {
    idNro: null,
    estado: "Sin confirmar",
    detalleText: "",
    total: 0
};

// Menú con imágenes reales de stock (Picsum/Unsplash estables)
let menuCliente = [
    // Destacados (Platos principales del día)
    { id: 1, categoria: "platos", tipo: "destacado-estudiantil", nombre: "Menú Estudiantil (Guiso + Pan)", precio: 9500, qty: 0, imagen: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=150&auto=format&fit=crop&q=80" },
    { id: 2, categoria: "platos", tipo: "destacado-ejecutivo", nombre: "Menú Ejecutivo (Milanesa con Puré)", precio: 12500, qty: 0, imagen: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=150&auto=format&fit=crop&q=80" },
    { id: 3, categoria: "platos", tipo: "destacado-especial", nombre: "Menú Especial Veggie (Wok)", precio: 11000, qty: 0, imagen: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=150&auto=format&fit=crop&q=80" },
    
    // Platos Elaborados
    { id: 4, categoria: "platos", tipo: "normal", nombre: "Porción de Pastel de Papa", precio: 10500, qty: 0, imagen: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=150&auto=format&fit=crop&q=80" },
    { id: 5, categoria: "platos", tipo: "normal", nombre: "Tarta de Jamón y Queso (Porción)", precio: 7500, qty: 0, imagen: "https://images.unsplash.com/photo-1583032015867-e17231780c1d?w=150&auto=format&fit=crop&q=80" },
    { id: 6, categoria: "platos", tipo: "normal", nombre: "Ñoquis Caseros con Salsa", precio: 9800, qty: 0, imagen: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=150&auto=format&fit=crop&q=80" },
    { id: 7, categoria: "platos", tipo: "normal", nombre: "Empanadas de Carne (Unidad)", precio: 1500, qty: 0, imagen: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=150&auto=format&fit=crop&q=80" },

    // Kiosco (Comidas listas para llevar / Snacks / Sándwiches)
    { id: 8, categoria: "kiosco", tipo: "normal", nombre: "Sánguche de Milanesa Completo", precio: 10000, qty: 0, imagen: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=150&auto=format&fit=crop&q=80" },
    { id: 9, categoria: "kiosco", tipo: "normal", nombre: "Sánguche de Miga (Jamón y Queso)", precio: 4000, qty: 0, imagen: "https://images.unsplash.com/photo-1554433549-1db4cb53655a?w=150&auto=format&fit=crop&q=80" },
    { id: 10, categoria: "kiosco", tipo: "normal", nombre: "Alfajor Regional Triple", precio: 2500, qty: 0, imagen: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=150&auto=format&fit=crop&q=80" },
    { id: 11, categoria: "kiosco", tipo: "normal", nombre: "Turrón / Barrita de Cereal", precio: 1000, qty: 0, imagen: "https://images.unsplash.com/photo-1622484218837-3072e143cf59?w=150&auto=format&fit=crop&q=80" },

    // Cafetería
    { id: 12, categoria: "cafeteria", tipo: "normal", nombre: "Café con 2 Medialunas", precio: 4500, qty: 0, imagen: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=150&auto=format&fit=crop&q=80" },
    { id: 13, categoria: "cafeteria", tipo: "normal", nombre: "Té o Mate cocido con bizcochitos", precio: 3000, qty: 0, imagen: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=150&auto=format&fit=crop&q=80" },

    // Bebidas
    { id: 14, categoria: "bebidas", tipo: "normal", nombre: "Agua Saborizada 500ml", precio: 2000, qty: 0, imagen: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=150&auto=format&fit=crop&q=80" },
    { id: 15, categoria: "bebidas", tipo: "normal", nombre: "Gaseosa Línea Pepsi 500ml", precio: 2800, qty: 0, imagen: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=150&auto=format&fit=crop&q=80" }
];

let stockBuffet = [
    { nombre: "Menú Estudiantil (Guiso + Pan)", stock: 15 },
    { nombre: "Menú Ejecutivo (Milanesa con Puré)", stock: 20 },
    { nombre: "Menú Especial Veggie (Wok)", stock: 10 },
    { nombre: "Porción de Pastel de Papa", stock: 12 },
    { nombre: "Tarta de Jamón y Queso (Porción)", stock: 14 },
    { nombre: "Ñoquis Caseros con Salsa", stock: 15 },
    { nombre: "Empanadas de Carne (Unidad)", stock: 30 },
    { nombre: "Sánguche de Milanesa Completo", stock: 24 },
    { nombre: "Sánguche de Miga (Jamón y Queso)", stock: 20 },
    { nombre: "Alfajor Regional Triple", stock: 35 },
    { nombre: "Turrón / Barrita de Cereal", stock: 50 },
    { nombre: "Café con 2 Medialunas", stock: 40 },
    { nombre: "Té o Mate cocido con bizcochitos", stock: 35 },
    { nombre: "Agua Saborizada 500ml", stock: 30 },
    { nombre: "Gaseosa Línea Pepsi 500ml", stock: 25 }
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

function filtrarCategoria(cat) {
    categoriaActiva = (categoriaActiva === cat) ? 'todos' : cat;
    renderizarMenuPrincipal();
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
    let contenedorBannerDestacados = document.getElementById('contenedor-banner-destacados');
    if (contenedorBannerDestacados) {
        if (categoriaActiva === 'todos' || categoriaActiva === 'platos') {
            contenedorBannerDestacados.style.display = 'block';
            let destacadosFiltrados = menuCliente.filter(item => item.tipo.startsWith('destacado-'));
            if (categoriaActiva === 'platos') {
                destacadosFiltrados = destacadosFiltrados.filter(item => item.categoria === 'platos');
            }

            let destacadosHtml = destacadosFiltrados.map(item => {
                let realIdx = menuCliente.findIndex(m => m.id === item.id);
                let stockItem = stockBuffet.find(s => s.nombre === item.nombre);
                let sinStock = stockItem && stockItem.stock <= 0;

                return `
                    <div style="background: linear-gradient(135deg, var(--azul-rapidin) 0%, var(--azul-claro) 100%); color: var(--blanco); border-radius: 20px; padding: 14px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 6px 15px rgba(11, 41, 57, 0.15); gap: 10px;">
                        <img src="${item.imagen}" alt="${item.nombre}" style="width: 55px; height: 55px; border-radius: 14px; object-fit: cover; border: 2px solid rgba(255,255,255,0.2);">
                        <div style="flex-grow: 1;">
                            <span style="font-size: 8px; text-transform: uppercase; color: var(--naranja-rapidin); font-weight:800; letter-spacing: 1px;">Destacado del día</span>
                            <h3 style="font-family: 'Rhodesia', serif; font-size: 14px; color: var(--naranja-rapidin); line-height: 1.1; margin-top: 2px;">${item.nombre}</h3>
                            <p style="font-size: 11px; opacity: 0.85; margin-top: 2px;">$${item.precio.toLocaleString()} ${sinStock ? '• <b style="color:#ef4444;">Agotado</b>' : ''}</p>
                        </div>
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <button onclick="quitarDelCarrito(${realIdx})" style="background: rgba(0,0,0,0.3); border: none; width: 26px; height: 26px; border-radius: 8px; font-weight: bold; color: #fff; cursor: pointer;">-</button>
                            <span style="color: #fff; font-weight: bold; font-size: 13px; min-width: 12px; text-align: center;">${item.qty}</span>
                            ${sinStock ? '' : `<button onclick="agregarAlCarrito(${realIdx})" style="background: var(--naranja-rapidin); border: none; width: 26px; height: 26px; border-radius: 8px; font-weight: bold; color: var(--azul-rapidin); cursor: pointer;">+</button>`}
                        </div>
                    </div>
                `;
            }).join('');
            contenedorBannerDestacados.innerHTML = destacadosHtml;
        } else {
            contenedorBannerDestacados.style.display = 'none';
        }
    }
    
    let itemsFiltrados = [];
    if (categoriaActiva !== 'todos') {
        itemsFiltrados = menuCliente.filter(item => {
            if (item.tipo.startsWith('destacado-')) return false;
            return item.categoria === categoriaActiva;
        });
    }

    let listaHtml = document.getElementById('lista-menu-html');
    if (listaHtml) {
        if (itemsFiltrados.length > 0) {
            listaHtml.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin: 4px 0;">
                    <span style="font-weight: 700; font-size: 14px; color: var(--azul-rapidin);">Opciones de ${categoriaActiva.toUpperCase()}:</span>
                    <button onclick="filtrarCategoria('todos')" style="background: var(--naranja-rapidin); border: none; padding: 4px 10px; border-radius: 10px; font-weight: 700; font-size: 11px; cursor: pointer; color: var(--azul-rapidin);">Volver al Inicio</button>
                </div>
            ` + itemsFiltrados.map((item) => {
                let realIdx = menuCliente.findIndex(m => m.id === item.id);
                let stockItem = stockBuffet.find(s => s.nombre === item.nombre);
                let sinStock = stockItem && stockItem.stock <= 0;

                if (sinStock && item.qty > stockItem.stock) {
                    item.qty = stockItem.stock;
                }

                return `
                    <div style="background: #fff; padding: 10px 14px; border-radius: 14px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 5px rgba(0,0,0,0.03); gap: 10px;">
                        <img src="${item.imagen}" alt="${item.nombre}" style="width: 48px; height: 48px; border-radius: 12px; object-fit: cover;">
                        <div style="flex-grow: 1;">
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
        } else {
            listaHtml.innerHTML = '';
        }
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
        <button class="nav-icon ${id===1?'active':''}" onclick="mostrarCliente(1)">
            <svg viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
            Menú
        </button>
        <button class="nav-icon ${id===2?'active':''}" onclick="mostrarCliente(2)">
            <svg viewBox="0 0 24 24"><path d="M21 5c-1.11 0-2 .89-2 2v2H5V7c0-1.11-.89-2-2-2s-2 .89-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V7c0-1.11-.9-2-2-2m0 14H3V9h18z"/></svg>
            Ticket
        </button>
        <button class="nav-icon ${id===3?'active':''}" onclick="mostrarCliente(3)">
            <svg viewBox="0 0 24 24"><path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2zm-9-2h10V8H12zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
            Pago
        </button>
    `;

    if(id === 1) {
        container.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 5px;">
                <span style="font-weight: 800; font-size: 20px; font-family: 'Rhodesia'; color: var(--azul-rapidin);">Rapidin</span>
                <span style="font-size: 11px; background: #e5e7eb; padding: 4px 10px; border-radius: 20px; font-weight: 600;">UNM Moreno</span>
            </div>

            <!-- Menús Destacados (Arriba) -->
            <div id="contenedor-banner-destacados"></div>

            <!-- Grilla de Categorías (Abajo) -->
            <div id="contenedor-categorias-html">
                <div style="font-weight: 700; font-size: 14px; color: var(--azul-rapidin); margin-bottom: 8px;">Categorías:</div>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 14px;">
                    <div onclick="filtrarCategoria('platos')" style="background: #fff; color: var(--azul-rapidin); padding: 14px; border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.04);">
                        <svg style="width: 26px; height: 26px; fill: var(--azul-rapidin);" viewBox="0 0 24 24"><path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/></svg>
                        <span style="font-size: 12px; font-weight: 700;">Platos</span>
                    </div>
                    <div onclick="filtrarCategoria('kiosco')" style="background: #fff; color: var(--azul-rapidin); padding: 14px; border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.04);">
                        <svg style="width: 26px; height: 26px; fill: var(--azul-rapidin);" viewBox="0 0 24 24"><path d="M20 4H4v2h16V4m1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1m-9 4H6v-4h6v4z"/></svg>
                        <span style="font-size: 12px; font-weight: 700;">Kiosco</span>
                    </div>
                    <div onclick="filtrarCategoria('cafeteria')" style="background: #fff; color: var(--azul-rapidin); padding: 14px; border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.04);">
                        <svg style="width: 26px; height: 26px; fill: var(--azul-rapidin);" viewBox="0 0 24 24"><path d="M2 21h18v-2H2M20 8h-2V5h2m0-2H4v10a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4v-3h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"/></svg>
                        <span style="font-size: 12px; font-weight: 700;">Cafetería</span>
                    </div>
                    <div onclick="filtrarCategoria('bebidas')" style="background: #fff; color: var(--azul-rapidin); padding: 14px; border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.04);">
                        <svg style="width: 26px; height: 26px; fill: var(--azul-rapidin);" viewBox="0 0 24 24"><path d="M3 2l2.01 18.23C5.13 21.23 5.97 22 7 22h10c1.03 0 1.87-.77 1.99-1.77L21 2H3zm9 17c-1.66 0-3-1.34-3-3 0-2 3-5.4 3-5.4s3 3.4 3 5.4c0 1.66-1.34 3-3 3zm6.33-13H5.67l-.44-4h13.54l-.44 4z"/></svg>
                        <span style="font-size: 12px; font-weight: 700;">Bebidas</span>
                    </div>
                </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 8px;" id="lista-menu-html"></div>
            <div id="contenedor-boton-ver-pedido"></div>
        `;
        renderizarMenuPrincipal();
    } else if(id === 2) {
        if(!pedidoActual.idNro) {
            container.innerHTML = `
                <div style="text-align: center; margin-top: 100px; color: var(--azul-rapidin);">
                    <svg style="width:48px; height:48px; fill:var(--naranja-rapidin); margin-bottom:15px;" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8zm2 16H8v-2h8zm0-4H8v-2h8zm-3-5V3.5L18.5 9z"/></svg>
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
                ${!esEntregado ? `<button onclick="abrirModal()" style="background:var(--azul-rapidin); color:#fff; border:none; padding:6px 12px; border-radius:10px; font-size:11px; font-weight:600; cursor:pointer;">Ver QR</button>` : ''}
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
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px solid #f3f4f6; padding-bottom: 6px; gap: 8px;">
                            <img src="${i.imagen}" style="width: 36px; height: 36px; border-radius: 8px; object-fit: cover;">
                            <div style="flex-grow: 1;">
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
                        <svg style="width:16px; height:16px; fill:var(--naranja-rapidin);" viewBox="0 0 24 24"><path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/></svg>
                    </div>
                    <div style="font-size: 13px;">Mercado Pago (QR)</div>
                </div>
                <div class="pay-option" onclick="procesarPagoYGenerarCodigo()">
                    <div style="width: 32px; height: 32px; background: rgba(253,151,2,0.15); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                        <svg style="width:16px; height:16px; fill:var(--naranja-rapidin);" viewBox="0 0 24 24"><path d="M4 10h3v7H4zM10.5 10h3v7h-3zM2 19h20v3H2zM17 10h3v7h-3zM12 1L1 6v2h22V6z"/></svg>
                    </div>
                    <div style="font-size: 13px;">Transferencia Bancaria (Alias UNM)</div>
                </div>
                <div class="pay-option" onclick="procesarPagoYGenerarCodigo()">
                    <div style="width: 32px; height: 32px; background: rgba(253,151,2,0.15); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                        <svg style="width:16px; height:16px; fill:var(--naranja-rapidin);" viewBox="0 0 24 24"><path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2zm-9-2h10V8H12zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
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
        <button class="nav-icon ${seccion==='pedidos'?'active':''}" onclick="mostrarBuffet('pedidos')">
            <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m-5 14H7v-2h7zm3-4H7v-2h10zm0-4H7V7h10z"/></svg>
            Órdenes
        </button>
        <button class="nav-icon ${seccion==='historial'?'active':''}" onclick="mostrarBuffet('historial')">
            <svg viewBox="0 0 24 24"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>
            Historial
        </button>
        <button class="nav-icon ${seccion==='stock'?'active':''}" onclick="mostrarBuffet('stock')">
            <svg viewBox="0 0 24 24"><path d="M20 13H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1m0-10H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1M11 7H6V5h5zm0 10H6v-2h5zm7-4h-5v-2h5zm0-10h-5V5h5z"/></svg>
            Stock
        </button>
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
