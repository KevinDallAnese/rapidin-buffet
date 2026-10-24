const socket = io();

let stockActual = [];
let pedidosActuales = [];
let historialActual = [];
let pestanaAdminActiva = 'pedidos';

socket.on('actualizar-estado', (data) => {
    stockActual = data.stock;
    pedidosActuales = data.pedidos;
    historialActual = data.historial;
    actualizarVistaAdmin();
});

function reproducirSonidoAlerta() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
    } catch (e) {}
}

socket.on('alerta-nueva-orden', (orden) => {
    reproducirSonidoAlerta();
});

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && pedidosActuales.length > 0) {
        e.preventDefault();
        cambiarEstado(0);
    }
});

function cambiarEstado(index) {
    socket.emit('cambiar-estado-orden', index);
}

function modificarStock(index, delta) {
    socket.emit('modificar-stock', { index, delta });
}

function fijarStockDirecto(index, nuevoValor) {
    let valorNumerico = parseInt(nuevoValor);
    if (isNaN(valorNumerico) || valorNumerico < 0) valorNumerico = 0;
    let diferencia = valorNumerico - stockActual[index].stock;
    if (diferencia !== 0) {
        modificarStock(index, diferencia);
    }
}

function guardarCambiosProducto(index) {
    let prod = stockActual[index];
    if (!prod) return;

    let inputNombre = document.getElementById(`nombre-prod-${index}`);
    let inputPrecio = document.getElementById(`precio-prod-${index}`);

    let nuevoNombre = inputNombre ? inputNombre.value.trim() : prod.nombre;
    let nuevoPrecio = inputPrecio ? parseFloat(inputPrecio.value) : prod.precio;

    if (nuevoNombre && nuevoNombre !== prod.nombre) {
        socket.emit('modificar-nombre-producto', { id: prod.id, nombre: nuevoNombre });
    }

    if (!isNaN(nuevoPrecio) && nuevoPrecio !== prod.precio) {
        socket.emit('modificar-precio-producto', { id: prod.id, precio: nuevoPrecio });
    }
}

function agregarNuevoProductoDesdeAdmin(event) {
    event.preventDefault();
    let nombreInput = document.getElementById('nuevo-prod-nombre').value.trim();
    let precioInput = parseFloat(document.getElementById('nuevo-prod-precio').value);
    let stockInput = parseInt(document.getElementById('nuevo-prod-stock').value);
    let categoriaInput = document.getElementById('nuevo-prod-categoria').value;
    let imagenInput = document.getElementById('nuevo-prod-imagen').value.trim();

    if (!nombreInput || isNaN(precioInput) || isNaN(stockInput) || !categoriaInput) {
        alert("Por favor, completa todos los campos correctamente.");
        return;
    }

    socket.emit('agregar-producto', {
        nombre: nombreInput,
        precio: precioInput,
        stock: stockInput,
        categoria: categoriaInput,
        imagen: imagenInput
    });

    document.getElementById('nuevo-prod-nombre').value = '';
    document.getElementById('nuevo-prod-precio').value = '';
    document.getElementById('nuevo-prod-stock').value = '';
    document.getElementById('nuevo-prod-categoria').value = 'platos';
    document.getElementById('nuevo-prod-imagen').value = '';
}

function mostrarBuffet(pestana) {
    pestanaAdminActiva = pestana;
    
    document.querySelectorAll('#admin-nav .nav-icon').forEach(btn => btn.classList.remove('active'));
    if (pestana === 'pedidos') {
        let btn = document.getElementById('nav-pedidos-btn');
        if(btn) btn.classList.add('active');
    }
    if (pestana === 'historial') {
        let btn = document.getElementById('nav-historial-btn');
        if(btn) btn.classList.add('active');
    }
    if (pestana === 'stock') {
        let btn = document.getElementById('nav-stock-btn');
        if(btn) btn.classList.add('active');
    }

    actualizarVistaAdmin();
}

