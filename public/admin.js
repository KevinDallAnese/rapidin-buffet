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

function mostrarBuffet(pestana) {
    pestanaAdminActiva = pestana;
    document.querySelectorAll('#admin-nav .nav-icon').forEach(btn => btn.classList.remove('active'));
    if (pestana === 'pedidos') document.getElementById('nav-pedidos-btn').classList.add('active');
    if (pestana === 'historial') document.getElementById('nav-historial-btn').classList.add('active');
    if (pestana === 'stock') document.getElementById('nav-stock-btn').classList.add('active');

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
            <div style="display: flex; flex-direction: column; gap: 10px; max-height: 520px; overflow-y: auto;">
                ${pedidosActuales.length > 0 ? pedidosActuales.map((p, idx) => {
                    let esPreparacion = p.estado === "En preparación";
                    let btnTexto = esPreparacion ? "Marcar Listo para Retirar" : "Marcar Entregado";
                    let estiloEstado = esPreparacion ? "background: #fef3c7; color: #b45309;" : "background: #d1fae5; color: #065f46;";
                    let notaHtml = p.nota ? `<div style="font-size: 11px; color: #d97706; margin-top: 3px; font-weight: 600;">Nota: ${p.nota}</div>` : '';

                    return `
                        <div style="background: #fff; padding: 14px; border-radius: 14px; box-shadow: 0 2px 6px rgba(0,0,0,0.04); display: flex; justify-content: space-between; align-items: center; border-left: 5px solid var(--naranja-rapidin);">
                            <div>
                                <div style="font-weight: 800; font-size: 14px; color: var(--azul-rapidin);">Orden #${p.id}</div>
                                <div style="font-size: 12px; color: #4b5563; margin: 4px 0;">${p.detalle}</div>${notaHtml}
                                <div style="display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; ${estiloEstado}; margin-top: 4px;">${p.estado}</div>
                            </div>
                            <button onclick="cambiarEstado(${idx})" style="background: var(--azul-rapidin); color: #fff; border: none; padding: 8px 12px; border-radius: 10px; font-weight: 700; font-size: 11px; cursor: pointer;">
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
            <div style="display: flex; flex-direction: column; gap: 10px; max-height: 520px; overflow-y: auto;">
                ${historialActual.length > 0 ? historialActual.map(h => `
                    <div style="background: #fff; padding: 12px 14px; border-radius: 14px; box-shadow: 0 2px 5px rgba(0,0,0,0.03); border-left: 5px solid #10b981;">
                        <div style="display:flex; justify-content:space-between; font-weight:700; font-size:13px;">
                            <span style="color:var(--azul-rapidin);">Orden #${h.id}</span>
                            <span style="color:#059669;">Entregado</span>
                        </div>
                        <div style="font-size: 12px; color: #4b5563; margin-top: 4px;">${h.detalle}</div>${h.nota ? `<div style="font-size: 11px; color: #d97706; margin-top: 2px;">Nota: ${h.nota}</div>` : ''}
                        <div style="font-size: 11px; color: var(--gris-texto); margin-top: 6px;">Total abonado: <b>$${h.total.toLocaleString()}</b></div>
                    </div>
                `).join('') : '<p style="color:var(--gris-texto); font-size:13px; text-align:center; padding: 40px 0;">Aún no hay registros en el historial.</p>'}
            </div>
        `;
    } else if (pestanaAdminActiva === 'stock') {
        contenedor.innerHTML = `
            <div style="font-weight: 700; color: var(--azul-rapidin); font-size: 14px; margin-bottom: 2px; display: flex; justify-content: space-between; align-items: center;">
                <span>Control de Stock:</span>
                ${productosAgotados > 0 ? `<span style="font-size: 11px; background: #fee2e2; color: #dc2626; padding: 2px 8px; border-radius: 6px; font-weight: 700;">¡Hay ${productosAgotados} sin stock!</span>` : ''}
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px; max-height: 520px; overflow-y: auto;">
                ${stockActual.map((item, idx) => {
                    let sinStock = item.stock <= 0;
                    return `
                        <div style="background: #fff; padding: 10px 14px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 3px rgba(0,0,0,0.02); border-left: 4px solid ${sinStock ? '#ef4444' : '#10b981'};">
                            <span style="font-size: 12px; font-weight: 700; color: var(--azul-rapidin); max-width: 150px;">${item.nombre}</span>
                            <div style="display: flex; align-items: center; gap: 6px;">
                                <button onclick="modificarStock(${idx}, -1)" style="background: #f3f4f6; border: 1px solid #d1d5db; width: 24px; height: 24px; border-radius: 6px; font-weight: bold; cursor: pointer;">-</button>
                                <input type="number" min="0" value="${item.stock}" onchange="fijarStockDirecto(${idx}, this.value)" style="width: 42px; text-align: center; font-size: 12px; font-weight: 700; border: 1px solid #d1d5db; border-radius: 6px; padding: 2px; outline: none; color: ${sinStock ? '#ef4444' : '#374151'};">
                                <button onclick="modificarStock(${idx}, 1)" style="background: var(--naranja-rapidin); border: none; width: 24px; height: 24px; border-radius: 6px; font-weight: bold; color: var(--azul-rapidin); cursor: pointer;">+</button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
}