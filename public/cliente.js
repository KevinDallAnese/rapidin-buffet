const socket = io();

let tabClienteActiva = 1;
let categoriaActiva = 'todos';
let textoBusqueda = '';
let tiempoEsperaServidor = 5;

// Array para soportar múltiples tickets activos del mismo alumno
let misTicketsActivos = [];
let misPedidosHistorial = [];

let menuCliente = [
    { id: 1, categoria: "platos", tipo: "destacado-estudiantil", nombre: "Menú Estudiantil (Guiso + Pan)", precio: 9500, qty: 0, imagen: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=150&auto=format&fit=crop&q=80" },
    { id: 2, categoria: "platos", tipo: "destacado-ejecutivo", nombre: "Menú Ejecutivo (Milanesa con Puré)", precio: 12500, qty: 0, imagen: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=150&auto=format&fit=crop&q=80" },
    { id: 3, categoria: "platos", tipo: "destacado-especial", nombre: "Menú Especial Veggie (Wok)", precio: 11000, qty: 0, imagen: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=150&auto=format&fit=crop&q=80" },
    { id: 4, categoria: "platos", tipo: "normal", nombre: "Porción de Pastel de Papa", precio: 10500, qty: 0, imagen: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=150&auto=format&fit=crop&q=80" },
    { id: 5, categoria: "platos", tipo: "normal", nombre: "Tarta de Jamón y Queso (Porción)", precio: 7500, qty: 0, imagen: "https://images.unsplash.com/photo-1583032015867-e17231780c1d?w=150&auto=format&fit=crop&q=80" },
    { id: 6, categoria: "platos", tipo: "normal", nombre: "Ñoquis Caseros con Salsa", precio: 9800, qty: 0, imagen: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=150&auto=format&fit=crop&q=80" },
    { id: 7, categoria: "platos", tipo: "normal", nombre: "Empanadas de Carne (Unidad)", precio: 1500, qty: 0, imagen: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=150&auto=format&fit=crop&q=80" },
    { id: 8, categoria: "kiosco", tipo: "normal", nombre: "Sánguche de Milanesa Completo", precio: 10000, qty: 0, imagen: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=150&auto=format&fit=crop&q=80" },
    { id: 9, categoria: "kiosco", tipo: "normal", nombre: "Sánguche de Miga (Jamón y Queso)", precio: 4000, qty: 0, imagen: "https://images.unsplash.com/photo-1554433549-1db4cb53655a?w=150&auto=format&fit=crop&q=80" },
    { id: 10, categoria: "kiosco", tipo: "normal", nombre: "Alfajor Regional Triple", precio: 2500, qty: 0, imagen: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=150&auto=format&fit=crop&q=80" },
    { id: 11, categoria: "kiosco", tipo: "normal", nombre: "Turrón / Barrita de Cereal", precio: 1000, qty: 0, imagen: "https://images.unsplash.com/photo-1622484218837-3072e143cf59?w=150&auto=format&fit=crop&q=80" },
    { id: 12, categoria: "cafeteria", tipo: "normal", nombre: "Café con 2 Medialunas", precio: 4500, qty: 0, imagen: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=150&auto=format&fit=crop&q=80" },
    { id: 13, categoria: "cafeteria", tipo: "normal", nombre: "Té o Mate cocido con bizcochitos", precio: 3000, qty: 0, imagen: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=150&auto=format&fit=crop&q=80" },
    { id: 14, categoria: "bebidas", tipo: "normal", nombre: "Agua Saborizada 500ml", precio: 2000, qty: 0, imagen: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=150&auto=format&fit=crop&q=80" },
    { id: 15, categoria: "bebidas", tipo: "normal", nombre: "Gaseosa Línea Pepsi 500ml", precio: 2800, qty: 0, imagen: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=150&auto=format&fit=crop&q=80" }
];

let stockBuffet = [];
let pedidosBuffetServidor = [];

socket.on('actualizar-estado', (data) => {
    stockBuffet = data.stock;
    pedidosBuffetServidor = data.pedidos;
    tiempoEsperaServidor = data.tiempoEspera || 5;

    // Sincronizar cada ticket activo del alumno
    misTicketsActivos.forEach(ticket => {
        let ordenEncontrada = pedidosBuffetServidor.find(o => o.id === ticket.idNro);
        if (ordenEncontrada) {
            if (ordenEncontrada.estado === "Listo para retirar" && ticket.estado !== "Listo para retirar") {
                mostrarToast(`¡Tu orden #${ticket.idNro} está lista para retirar!`, "success");
            }
            ticket.estado = ordenEncontrada.estado;
        } else {
            let enHistorial = data.historial.find(o => o.id === ticket.idNro);
            if (enHistorial && ticket.estado !== "Entregado") {
                ticket.estado = "Entregado";
                misPedidosHistorial.unshift({ ...ticket });
            }
        }
    });

    // Mover los entregados fuera de activos
    misTicketsActivos = misTicketsActivos.filter(t => t.estado !== "Entregado");

    actualizarVistaActual();
});

function mostrarToast(mensaje, tipo = "info") {
    let contenedorToast = document.getElementById('toast-container');
    if (!contenedorToast) {
        contenedorToast = document.createElement('div');
        contenedorToast.id = 'toast-container';
        document.body.appendChild(contenedorToast);
    }

    const toast = document.createElement('div');
    toast.className = `custom-toast ${tipo}`;
    toast.innerText = mensaje;
    contenedorToast.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}

function seleccionarRol(rol) {
    if (rol === 'admin') {
        window.location.href = '/admin';
    } else {
        let login = document.getElementById('pantalla-login');
        if(login) login.style.display = 'none';
        mostrarCliente(1);
    }
}

function filtrarCategoria(cat) {
    categoriaActiva = (categoriaActiva === cat) ? 'todos' : cat;
    textoBusqueda = '';
    let inputBuscador = document.getElementById('input-busqueda');
    if(inputBuscador) inputBuscador.value = '';
    if (tabClienteActiva === 1) renderizarMenuPrincipal();
}

function filtrarBusqueda(input) {
    textoBusqueda = input.toLowerCase().trim();
    renderizarMenuPrincipal();
}

function agregarAlCarrito(index) {
    let itemMenu = menuCliente[index];
    let itemStock = stockBuffet.find(s => s.nombre === itemMenu.nombre);

    if (itemStock && itemMenu.qty >= itemStock.stock) {
        mostrarToast(`No hay más stock disponible de ${itemMenu.nombre}.`, "error");
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
    if (tabClienteActiva === 1) {
        renderizarMenuPrincipal();
    } else {
        mostrarCliente(tabClienteActiva, false);
    }
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
        if (categoriaActiva === 'todos' && textoBusqueda === '') {
            contenedorBannerDestacados.style.display = 'block';
            let destacadosFiltrados = menuCliente.filter(item => item.tipo.startsWith('destacado-'));

            let destacadosHtml = destacadosFiltrados.map(item => {
                let realIdx = menuCliente.findIndex(m => m.id === item.id);
                let stockItem = stockBuffet.find(s => s.nombre === item.nombre);
                let sinStock = stockItem && stockItem.stock <= 0;

                return `
                    <div style="background: linear-gradient(135deg, var(--azul-rapidin) 0%, var(--azul-claro) 100%); color: var(--blanco); border-radius: 20px; padding: 14px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 6px 15px rgba(11, 41, 57, 0.15); gap: 10px; opacity: ${sinStock ? '0.6' : '1'};">
                        <img src="${item.imagen}" alt="${item.nombre}" style="width: 55px; height: 55px; border-radius: 14px; object-fit: cover; border: 2px solid rgba(255,255,255,0.2);">
                        <div style="flex-grow: 1;">
                            <span style="font-size: 8px; text-transform: uppercase; color: var(--naranja-rapidin); font-weight:800; letter-spacing: 1px;">Destacado del día</span>
                            <h3 style="font-family: 'Rhodesia', serif; font-size: 14px; color: var(--naranja-rapidin); line-height: 1.1; margin-top: 2px;">${item.nombre}</h3>
                            <p style="font-size: 11px; opacity: 0.85; margin-top: 2px;">$${item.precio.toLocaleString()} ${sinStock ? '• <b style="color:#ef4444;">AGOTADO</b>' : ''}</p>
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
    if (textoBusqueda !== '') {
        itemsFiltrados = menuCliente.filter(item => item.nombre.toLowerCase().includes(textoBusqueda));
    } else if (categoriaActiva === 'todos') {
        itemsFiltrados = [];
    } else if (categoriaActiva === 'platos') {
        itemsFiltrados = menuCliente.filter(item => item.categoria === 'platos');
    } else {
        itemsFiltrados = menuCliente.filter(item => item.categoria === categoriaActiva);
    }

    let listaHtml = document.getElementById('lista-menu-html');
    if (listaHtml) {
        if (itemsFiltrados.length > 0 || textoBusqueda !== '') {
            let tituloLabel = textoBusqueda !== '' ? `Resultados para "${textoBusqueda}"` : `Opciones de ${categoriaActiva.toUpperCase()}`;
            listaHtml.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin: 4px 0;">
                    <span style="font-weight: 700; font-size: 14px; color: var(--azul-rapidin);">${tituloLabel}:</span>
                    <button onclick="textoBusqueda=''; categoriaActiva='todos'; let ib=document.getElementById('input-busqueda'); if(ib)ib.value=''; mostrarCliente(1);" style="background: var(--naranja-rapidin); border: none; padding: 4px 10px; border-radius: 10px; font-weight: 700; font-size: 11px; cursor: pointer; color: var(--azul-rapidin);">Volver al Inicio</button>
                </div>
            ` + (itemsFiltrados.length > 0 ? itemsFiltrados.map((item) => {
                let realIdx = menuCliente.findIndex(m => m.id === item.id);
                let stockItem = stockBuffet.find(s => s.nombre === item.nombre);
                let sinStock = stockItem && stockItem.stock <= 0;

                return `
                    <div style="background: #fff; padding: 10px 14px; border-radius: 14px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 5px rgba(0,0,0,0.03); gap: 10px; opacity: ${sinStock ? '0.65' : '1'};">
                        <img src="${item.imagen}" alt="${item.nombre}" style="width: 48px; height: 48px; border-radius: 12px; object-fit: cover;">
                        <div style="flex-grow: 1;">
                            <div style="font-size: 13px; font-weight: 700; color: var(--azul-rapidin);">${item.nombre}</div>
                            <div style="font-size: 11px; color: var(--gris-texto);">$${item.precio.toLocaleString()} ${sinStock ? '• <b style="color:#ef4444;">AGOTADO</b>' : `• Stock: ${stockItem ? stockItem.stock : 0}`}</div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <button onclick="quitarDelCarrito(${realIdx})" style="background: #e5e7eb; border: none; width: 26px; height: 26px; border-radius: 8px; font-weight: bold; cursor: pointer;">-</button>
                            <span style="font-size: 13px; font-weight: 700; min-width: 12px; text-align: center;">${item.qty}</span>
                            ${sinStock ? '' : `<button onclick="agregarAlCarrito(${realIdx})" style="background: var(--naranja-rapidin); border: none; width: 26px; height: 26px; border-radius: 8px; font-weight: bold; cursor: pointer; color: var(--azul-rapidin);">+</button>`}
                        </div>
                    </div>
                `;
            }).join('') : '<p style="text-align:center; color:var(--gris-texto); padding: 20px; font-size:13px;">No se encontraron productos con ese nombre.</p>');
        } else {
            listaHtml.innerHTML = '';
        }
    }

    let contenedorBoton = document.getElementById('contenedor-boton-ver-pedido');
    if (contenedorBoton) {
        if (cantCarrito() > 0) {
            contenedorBoton.innerHTML = `
                <div style="position: absolute; bottom: 70px; left: 16px; right: 16px; z-index: 10;">
                    <div onclick="mostrarCliente(3)" style="background: var(--azul-rapidin); color: #fff; padding: 14px 18px; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; font-weight: 700; font-size: 13px; box-shadow: 0 8px 20px rgba(11,41,57,0.3);">
                        <span>Ver Pedido (${cantCarrito()} ítems)</span>
                        <span>$${totalCarrito().toLocaleString()} ➔</span>
                    </div>
                </div>
            `;
        } else {
            contenedorBoton.innerHTML = '';
        }
    }
}

// Función de navegación con soporte para History API (gestos del celular)
function mostrarCliente(id, registrarHistorial = true) {
    tabClienteActiva = id;

    if (registrarHistorial) {
        history.pushState({ seccion: id }, "", `#seccion-${id}`);
    }

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
        <button class="nav-icon ${id===4?'active':''}" onclick="mostrarCliente(4)">
            <svg viewBox="0 0 24 24"><path d="M13 3C8 3 4 7 4 12H1l4 4 4-4H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>
            Historial
        </button>
        <button class="nav-icon ${id===3?'active':''}" onclick="mostrarCliente(3)">
            <svg viewBox="0 0 24 24"><path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2zm-9-2h10V8H12zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
            Pago
        </button>
    `;

    if(id === 1) {
        let estiloPlatos = categoriaActiva === 'platos' ? 'background: var(--azul-rapidin); color: #fff;' : 'background: #fff; color: var(--azul-rapidin);';
        let estiloPlatosSvg = categoriaActiva === 'platos' ? 'fill: var(--naranja-rapidin);' : 'fill: var(--azul-rapidin);';

        let estiloKiosco = categoriaActiva === 'kiosco' ? 'background: var(--azul-rapidin); color: #fff;' : 'background: #fff; color: var(--azul-rapidin);';
        let estiloKioscoSvg = categoriaActiva === 'kiosco' ? 'fill: var(--naranja-rapidin);' : 'fill: var(--azul-rapidin);';

        let estiloCafeteria = categoriaActiva === 'cafeteria' ? 'background: var(--azul-rapidin); color: #fff;' : 'background: #fff; color: var(--azul-rapidin);';
        let estiloCafeteriaSvg = categoriaActiva === 'cafeteria' ? 'fill: var(--naranja-rapidin);' : 'fill: var(--azul-rapidin);';

        let estiloBebidas = categoriaActiva === 'bebidas' ? 'background: var(--azul-rapidin); color: #fff;' : 'background: #fff; color: var(--azul-rapidin);';
        let estiloBebidasSvg = categoriaActiva === 'bebidas' ? 'fill: var(--naranja-rapidin);' : 'fill: var(--azul-rapidin);';

        container.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 5px;">
                <img src="/icon-192.png" alt="Rapidin Logo" style="height: 34px; width: auto; object-fit: contain;">
                <span style="font-size: 11px; background: #e5e7eb; padding: 4px 10px; border-radius: 20px; font-weight: 600;">UNM Moreno</span>
            </div>

            <div style="margin: 8px 0;">
                <input type="text" id="input-busqueda" placeholder="Buscar plato, bebida, café..." oninput="filtrarBusqueda(this.value)" value="${textoBusqueda}" style="width: 100%; padding: 10px 14px; border-radius: 14px; border: 1px solid #d1d5db; font-size: 13px; outline: none; background: #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.02);">
            </div>

            <div id="contenedor-banner-destacados"></div>

            <div id="contenedor-categorias-html">
                <div style="font-weight: 700; font-size: 14px; color: var(--azul-rapidin); margin-bottom: 8px;">Categorías:</div>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 14px;">
                    <div onclick="filtrarCategoria('platos')" style="${estiloPlatos} padding: 14px; border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.04); transition: 0.2s;">
                        <svg style="width: 26px; height: 26px; ${estiloPlatosSvg}" viewBox="0 0 24 24"><path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/></svg>
                        <span style="font-size: 12px; font-weight: 700;">Platos</span>
                    </div>
                    <div onclick="filtrarCategoria('kiosco')" style="${estiloKiosco} padding: 14px; border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.04); transition: 0.2s;">
                        <svg style="width: 26px; height: 26px; ${estiloKioscoSvg}" viewBox="0 0 24 24"><path d="M20 4H4v2h16V4m1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1m-9 4H6v-4h6v4z"/></svg>
                        <span style="font-size: 12px; font-weight: 700;">Kiosco</span>
                    </div>
                    <div onclick="filtrarCategoria('cafeteria')" style="${estiloCafeteria} padding: 14px; border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.04); transition: 0.2s;">
                        <svg style="width: 26px; height: 26px; ${estiloCafeteriaSvg}" viewBoxq
