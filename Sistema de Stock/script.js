// Configuración automática de la API
const getApiUrl = () => {
    // En producción (detectar si estamos en Render u otro hosting)
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        return 'https://stock-api-n1hg.onrender.com/api';
    }
    // En desarrollo local
    return 'http://localhost:8000/api';
};

const API_BASE_URL = getApiUrl();
const PING_URL = API_BASE_URL.replace('/api', '/ping');

console.log('🔗 API URL:', API_BASE_URL);
console.log('📡 Ping URL:', PING_URL);

// Sistema de ping cada 5 minutos para mantener Render activo
const keepAlive = () => {
    // Solo hacer ping si no estamos en desarrollo local
    if (!API_BASE_URL.includes('localhost')) {
        fetch(PING_URL)
            .then(response => response.json())
            .then(data => {
                console.log('💓 Ping exitoso:', data.timestamp);
            })
            .catch(error => {
                console.warn('⚠️ Error en ping:', error);
            });
    }
};

// Iniciar ping cada 5 minutos (300000 ms)
setInterval(keepAlive, 300000);

// Ping inicial después de 30 segundos
setTimeout(keepAlive, 30000);

// Funciones para el sidenav
function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}

// Exponer funciones al ámbito global para que funcionen con onclick en HTML
window.openNav = openNav;
window.closeNav = closeNav;

