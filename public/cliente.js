const socket = io();

let tabClienteActiva = 1;
let categoriaActiva = 'todos';
let textoBusqueda = '';
let tiempoEsperaServidor = 5;

let misTicketsActivos = [];
let misPedidosHistorial = [];
let stockBuffet = [];
let pedidosBuffetServidor = [];

socket.on('actualizar-estado', (data) => {
    let carritoGuardado = JSON.parse(localStorage.getItem('rapidin_carrito')) || {};

    if (data && Array.isArray(data.stock)) {
        stockBuffet = data.stock.map(item => {
            let qtyGuardada = carritoGuardado[item.id] || 0;
            return {
                id: item.id,
                nombre: item.nombre || 'Producto sin nombre',
                descripcion: item.descripcion || '',
                precio: Number(item.precio) || 0,
                stock: Number(item.stock) || 0,
                categoria: (item.categoria || 'platos').toLowerCase(),
                imagen: item.imagen || "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=150&auto=format&fit=crop&q=80",
                qty: Math.min(qtyGuardada, item.stock)
            };
        });
    }

    pedidosBuffetServidor = data.pedidos || [];
    tiempoEsperaServidor = data.tiempoEspera || 5;

    misTicketsActivos.forEach(ticket => {
        let ordenEncontrada = pedidosBuffetServidor.find(o => o.id === ticket.dbId || o.codigoTicket === ticket.idNro);
        if (ordenEncontrada) {
            ticket.idNro = ordenEncontrada.codigoTicket;
            ticket.dbId = ordenEncontrada.id;
            
            if (ordenEncontrada.estado === "Listo para retirar" && ticket.estado !== "Listo para retirar") {
                mostrarToast(`¡Tu orden #${ticket.idNro} está lista para retirar!`, "success");
            }
            ticket.estado = ordenEncontrada.estado;
        } else {
            let enHistorial = (data.historial || []).find(o => o.codigoTicket === ticket.idNro || o.id === ticket.dbId);
            if (enHistorial && ticket.estado !== "Entregado") {
                ticket.estado = "Entregado";
                misPedidosHistorial.unshift({ ...ticket });
            }
        }
    });

    misTicketsActivos = misTicketsActivos.filter(t => t.estado !== "Entregado");
    actualizarVistaActual();
});

function guardarCarritoStorage() {
    let carritoObj = {};
    stockBuffet.forEach(item => {
        if (item.qty > 0) {
            carritoObj[item.id] = item.qty;
        }
    });
    localStorage.setItem('rapidin_carrito', JSON.stringify(carritoObj));
}

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
    textoBusqueda = (input || '').toLowerCase().trim();
    renderizarMenuPrincipal();
}

function agregarAlCarrito(idProducto) {
    let itemStock = stockBuffet.find(s => s.id === idProducto);
    if (!itemStock) return;

    if (itemStock.qty >= itemStock.stock) {
        mostrarToast(`No hay más stock disponible de ${itemStock.nombre}.`, "error");
        return;
    }

    itemStock.qty++;
    guardarCarritoStorage();
    actualizarVistaActual();
}