function actualizarVistaAdmin() {
    let contenedor = document.getElementById('admin-contenido');
    let badgeNotif = document.getElementById('notif-badge-admin');
    let navStockBtn = document.getElementById('nav-stock-btn');

    let productosAgotados = stockActual.filter(item => item.stock <= 0).length;

    if (navStockBtn) {
        let badgeStockNav = document.getElementById('badge-stock-alerta');
        if (productosAgotados > 0) {
            if (!badgeStockNav) {
                badgeStockNav = document.createElement('span');
                badgeStockNav.id = 'badge-stock-alerta';
                badgeStockNav.style.cssText = 'position: absolute; top: 4px; right: 24px; background: #ef4444; color: #fff; font-size: 9px; padding: 2px 5px; border-radius: 10px; font-weight: bold;';
                navStockBtn.style.position = 'relative';
                navStockBtn.appendChild(badgeStockNav);
            }
            badgeStockNav.innerText = productosAgotados;
            badgeStockNav.style.display = 'block';
        } else if (badgeStockNav) {
            badgeStockNav.style.display = 'none';
        }
    }

    if (badgeNotif) {
        if (pedidosActuales.length > 0) {
            badgeNotif.style.display = 'block';
            badgeNotif.innerText = pedidosActuales.length;
        } else {
            badgeNotif.style.display = 'none';
        }
    }

    if (!contenedor) return;

    if (pestanaAdminActiva === 'pedidos') {
        contenedor.innerHTML = `
            <div style="font-weight: 700; color: var(--azul-rapidin); font-size: 14px; margin-bottom: 2px;">Órdenes Activas en Cocina:</div>
            <div style="display: flex; flex-direction: column; gap: 12px; max-height: 520px; overflow-y: auto;">
                ${pedidosActuales.length > 0 ? pedidosActuales.map((p, idx) => {
                    let esPreparacion = p.estado === "En preparación";
                    let btnTexto = esPreparacion ? "Marcar Listo para Retirar" : "Marcar Entregado";
                    let estiloEstado = esPreparacion ? "background: #fef3c7; color: #b45309;" : "background: #d1fae5; color: #065f46;";
                    let notaHtml = p.nota ? `<div style="font-size: 11px; color: #d97706; margin-top: 4px; font-weight: 600; word-break: break-word;">Nota: ${p.nota}</div>` : '';

                    return `
                        <div class="app-card" style="display: flex; justify-content: space-between; align-items: center; border-left: 6px solid var(--naranja-rapidin); gap: 12px;">
                            <div style="flex: 1; min-width: 0;">
                                <div style="font-weight: 800; font-size: 14px; color: var(--azul-rapidin);">Orden #${p.codigoTicket}</div>
                                <div style="font-size: 12px; color: #4b5563; margin: 4px 0; word-break: break-word;">${p.detalle}</div>${notaHtml}
                                <div style="display: inline-block; padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 700; ${estiloEstado}; margin-top: 6px;">${p.estado}</div>
                            </div>
                            <button onclick="cambiarEstado(${idx})" style="background: var(--azul-rapidin); color: #fff; border: none; padding: 10px 12px; border-radius: 12px; font-weight: 700; font-size: 11px; cursor: pointer; white-space: nowrap; flex-shrink: 0; text-align: center; line-height: 1.3;">
                                ${btnTexto} ➔
                            </button>
                        </div>
                    `;
                }).join('') : '<p style="color:var(--gris-texto); font-size:13px; text-align:center; padding: 40px 0;">No hay pedidos activos en este momento.</p>'}
            </div>
        `;
    } else if (pestanaAdminActiva === 'historial') {
        contenedor.innerHTML = `
            <div style="font-weight: 700; color: var(--azul-rapidin); font-size: 14px; margin-bottom: 2px;">Historial de Órdenes Entregadas:</div>
            <div style="display: flex; flex-direction: column; gap: 12px; max-height: 520px; overflow-y: auto;">
                ${historialActual.length > 0 ? historialActual.map(h => `
                    <div class="app-card" style="border-left: 6px solid #27ae60;">
                        <div style="display:flex; justify-content:space-between; font-weight:700; font-size:13px;">
                            <span style="color:var(--azul-rapidin);">Orden #${h.codigoTicket}</span>
                            <span style="color:#27ae60;">Entregado</span>
                        </div>
                        <div style="font-size: 12px; color: #4b5563; margin-top: 4px; word-break: break-word;">${h.detalle}</div>${h.nota ? `<div style="font-size: 11px; color: #d97706; margin-top: 2px; word-break: break-word;">Nota: ${h.nota}</div>` : ''}
                        <div style="font-size: 11px; color: var(--gris-texto); margin-top: 6px;">Total abonado: <b>$${h.total.toLocaleString()}</b></div>
                    </div>
                `).join('') : '<p style="color:var(--gris-texto); font-size:13px; text-align:center; padding: 40px 0;">Aún no hay registros en el historial.</p>'}
            </div>
        `;
    } else if (pestanaAdminActiva === 'stock') {
        contenedor.innerHTML = `
            <div style="font-weight: 700; color: var(--azul-rapidin); font-size: 14px; margin-bottom: 2px; display: flex; justify-content: space-between; align-items: center;">
                <span>Control y Gestión de Stock:</span>
                ${productosAgotados > 0 ? `<span style="font-size: 11px; background: #fee2e2; color: #dc2626; padding: 2px 8px; border-radius: 6px; font-weight: 700;">¡Hay ${productosAgotados} sin stock!</span>` : ''}
            </div>

            <form onsubmit="agregarNuevoProductoDesdeAdmin(event)" class="app-card" style="background: rgba(255,255,255,0.7); border: 1.5px dashed rgba(10,37,51,0.2); display: flex; flex-direction: column; gap: 8px; margin-bottom: 4px;">
                <span style="font-size: 11px; font-weight: 700; color: var(--azul-rapidin);">➕ Agregar Nuevo Producto:</span>
                <input type="text" id="nuevo-prod-nombre" class="app-input" placeholder="Nombre del producto" required>
                <div style="display: flex; gap: 8px;">
                    <input type="number" id="nuevo-prod-precio" class="app-input" placeholder="Precio ($)" required>
                    <input type="number" id="nuevo-prod-stock" class="app-input" placeholder="Stock inicial" required>
                </div>
                <select id="nuevo-prod-categoria" class="app-input" required>
                    <option value="platos" selected>Platos</option>
                    <option value="kiosco">Kiosco</option>
                    <option value="cafeteria">Cafetería</option>
                    <option value="bebidas">Bebidas</option>
                </select>
                <input type="text" id="nuevo-prod-imagen" class="app-input" placeholder="Link de Google Drive de la imagen (opcional)">
                <button type="submit" style="background: var(--naranja-rapidin); color: var(--azul-rapidin); border: none; padding: 10px; border-radius: 12px; font-weight: 800; font-size: 12px; cursor: pointer; box-shadow: 0 4px 12px rgba(230,126,34,0.2);">Guardar Producto</button>
            </form>

            <div style="display: flex; flex-direction: column; gap: 10px; max-height: 320px; overflow-y: auto;">
                ${stockActual.map((item, idx) => {
                    let sinStock = item.stock <= 0;
                    return `
                        <div class="app-card" style="display: flex; flex-direction: column; gap: 8px; border-left: 5px solid ${sinStock ? '#e74c3c' : '#27ae60'};">
                            <div style="display: flex; justify-content: space-between; gap: 8px;">
                                <input type="text" id="nombre-prod-${idx}" class="app-input" value="${item.nombre}" style="font-weight: 700; color: var(--azul-rapidin); padding: 8px 12px; flex-grow: 1; min-width: 0;">
                                <input type="number" id="precio-prod-${idx}" class="app-input" value="${item.precio || 0}" style="font-weight: 600; color: var(--naranja-hover); width: 85px; padding: 8px; text-align: center; flex-shrink: 0;">
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <button onclick="guardarCambiosProducto(${idx})" style="background: var(--azul-rapidin); color: #fff; border: none; padding: 6px 12px; border-radius: 10px; font-weight: 600; font-size: 11px; cursor: pointer;">Guardar</button>
                                <div style="display: flex; align-items: center; gap: 6px;">
                                    <button onclick="modificarStock(${idx}, -1)" style="background: #e5e7eb; border: none; width: 28px; height: 28px; border-radius: 8px; font-weight: bold; cursor: pointer;">-</button>
                                    <input type="number" min="0" value="${item.stock}" onchange="fijarStockDirecto(${idx}, this.value)" class="app-input" style="width: 44px; text-align: center; font-weight: 700; padding: 4px; color: ${sinStock ? '#e74c3c' : '#374151'};">
                                    <button onclick="modificarStock(${idx}, 1)" style="background: var(--naranja-rapidin); border: none; width: 28px; height: 28px; border-radius: 8px; font-weight: bold; color: var(--azul-rapidin); cursor: pointer;">+</button>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
}