// Funciones de utilidad para la API
const api = {
    async get(endpoint) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`);
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error en GET:', error);
            throw error;
        }
    },

    async post(endpoint, data) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error en POST:', error);
            throw error;
        }
    },

    async put(endpoint, data) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error en PUT:', error);
            throw error;
        }
    },

    async delete(endpoint) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error en DELETE:', error);
            throw error;
        }
    }
};

// Clase para manejar los productos
class ProductoManager {
    constructor() {
        this.productos = [];
        this.categorias = [];
        this.initEventListeners();
        this.cargarDatos();
        this.ventaManager = new VentaManager(this);
    }

    async cargarDatos() {
        try {
            await this.cargarCategorias();
            await this.cargarProductos();
            this.actualizarTablas();
        } catch (error) {
            console.error('Error al cargar datos:', error);
            alert('Error al conectar con el servidor. Verifica que esté ejecutándose.');
        }
    }

    async cargarCategorias() {
        try {
            this.categorias = await api.get('/categorias');
            this.actualizarSelectsCategorias();
            this.generarSeccionesCategorias();
        } catch (error) {
            console.error('Error al cargar categorías:', error);
        }
    }

    generarSeccionesCategorias() {
        const stockTablesContainer = document.getElementById('stock-tables');
        if (stockTablesContainer) {
            stockTablesContainer.innerHTML = '';
            
            this.categorias.forEach(categoria => {
                const categorySection = document.createElement('div');
                categorySection.className = 'table-wrapper';
                categorySection.innerHTML = `
                    <h3>${categoria.nombre}</h3>
                    <div id="tabla${categoria.nombre}" class="tabla-container"></div>
                `;
                stockTablesContainer.appendChild(categorySection);
            });
        }
    }

    async cargarProductos() {
        try {
            this.productos = await api.get('/productos');
        } catch (error) {
            console.error('Error al cargar productos:', error);
        }
    }

    actualizarSelectsCategorias() {
        const selects = ['categoria', 'editCategoria'];
        selects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                select.innerHTML = '';
                this.categorias.forEach(categoria => {
                    const option = document.createElement('option');
                    option.value = categoria.id;
                    option.textContent = categoria.nombre;
                    select.appendChild(option);
                });
            }
        });
    }

    initEventListeners() {
        // Navegación
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.mostrarSeccion(btn.dataset.view);
                closeNav();
            });
        });

        // Formulario para agregar productos
        document.getElementById('productoForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.agregarProducto();
        });

        // Formulario para editar productos
        document.getElementById('editarForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.guardarEdicion();
        });

        // Cerrar modal
        document.querySelector('.close').addEventListener('click', () => {
            document.getElementById('modalEditar').style.display = 'none';
        });
    }

    mostrarSeccion(view) {
        document.getElementById('agregarSection').style.display = view === 'agregar' ? 'block' : 'none';
        document.getElementById('stockSection').style.display = view === 'stock' ? 'block' : 'none';
        document.getElementById('ventasSection').style.display = view === 'ventas' ? 'block' : 'none';
        
        if (view === 'stock') {
            this.cargarProductos().then(() => this.actualizarTablas());
        }
    }

    async agregarProducto() {
        try {
            const producto = {
                nombre: document.getElementById('nombre').value,
                codigo: document.getElementById('codigo').value,
                categoria_id: parseInt(document.getElementById('categoria').value),
                precio: parseFloat(document.getElementById('precio').value),
                detalle: document.getElementById('detalle').value,
                stock_minimo: 0
            };

            await api.post('/productos', producto);
            
            // Registrar stock inicial
            const stockInicial = parseInt(document.getElementById('stock').value);
            if (stockInicial > 0) {
                // Primero obtener el producto recién creado para obtener su ID
                await this.cargarProductos();
                const productoCreado = this.productos.find(p => p.codigo === producto.codigo);
                if (productoCreado) {
                    await api.post('/movimientos/entrada', {
                        producto_id: productoCreado.id,
                        cantidad: stockInicial
                    });
                }
            }

            document.getElementById('productoForm').reset();
            await this.cargarProductos();
            this.actualizarTablas();
            alert('Producto agregado exitosamente');
        } catch (error) {
            console.error('Error al agregar producto:', error);
            alert('Error al agregar producto: ' + error.message);
        }
    }

    async eliminarProducto(id) {
        if (confirm('¿Está seguro de que desea eliminar este producto?')) {
            try {
                await api.delete(`/productos/${id}`);
                await this.cargarProductos();
                this.actualizarTablas();
                alert('Producto eliminado exitosamente');
            } catch (error) {
                console.error('Error al eliminar producto:', error);
                alert('Error al eliminar producto: ' + error.message);
            }
        }
    }

    abrirEditar(id) {
        const producto = this.productos.find(p => p.id === id);
        if (producto) {
            document.getElementById('editId').value = producto.id;
            document.getElementById('editCategoria').value = producto.categoria_id;
            document.getElementById('editNombre').value = producto.nombre;
            document.getElementById('editCodigo').value = producto.codigo;
            document.getElementById('editDetalle').value = producto.detalle;
            document.getElementById('editPrecio').value = producto.precio;
            document.getElementById('editStock').value = producto.stock_actual;
            document.getElementById('modalEditar').style.display = 'block';
        }
    }

    async guardarEdicion() {
        try {
            const id = parseInt(document.getElementById('editId').value);
            const producto = {
                nombre: document.getElementById('editNombre').value,
                codigo: document.getElementById('editCodigo').value,
                categoria_id: parseInt(document.getElementById('editCategoria').value),
                precio: parseFloat(document.getElementById('editPrecio').value),
                detalle: document.getElementById('editDetalle').value,
                stock_minimo: 0
            };

            await api.put(`/productos/${id}`, producto);
            
            // Actualizar stock si es necesario
            const stockActual = this.productos.find(p => p.id === id)?.stock_actual || 0;
            const nuevoStock = parseInt(document.getElementById('editStock').value);
            
            if (nuevoStock !== stockActual) {
                const diferencia = nuevoStock - stockActual;
                if (diferencia > 0) {
                    await api.post('/movimientos/entrada', {
                        producto_id: id,
                        cantidad: diferencia
                    });
                } else if (diferencia < 0) {
                    await api.post('/movimientos/salida', {
                        producto_id: id,
                        cantidad: Math.abs(diferencia)
                    });
                }
            }

            await this.cargarProductos();
            this.actualizarTablas();
            document.getElementById('modalEditar').style.display = 'none';
            alert('Producto actualizado exitosamente');
        } catch (error) {
            console.error('Error al actualizar producto:', error);
            alert('Error al actualizar producto: ' + error.message);
        }
    }

    actualizarTablas() {
        // Usar las categorías cargadas desde la base de datos
        this.categorias.forEach(categoria => {
            const productosFiltrados = this.productos.filter(p => p.categoria === categoria.nombre);
            const tabla = `
                <table>
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Nombre</th>
                            <th>Detalle</th>
                            <th>Precio</th>
                            <th>Stock</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${productosFiltrados.map(p => `
                            <tr>
                                <td>${p.codigo}</td>
                                <td>${p.nombre}</td>
                                <td>${p.detalle}</td>
                                <td>$${parseFloat(p.precio || 0).toFixed(2)}</td>
                                <td class="${(p.stock_actual || 0) < 5 ? 'stock-bajo' : ''}">${p.stock_actual || 0}</td>
                                <td>
                                    <button class="btn-editar" onclick="productoManager.abrirEditar(${p.id})">Editar</button>
                                    <button class="btn-eliminar" onclick="productoManager.eliminarProducto(${p.id})">Eliminar</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;

            // Buscar el elemento por el nombre de la categoría
            const tablaElement = document.getElementById(`tabla${categoria.nombre}`);
            if (tablaElement) {
                tablaElement.innerHTML = 
                    productosFiltrados.length ? tabla : '<p>No hay productos en esta categoría</p>';
            }
        });
    }
}

class VentaManager {
    constructor(productoManager) {
        this.productoManager = productoManager;
        this.ventaActual = [];
        this.initEventListeners();
    }

    initEventListeners() {
        const inputCodigo = document.getElementById('codigoProducto');
        inputCodigo.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.procesarCodigo(inputCodigo.value);
                inputCodigo.value = '';
            }
        });

        document.getElementById('confirmarVenta').addEventListener('click', () => {
            this.confirmarVenta();
        });
    }

    async procesarCodigo(codigo) {
        try {
            const producto = await api.get(`/productos/codigo/${codigo}`);
            if (producto.stock_actual > 0) {
                this.agregarProductoAVenta(producto);
            } else {
                alert('Producto sin stock disponible');
            }
        } catch (error) {
            console.error('Error al buscar producto:', error);
            alert('Producto no encontrado');
        }
    }

    agregarProductoAVenta(producto) {
        const precio = parseFloat(producto.precio || 0);
        const itemExistente = this.ventaActual.find(item => item.id === producto.id);
        if (itemExistente) {
            if (itemExistente.cantidad < producto.stock_actual) {
                itemExistente.cantidad++;
                itemExistente.subtotal = itemExistente.cantidad * itemExistente.precio;
            } else {
                alert('Stock insuficiente');
                return;
            }
        } else {
            this.ventaActual.push({
                id: producto.id,
                nombre: producto.nombre,
                precio: precio,
                cantidad: 1,
                subtotal: precio
            });
        }
        this.actualizarTablaVenta();
    }

    actualizarCantidad(id, nuevaCantidad) {
        const item = this.ventaActual.find(item => item.id === id);
        const producto = this.productoManager.productos.find(p => p.id === id);
        
        if (nuevaCantidad > producto.stock_actual) {
            alert('Stock insuficiente');
            return;
        }

        if (nuevaCantidad <= 0) {
            this.eliminarProducto(id);
            return;
        }

        item.cantidad = nuevaCantidad;
        item.subtotal = item.cantidad * item.precio;
        this.actualizarTablaVenta();
    }

    eliminarProducto(id) {
        this.ventaActual = this.ventaActual.filter(item => item.id !== id);
        this.actualizarTablaVenta();
    }

    actualizarTablaVenta() {
        const tbody = document.querySelector('#tablaVenta tbody');
        tbody.innerHTML = '';
        let total = 0;

        this.ventaActual.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.nombre}</td>
                <td>$${parseFloat(item.precio || 0).toFixed(2)}</td>
                <td>
                    <input type="number" class="cantidad-input" value="${item.cantidad}"
                           min="1" onchange="ventaManager.actualizarCantidad(${item.id}, parseInt(this.value))">
                </td>
                <td>$${parseFloat(item.subtotal || 0).toFixed(2)}</td>
                <td>
                    <button class="btn-eliminar-producto" onclick="ventaManager.eliminarProducto(${item.id})">
                        Eliminar
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
            total += parseFloat(item.subtotal || 0);
        });

        document.getElementById('totalVenta').textContent = total.toFixed(2);
    }

    async confirmarVenta() {
        if (this.ventaActual.length === 0) {
            alert('No hay productos en la venta actual');
            return;
        }

        try {
            const productos = this.ventaActual.map(item => ({
                producto_id: item.id,
                cantidad: item.cantidad
            }));

            await api.post('/ventas', { productos });

            this.ventaActual = [];
            this.actualizarTablaVenta();
            await this.productoManager.cargarProductos();
            this.productoManager.actualizarTablas();

            alert('Venta realizada con éxito');
        } catch (error) {
            console.error('Error al procesar venta:', error);
            alert('Error al procesar venta: ' + error.message);
        }
    }
}

// Inicialización
const productoManager = new ProductoManager();
const ventaManager = productoManager.ventaManager;

// Configurar la vista inicial (Realizar Ventas)
const configurarVistaInicial = () => {
    // Marcar el botón de ventas como activo
    const ventasBtn = document.querySelector('[data-view="ventas"]');
    if (ventasBtn) {
        ventasBtn.classList.add('active');
    }
    
    // Asegurar que se muestre la sección de ventas
    if (window.productoManager && window.productoManager.mostrarSeccion) {
        window.productoManager.mostrarSeccion('ventas');
    }
    
    // Foco en el input de códigos para facilitar el uso
    const codigoInput = document.getElementById('codigoProducto');
    if (codigoInput) {
        setTimeout(() => codigoInput.focus(), 100);
    }
};

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', configurarVistaInicial);
} else {
    // Si el DOM ya está cargado, ejecutar inmediatamente
    configurarVistaInicial();
}

// Exponer al ámbito global
window.productoManager = productoManager;
window.ventaManager = ventaManager;