function quitarDelCarrito(idProducto) {
    let itemStock = stockBuffet.find(s => s.id === idProducto);
    if (itemStock && itemStock.qty > 0) {
        itemStock.qty--;
        guardarCarritoStorage();
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
    return stockBuffet.reduce((acc, item) => acc + (item.precio * item.qty), 0);
}

function cantCarrito() {
    return stockBuffet.reduce((acc, item) => acc + item.qty, 0);
}

function renderizarMenuPrincipal() {
    let contenedorBannerDestacados = document.getElementById('contenedor-banner-destacados');
    if (contenedorBannerDestacados) {
        if (categoriaActiva === 'todos' && textoBusqueda === '') {
            contenedorBannerDestacados.style.display = 'block';
            let destacadosFiltrados = stockBuffet.slice(0, 2);

            let destacadosHtml = destacadosFiltrados.map(item => {
                let sinStock = item.stock <= 0;

                return `
                    <div class="app-card" style="background: linear-gradient(135deg, var(--azul-rapidin) 0%, var(--azul-claro) 100%); color: var(--blanco); margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; gap: 12px; opacity: ${sinStock ? '0.6' : '1'};">
                        <img src="${item.imagen}" alt="${item.nombre}" referrerpolicy="no-referrer" onclick="abrirModalProducto(${item.id})" style="width: 55px; height: 55px; border-radius: 14px; object-fit: cover; border: 2px solid rgba(255,255,255,0.2); flex-shrink: 0; cursor: pointer;">
                        <div style="flex-grow: 1; min-width: 0; cursor: pointer;" onclick="abrirModalProducto(${item.id})">
                            <span style="font-size: 8px; text-transform: uppercase; color: var(--naranja-rapidin); font-weight:800; letter-spacing: 1px;">Destacado del día</span>
                            <h3 style="font-size: 14px; font-weight: 700; color: var(--naranja-rapidin); line-height: 1.1; margin-top: 2px; word-break: break-word;">${item.nombre}</h3>
                            <p style="font-size: 11px; opacity: 0.85; margin-top: 2px;">$${item.precio.toLocaleString()} ${sinStock ? '• <b style="color:#ef4444;">AGOTADO</b>' : ''}</p>
                        </div>
                        <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
                            <button onclick="quitarDelCarrito(${item.id})" style="background: rgba(0,0,0,0.3); border: none; width: 26px; height: 26px; border-radius: 8px; font-weight: bold; color: #fff; cursor: pointer;">-</button>
                            <span style="color: #fff; font-weight: bold; font-size: 13px; min-width: 12px; text-align: center;">${item.qty}</span>
                            ${sinStock ? '' : `<button onclick="agregarAlCarrito(${item.id})" style="background: var(--naranja-rapidin); border: none; width: 26px; height: 26px; border-radius: 8px; font-weight: bold; color: var(--azul-rapidin); cursor: pointer;">+</button>`}
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
        itemsFiltrados = stockBuffet.filter(item => item.nombre.toLowerCase().includes(textoBusqueda));
    } else if (categoriaActiva === 'todos') {
        itemsFiltrados = stockBuffet;
    } else {
        itemsFiltrados = stockBuffet.filter(item => item.categoria === categoriaActiva);
    }

    let listaHtml = document.getElementById('lista-menu-html');
    if (listaHtml) {
        if (itemsFiltrados.length > 0) {
            let tituloLabel = textoBusqueda !== '' ? `Resultados para "${textoBusqueda}"` : (categoriaActiva === 'todos' ? 'Menú Completo' : `Opciones de ${categoriaActiva.toUpperCase()}`);
            listaHtml.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin: 4px 0;">
                    <span style="font-weight: 700; font-size: 14px; color: var(--azul-rapidin);">${tituloLabel}:</span>
                    ${textoBusqueda !== '' || categoriaActiva !== 'todos' ? `<button onclick="textoBusqueda=''; categoriaActiva='todos'; let ib=document.getElementById('input-busqueda'); if(ib)ib.value=''; mostrarCliente(1);" style="background: var(--naranja-rapidin); border: none; padding: 4px 10px; border-radius: 10px; font-weight: 700; font-size: 11px; cursor: pointer; color: var(--azul-rapidin);">Ver Todo</button>` : ''}
                </div>
            ` + itemsFiltrados.map((item) => {
                let sinStock = item.stock <= 0;

                return `
                    <div class="app-card" style="display: flex; justify-content: space-between; align-items: center; gap: 12px; opacity: ${sinStock ? '0.65' : '1'};">
                        <img src="${item.imagen}" alt="${item.nombre}" referrerpolicy="no-referrer" onclick="abrirModalProducto(${item.id})" style="width: 48px; height: 48px; border-radius: 12px; object-fit: cover; flex-shrink: 0; cursor: pointer;">
                        <div style="flex-grow: 1; min-width: 0; cursor: pointer;" onclick="abrirModalProducto(${item.id})">
                            <div style="font-size: 13px; font-weight: 700; color: var(--azul-rapidin); word-break: break-word;">${item.nombre}</div>
                            <div style="font-size: 11px; color: var(--gris-texto);">$${item.precio.toLocaleString()} ${sinStock ? '• <b style="color:#ef4444;">AGOTADO</b>' : `• Stock: ${item.stock}`}</div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
                            <button onclick="quitarDelCarrito(${item.id})" style="background: #e5e7eb; border: none; width: 26px; height: 26px; border-radius: 8px; font-weight: bold; cursor: pointer;">-</button>
                            <span style="font-size: 13px; font-weight: 700; min-width: 12px; text-align: center;">${item.qty}</span>
                            ${sinStock ? '' : `<button onclick="agregarAlCarrito(${item.id})" style="background: var(--naranja-rapidin); border: none; width: 26px; height: 26px; border-radius: 8px; font-weight: bold; cursor: pointer; color: var(--azul-rapidin);">+</button>`}
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            listaHtml.innerHTML = '<p style="text-align:center; color:var(--gris-texto); padding: 20px; font-size:13px;">No hay productos disponibles en esta categoría.</p>';
        }
    }

    let contenedorBoton = document.getElementById('contenedor-boton-ver-pedido');
    if (contenedorBoton) {
        if (cantCarrito() > 0) {
            contenedorBoton.innerHTML = `
                <div style="position: absolute; bottom: 82px; left: 16px; right: 16px; z-index: 10;">
                    <div onclick="mostrarCliente(3)" style="background: var(--azul-rapidin); color: #fff; padding: 14px 18px; border-radius: 20px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; font-weight: 700; font-size: 13px; box-shadow: 0 10px 25px rgba(10,37,51,0.25);">
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

function mostrarCliente(id, registrarHistorial = true) {
    tabClienteActiva = id;

    if (registrarHistorial) {
        try {
            history.pushState({ seccion: id }, "", `#seccion-${id}`);
        } catch (e) {
            console.error(e);
        }
    }

    const container = document.getElementById('app-screen');
    const nav = document.getElementById('nav-bar');
    
    if (!container || !nav) return;

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
        let activoPlatos = categoriaActiva === 'platos' ? 'active' : '';
        let activoKiosco = categoriaActiva === 'kiosco' ? 'active' : '';
        let activoCafeteria = categoriaActiva === 'cafeteria' ? 'active' : '';
        let activoBebidas = categoriaActiva === 'bebidas' ? 'active' : '';

        container.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 5px;">
                <img src="/rapidin.png" alt="Rapidin Logo" style="height: 34px; width: auto; object-fit: contain;">
                <img src="/unm.png" alt="Logo UNM" style="height: 34px; width: auto; object-fit: contain;">
            </div>

            <div style="margin: 4px 0;">
                <input type="text" id="input-busqueda" class="app-input" placeholder="Buscar plato, bebida, café..." oninput="filtrarBusqueda(this.value)" value="${textoBusqueda}">
            </div>

            <div id="contenedor-banner-destacados"></div>

            <div id="contenedor-categorias-html">
                <div style="font-weight: 700; font-size: 14px; color: var(--azul-rapidin); margin-bottom: 8px;">Categorías:</div>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 14px;">
                    <div onclick="filtrarCategoria('platos')" class="categoria-card ${activoPlatos}">
                        <svg viewBox="0 0 24 24"><path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/></svg>
                        <span style="font-size: 12px; font-weight: 700;">Platos</span>
                    </div>
                    <div onclick="filtrarCategoria('kiosco')" class="categoria-card ${activoKiosco}">
                        <svg viewBox="0 0 24 24"><path d="M20 4H4v2h16V4m1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1m-9 4H6v-4h6v4z"/></svg>
                        <span style="font-size: 12px; font-weight: 700;">Kiosco</span>
                    </div>
                    <div onclick="filtrarCategoria('cafeteria')" class="categoria-card ${activoCafeteria}">
                        <svg viewBox="0 0 24 24"><path d="M2 21h18v-2H2M20 8h-2V5h2m0-2H4v10a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4v-3h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"/></svg>
                        <span style="font-size: 12px; font-weight: 700;">Cafetería</span>
                    </div>
                    <div onclick="filtrarCategoria('bebidas')" class="categoria-card ${activoBebidas}">
                        <svg viewBox="0 0 24 24"><path d="M3 2l2.01 18.23C5.13 21.23 5.97 22 7 22h10c1.03 0 1.87-.77 1.99-1.77L21 2H3zm9 17c-1.66 0-3-1.34-3-3 0-2 3-5.4 3-5.4s3 3.4 3 5.4c0 1.66-1.34 3-3 3zm6.33-13H5.67l-.44-4h13.54l-.44 4z"/></svg>
                        <span style="font-size: 12px; font-weight: 700;">Bebidas</span>
                    </div>
                </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 10px;" id="lista-menu-html"></div>
            <div id="contenedor-boton-ver-pedido"></div>
        `;
        renderizarMenuPrincipal();
    } else if(id === 2) {
        if(misTicketsActivos.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; margin-top: 100px; color: var(--azul-rapidin);">
                    <svg style="width:48px; height:48px; fill:var(--naranja-rapidin); margin-bottom:15px;" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8zm2 16H8v-2h8zm0-4H8v-2h8zm-3-5V3.5L18.5 9z"/></svg>
                    <h3 class="app-title" style="font-size: 18px; text-align: center; margin-top: 15px;">No tenés ningún ticket activo</h3>
                    <p style="font-size: 13px; color: var(--gris-texto); margin: 10px 0 20px 0;">Armá tu pedido en el menú y abonalo para generar tu código QR de retiro.</p>
                    <button onclick="mostrarCliente(1)" style="background: var(--naranja-rapidin); border: none; padding: 12px 24px; border-radius: 16px; font-weight: 700; cursor: pointer; color: var(--azul-rapidin);">Ir al Menú</button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="app-title">Tus Tickets Activos (${misTicketsActivos.length})</div>
            <div style="display: flex; flex-direction: column; gap: 12px; max-height: 520px; overflow-y: auto;">
                ${misTicketsActivos.map(ticket => {
                    let esListo = ticket.estado === "Listo para retirar";
                    let colorEstadoBg = esListo ? "#d1fae5" : "#fef3c7";
                    let colorEstadoTxt = esListo ? "#065f46" : "#b45309";
                    let mostrarEspera = ticket.estado === "En preparación";
                    let notaHtml = ticket.nota ? `<div style="font-size: 11px; color: #d97706; margin-top: 2px; word-break: break-word;">Nota: ${ticket.nota}</div>` : '';

                    return `
                        <div class="app-card" style="border-left: 6px solid var(--naranja-rapidin);">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <span style="font-weight: 800; font-size: 13px; color: var(--azul-rapidin);">Orden #${ticket.idNro}</span> <span style="font-size: 11px; font-weight: bold; color: var(--naranja-rapidin);">$${ticket.total.toLocaleString()}</span>
                            </div>
                            <p style="font-size: 12px; color: #4b5563; margin: 6px 0; word-break: break-word;">${ticket.detalleText}</p>${notaHtml}
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                                <div style="background: ${colorEstadoBg}; color:${colorEstadoTxt}; padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 700;">${ticket.estado}</div>${mostrarEspera ? `<div style="font-size: 11px; color: var(--gris-texto);">Espera aprox: <b>${tiempoEsperaServidor} min</b></div>` : ''}
                            </div>
                            
                            <div style="display: flex; gap: 8px; margin-top: 12px;">
                                <div style="flex-grow: 1; background: var(--azul-rapidin); color: #fff; text-align: center; padding: 10px; border-radius: 14px; font-weight: 800; font-size: 16px; letter-spacing: 2px;">
                                    ${ticket.idNro}
                                </div>
                                <button onclick="abrirModalComprobante(${ticket.idNro}, '${ticket.detalleText.replace(/'/g, "")}')" style="background: var(--naranja-rapidin); border: none; padding: 0 16px; border-radius: 14px; font-weight: 700; color: var(--azul-rapidin); cursor: pointer; font-size: 12px;">
                                    Ver QR
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    } else if(id === 4) {
        container.innerHTML = `
            <div class="app-title">Tus Pedidos Realizados</div>
            <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 4px;">
                ${misPedidosHistorial.length > 0 ? misPedidosHistorial.map(ord => `
                    <div class="app-card" style="border-left: 6px solid #27ae60;">
                        <div style="display:flex; justify-content:space-between; font-weight:700; font-size:13px;">
                            <span style="color:var(--azul-rapidin);">Orden #${ord.idNro}</span>
                            <span style="color:#27ae60;">${ord.estado}</span>
                        </div>
                        <p style="font-size:12px; color:#4b5563; margin-top:4px; word-break: break-word;">${ord.detalleText}</p>${ord.nota ? `<div style="font-size: 11px; color: #d97706; margin-top: 2px; word-break: break-word;">Nota: ${ord.nota}</div>` : ''}
                        <div style="font-size:11px; color:var(--gris-texto); margin-top:6px;">Total abonado: <b>$${ord.total.toLocaleString()}</b></div>
                    </div>
                `).join('') : '<p style="text-align:center; color:var(--gris-texto); margin-top:60px; font-size:13px;">Aún no registra historial de pedidos finalizados.</p>'}
            </div>
        `;
    } else if(id === 3) {
        let itemsEnCarrito = stockBuffet.filter(i => i.qty > 0);
        
        container.innerHTML = `
            <div class="app-title">Revisá y modificá tu pedido:</div>
            
            <div class="app-card" style="max-height: 160px; overflow-y: auto;">
                ${itemsEnCarrito.length > 0 ? itemsEnCarrito.map(i => {
                    return `
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px solid rgba(10,37,51,0.05); padding-bottom: 6px; gap: 8px;">
                            <div style="flex-grow: 1; min-width: 0;">
                                <div style="font-weight: 700; font-size: 12px; color: var(--azul-rapidin); word-break: break-word;">${i.nombre}</div>
                                <div style="font-size: 11px; color: var(--gris-texto);">$${(i.precio * i.qty).toLocaleString()}</div>
                            </div>
                            <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
                                <button onclick="quitarDelCarrito(${i.id})" style="background: #e5e7eb; border: none; width: 24px; height: 24px; border-radius: 8px; font-weight: bold; cursor: pointer;">-</button>
                                <span style="font-size: 12px; font-weight: bold; min-width: 12px; text-align: center;">${i.qty}</span>
                                <button onclick="agregarAlCarrito(${i.id})" style="background: var(--naranja-rapidin); border: none; width: 24px; height: 24px; border-radius: 8px; font-weight: bold; color: var(--azul-rapidin); cursor: pointer;">+</button>
                            </div>
                        </div>
                    `;
                }).join('') : '<p style="font-size:12px; color:#666; text-align:center; padding: 15px;">El carrito está vacío. <a href="#" onclick="mostrarCliente(1)" style="color:var(--naranja-rapidin); font-weight:bold;">Volver al menú</a></p>'}
                
                ${itemsEnCarrito.length > 0 ? `
                    <div style="font-weight: 700; margin-top: 10px; font-size: 13.5px; display: flex; justify-content: space-between; border-top: 2px solid rgba(10,37,51,0.08); padding-top: 8px;">
                        <span>Total a Pagar:</span>
                        <span style="color: var(--naranja-hover);">$${totalCarrito().toLocaleString()}</span>
                    </div>
                ` : ''}
            </div>

            ${itemsEnCarrito.length > 0 ? `
                <div style="margin-top: 2px;">
                    <label style="font-size: 11px; font-weight: 700; color: var(--azul-rapidin); display: block; margin-bottom: 4px;">Aclaraciones o notas (opcional):</label>
                    <input type="text" id="input-nota-pedido" class="app-input" placeholder="Ej: Sin cebolla, pan tostado...">
                </div>

                <div style="font-weight: 700; color: var(--azul-rapidin); font-size: 13px; margin-top: 2px;">Seleccioná medio de pago:</div>
                
                <div class="app-card" style="background: #fdfbf7; border: 1.5px solid rgba(230,126,34,0.3); padding: 12px;">
                    <div style="font-weight: 800; font-size: 12px; color: var(--azul-rapidin); margin-bottom: 4px;">Datos para Transferencia / MP:</div>
                    <div style="font-size: 11.5px; color: #334155; line-height: 1.4;">
                        Alias: <b style="color: var(--naranja-hover); user-select: all;">buffet.unm.oficial</b><br>
                        Titular: Buffet UNM Moreno<br>
                        <span style="font-size: 10.5px; opacity: 0.8;">(Transferí el monto exacto y presiona confirmar)</span>
                    </div>
                </div>

                <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 4px;">
                    <button onclick="procesarPagoYGenerarCodigo('Transferencia / Mercado Pago')" style="background: var(--naranja-rapidin); color: var(--azul-rapidin); border: none; padding: 12px; border-radius: 14px; font-weight: 800; font-size: 13px; cursor: pointer; box-shadow: 0 4px 12px rgba(230,126,34,0.2);">
                        Ya transferí / Pagar con Alias
                    </button>
                    <button onclick="procesarPagoYGenerarCodigo('Efectivo en Ventanilla')" style="background: var(--azul-rapidin); color: #fff; border: none; padding: 12px; border-radius: 14px; font-weight: 700; font-size: 13px; cursor: pointer;">
                        Pagar en Efectivo en Ventanilla
                    </button>
                </div>
            ` : ''}
        `;
    }
}

window.addEventListener('popstate', (event) => {
    if (event.state && event.state.seccion) {
        mostrarCliente(event.state.seccion, false);
    } else {
        mostrarCliente(1, false);
    }
});

function procesarPagoYGenerarCodigo(metodoPago) {
    if(cantCarrito() === 0) {
        mostrarToast("Por favor, seleccione al menos un producto.", "error");
        return;
    }

    let inputNota = document.getElementById('input-nota-pedido');
    let notaTexto = inputNota ? inputNota.value.trim() : "";

    let codigoAleatorio = Math.floor(1000 + Math.random() * 9000);
    let itemsSeleccionados = stockBuffet.filter(i => i.qty > 0);
    let detalleStr = itemsSeleccionados.map(i => `${i.qty}x ${i.nombre}`).join(', ');

    let nuevoTicket = {
        idNro: codigoAleatorio,
        estado: "En preparación",
        detalleText: detalleStr,
        nota: `${notaTexto} [Pago: ${metodoPago}]`,
        total: totalCarrito()
    };

    misTicketsActivos.push(nuevoTicket);

    socket.emit('nuevo-pedido', {
        items: itemsSeleccionados,
        orden: {
            codigoTicket: codigoAleatorio,
            detalle: detalleStr,
            nota: `${notaTexto} [Pago: ${metodoPago}]`,
            total: totalCarrito(),
            estado: "En preparación"
        }
    });

    mostrarToast(`Pedido #${codigoAleatorio} generado con éxito.`, "success");

    stockBuffet.forEach(i => i.qty = 0);
    localStorage.removeItem('rapidin_carrito');
    mostrarCliente(2);
}

function abrirModalComprobante(nroOrden, detalle) {
    let spanNro = document.getElementById('modal-nro-orden');
    if (spanNro) {
        spanNro.innerText = `#${nroOrden}`;
    }
    let modal = document.getElementById('modal-comprobante');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function cerrarModal() {
    let modal = document.getElementById('modal-comprobante');
    if (modal) {
        modal.style.display = 'none';
    }
}

function reiniciarPedido() {
    mostrarCliente(1);
}

// FUNCIONES PARA EL POPUP / MODAL DE PRODUCTOS
function abrirModalProducto(idProducto) {
    let producto = stockBuffet.find(s => s.id === idProducto);
    if (!producto) return;

    let modalImg = document.getElementById('modal-prod-imagen');
    let modalCat = document.getElementById('modal-prod-categoria');
    let modalNom = document.getElementById('modal-prod-nombre');
    let modalDesc = document.getElementById('modal-prod-descripcion');
    let modalPrecio = document.getElementById('modal-prod-precio');
    let modalBtn = document.getElementById('modal-btn-agregar');
    let modalOverlay = document.getElementById('modal-producto');

    if (modalImg) modalImg.src = producto.imagen;
    if (modalCat) modalCat.innerText = producto.categoria;
    if (modalNom) modalNom.innerText = producto.nombre;
    if (modalDesc) modalDesc.innerText = producto.descripcion || "Producto fresco preparado en el día para la comunidad de la UNM.";
    if (modalPrecio) modalPrecio.innerText = `$${producto.precio.toLocaleString()}`;
    
    if (modalBtn) {
        if (producto.stock <= 0) {
            modalBtn.innerText = "Agotado Temporalmente";
            modalBtn.style.background = "#e5e7eb";
            modalBtn.style.color = "#9ca3af";
            modalBtn.onclick = null;
        } else {
            modalBtn.innerText = "Agregar al Pedido ➔";
            modalBtn.style.background = "var(--naranja-rapidin)";
            modalBtn.style.color = "var(--azul-rapidin)";
            modalBtn.onclick = function() {
                agregarAlCarrito(producto.id);
                cerrarModalProducto();
            };
        }
    }

    if (modalOverlay) {
        modalOverlay.style.display = 'flex';
    }
}

function cerrarModalProducto() {
    let modalOverlay = document.getElementById('modal-producto');
    if (modalOverlay) {
        modalOverlay.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    let modalProducto = document.getElementById('modal-producto');
    if (modalProducto) {
        modalProducto.addEventListener('click', (e) => {
            if (e.target === modalProducto) {
                cerrarModalProducto();
            }
        });
    }

    let modalComprobante = document.getElementById('modal-comprobante');
    if (modalComprobante) {
        modalComprobante.addEventListener('click', (e) => {
            if (e.target === modalComprobante) {
                cerrarModal();
            }
        });
    }
});
