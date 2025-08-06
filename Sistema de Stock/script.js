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

// ===== SISTEMA DE MENSAJES TOAST =====
class ToastManager {
    constructor() {
        this.container = null;
        this.toastCounter = 0;
        this.init();
    }

    init() {
        // Crear el contenedor de toast si no existe
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
    }

    show(message, type = 'info', duration = 4000) {
        const toast = this.createToast(message, type, duration);
        this.container.appendChild(toast);

        // Mostrar el toast con animación
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        // Auto-ocultar después del tiempo especificado
        setTimeout(() => {
            this.hide(toast);
        }, duration);

        return toast;
    }

    createToast(message, type, duration) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.id = `toast-${++this.toastCounter}`;

        // Determinar el icono según el tipo
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        toast.innerHTML = `
            <div class="toast-icon">${icons[type] || icons.info}</div>
            <div class="toast-content">${message}</div>
            <button class="toast-close" onclick="toastManager.hide(this.parentElement)">×</button>
            <div class="toast-progress"></div>
        `;

        return toast;
    }

    hide(toast) {
        if (!toast || !toast.parentElement) return;

        toast.classList.remove('show');
        toast.classList.add('hide');

        // Remover del DOM después de la animación
        setTimeout(() => {
            if (toast.parentElement) {
                toast.parentElement.removeChild(toast);
            }
        }, 300);
    }

    // Métodos de conveniencia para diferentes tipos de mensajes
    success(message, duration = 4000) {
        return this.show(message, 'success', duration);
    }

    error(message, duration = 5000) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration = 4500) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration = 4000) {
        return this.show(message, 'info', duration);
    }
}

// Crear instancia global del toast manager
const toastManager = new ToastManager();

// Función global para mostrar mensajes (reemplazo directo de alert)
function mostrarMensaje(mensaje, tipo = 'info') {
    return toastManager.show(mensaje, tipo);
}

// Exponer al ámbito global
window.toastManager = toastManager;
window.mostrarMensaje = mostrarMensaje;

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
                const errorText = await response.text();
                throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error en GET:', error);
            // Mejorar el manejo de errores de conexión
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Error de conexión. Verifique que el servidor esté funcionando.');
            }
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

// Clase para manejar la pistola lectora de códigos de barra
class ScannerManager {
    constructor() {
        this.callbacks = new Map(); // Mapa de contextos y sus callbacks
        this.currentContext = null;
        this.isScanning = false;
        this.scanBuffer = '';
        this.scanTimeout = null;
        this.initGlobalListener();
    }

    // Inicializar el listener global para detectar el botón de la pistola
    initGlobalListener() {
        document.addEventListener('keydown', (e) => {
            // Detectar si es el botón de la pistola (Enter o Tab)
            if ((e.key === 'Enter' || e.key === 'Tab') && this.isInputFocused()) {
                e.preventDefault();
                this.handleScannerButton();
            }
        });

        // Detectar secuencias de escaneo rápido (opcional para pistolas que no envían Enter)
        document.addEventListener('keypress', (e) => {
            if (this.isInputFocused() && e.target.dataset.scannerInput === 'true') {
                this.handleScanInput(e);
            }
        });
    }

    // Verificar si hay un input enfocado que sea compatible con scanner
    isInputFocused() {
        const activeElement = document.activeElement;
        return activeElement && 
               activeElement.tagName === 'INPUT' && 
               activeElement.type === 'text' &&
               activeElement.dataset.scannerInput === 'true';
    }

    // Manejar el input de escaneo (para pistolas que escriben rápido sin Enter)
    handleScanInput(e) {
        clearTimeout(this.scanTimeout);
        this.scanBuffer += e.key;
        
        // Si detectamos una secuencia rápida, considerarlo un escaneo
        this.scanTimeout = setTimeout(() => {
            if (this.scanBuffer.length > 3) { // Códigos típicamente > 3 caracteres
                this.handleScannerButton();
            }
            this.scanBuffer = '';
        }, 100); // 100ms de timeout para detectar escaneo rápido
    }

    // Manejar el botón de la pistola
    handleScannerButton() {
        const activeElement = document.activeElement;
        if (!activeElement || !this.currentContext) return;

        const codigo = activeElement.value.trim();
        if (!codigo) return;

        // Ejecutar el callback del contexto actual
        const callback = this.callbacks.get(this.currentContext);
        if (callback && typeof callback === 'function') {
            callback(codigo, activeElement);
        }
    }

    // Registrar un callback para un contexto específico
    registerContext(contextName, callback) {
        this.callbacks.set(contextName, callback);
    }

    // Establecer el contexto actual
    setContext(contextName) {
        this.currentContext = contextName;
    }

    // Función helper para configurar un input como scanner-ready
    setupScannerInput(inputElement, contextName, callback) {
        if (!inputElement) return;

        // Marcar el input como compatible con scanner
        inputElement.dataset.scannerInput = 'true';
        
        // Registrar el callback si se proporciona
        if (callback) {
            this.registerContext(contextName, callback);
        }

        // Auto-establecer contexto cuando el input recibe foco
        inputElement.addEventListener('focus', () => {
            this.setContext(contextName);
        });

        // Limpiar contexto cuando pierde foco (opcional)
        inputElement.addEventListener('blur', () => {
            if (this.currentContext === contextName) {
                this.currentContext = null;
            }
        });
    }

    // Función pública para uso externo (Bonus)
    onScannerButtonPress(callback) {
        if (this.currentContext) {
            this.registerContext(this.currentContext, callback);
        }
    }
}

// Instancia global del scanner manager
const scannerManager = new ScannerManager();

// Clase para manejar los productos
class ProductoManager {
    constructor() {
        this.productos = [];
        this.categorias = [];
        this.paginaActual = 1;
        this.productosPorPagina = 50;
        this.productosFiltrados = []; // Para almacenar resultados de búsqueda
        this.modosBusqueda = false; // Para saber si estamos en modo búsqueda
        this.searchTimeout = null; // Para debounce en búsqueda
        this.lastLoadTime = null; // Para cache simple
        this.initEventListeners();
        this.cargarDatos();
        this.ventaManager = new VentaManager(this);
        // Mostrar la sección de ventas por defecto al inicializar
        this.mostrarSeccion('ventas');
    }

    async cargarDatos() {
        try {
            await this.cargarCategorias();
            await this.cargarProductos();
            this.actualizarTablas();
        } catch (error) {
            console.error('Error al cargar datos:', error);
            toastManager.error('Error al conectar con el servidor. Verifica que esté ejecutándose.');
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
            // Mostrar indicador de carga si la sección de stock está visible
            const stockSection = document.getElementById('stockSection');
            if (stockSection && stockSection.style.display !== 'none') {
                const loadingDiv = document.createElement('div');
                loadingDiv.id = 'loading-productos';
                loadingDiv.className = 'loading-message';
                loadingDiv.innerHTML = '⏳ Cargando productos...';
                
                const stockTables = document.getElementById('stock-tables');
                if (stockTables) {
                    stockTables.prepend(loadingDiv);
                }
            }
            
            this.productos = await api.get('/productos');
            this.lastLoadTime = Date.now();
            
            // Remover indicador de carga
            const loadingDiv = document.getElementById('loading-productos');
            if (loadingDiv) {
                loadingDiv.remove();
            }
        } catch (error) {
            console.error('Error al cargar productos:', error);
            // Remover indicador de carga en caso de error
            const loadingDiv = document.getElementById('loading-productos');
            if (loadingDiv) {
                loadingDiv.remove();
            }
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
            
            // Verificar si el botón está deshabilitado (producto existente)
            const botonAgregar = document.querySelector('#productoForm button[type="submit"]');
            if (botonAgregar && botonAgregar.disabled) {
                toastManager.warning('Este producto ya existe en el stock. Use "Limpiar Formulario" para agregar un producto diferente.');
                return;
            }
            
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

        // Configurar scanner para búsqueda en stock
        const inputBusqueda = document.getElementById('busquedaCodigo');
        if (inputBusqueda) {
            scannerManager.setupScannerInput(inputBusqueda, 'stock-search', (codigo, input) => {
                this.buscarPorCodigo(codigo);
                input.value = ''; // Limpiar input después del escaneo
            });

            // Mantener compatibilidad con Enter manual
            inputBusqueda.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault(); // Prevenir doble ejecución
                    this.buscarPorCodigo(inputBusqueda.value.trim());
                }
            });
        }

        // Configurar scanner para código en formulario de agregar producto
        const inputCodigo = document.getElementById('codigo');
        if (inputCodigo) {
            scannerManager.setupScannerInput(inputCodigo, 'add-product', (codigo, input) => {
                // Verificar si el producto ya existe y autocompletar
                this.verificarYAutocompletarProducto(codigo);
            });

            // Mantener compatibilidad con Enter manual para el campo código
            inputCodigo.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.verificarYAutocompletarProducto(inputCodigo.value.trim());
                }
            });
        }

        // Botón "Ver Todos"
        const btnVerTodos = document.getElementById('btnVerTodos');
        if (btnVerTodos) {
            btnVerTodos.addEventListener('click', () => {
                this.limpiarBusqueda();
            });
        }

        // Botones de paginación
        const btnAnterior = document.getElementById('btn-anterior');
        const btnSiguiente = document.getElementById('btn-siguiente');
        
        if (btnAnterior) {
            btnAnterior.addEventListener('click', () => {
                this.cambiarPagina(-1);
            });
        }
        
        if (btnSiguiente) {
            btnSiguiente.addEventListener('click', () => {
                this.cambiarPagina(1);
            });
        }
    }

    mostrarSeccion(view) {
        document.getElementById('agregarSection').style.display = view === 'agregar' ? 'block' : 'none';
        document.getElementById('stockSection').style.display = view === 'stock' ? 'block' : 'none';
        document.getElementById('ventasSection').style.display = view === 'ventas' ? 'block' : 'none';
        
        if (view === 'stock') {
            // Resetear a la primera página cuando se abre la sección de stock
            this.paginaActual = 1;
            this.limpiarBusqueda(); // Limpiar búsqueda al abrir la sección
            this.cargarProductos().then(() => this.actualizarTablas());
            
            // Enfocar el input de búsqueda y establecer contexto
            setTimeout(() => {
                const inputBusqueda = document.getElementById('busquedaCodigo');
                if (inputBusqueda) {
                    inputBusqueda.focus();
                    scannerManager.setContext('stock-search');
                }
            }, 100);
        } else if (view === 'agregar') {
            // Enfocar el primer campo del formulario
            setTimeout(() => {
                const inputCategoria = document.getElementById('categoria');
                if (inputCategoria) {
                    inputCategoria.focus();
                }
            }, 100);
        } else if (view === 'ventas') {
            // Enfocar el input de código de producto en ventas
            setTimeout(() => {
                const inputCodigoVenta = document.getElementById('codigoProducto');
                if (inputCodigoVenta) {
                    inputCodigoVenta.focus();
                    scannerManager.setContext('sales');
                }
            }, 100);
        }
    }

    // Función para buscar producto por código
    buscarPorCodigo(codigo) {
        if (!codigo) {
            this.mostrarMensajeBusqueda('Por favor ingrese un código para buscar', 'error');
            return;
        }

        // Buscar el producto en el array
        const productoEncontrado = this.productos.find(producto => 
            producto.codigo === codigo
        );

        if (productoEncontrado) {
            // Producto encontrado - mostrar solo ese producto
            this.productosFiltrados = [productoEncontrado];
            this.modosBusqueda = true;
            this.paginaActual = 1; // Resetear a página 1
            this.actualizarTablas();
            this.mostrarMensajeBusqueda(`Producto encontrado: ${productoEncontrado.nombre}`, 'success');
            
            // Limpiar el input
            document.getElementById('busquedaCodigo').value = '';
        } else {
            // Producto no encontrado - mostrar mensaje en la tabla
            this.productosFiltrados = [];
            this.modosBusqueda = true;
            this.paginaActual = 1;
            this.actualizarTablas(); // Esto mostrará el mensaje "Producto no encontrado"
            this.mostrarMensajeBusqueda('Producto no encontrado', 'error');
            
            // Limpiar el input después de un momento
            setTimeout(() => {
                document.getElementById('busquedaCodigo').value = '';
            }, 2000);
        }
    }

    // Función para limpiar la búsqueda y mostrar todos los productos
    limpiarBusqueda() {
        this.productosFiltrados = [];
        this.modosBusqueda = false;
        this.paginaActual = 1;
        this.ocultarMensajeBusqueda();
        document.getElementById('busquedaCodigo').value = '';
        
        // Restaurar la estructura de categorías antes de actualizar tablas
        this.generarSeccionesCategorias();
        this.actualizarTablas();
        
        // Enfocar el input de búsqueda
        setTimeout(() => {
            document.getElementById('busquedaCodigo').focus();
        }, 100);
    }

    // Función para mostrar mensajes de búsqueda
    mostrarMensajeBusqueda(mensaje, tipo) {
        const mensajeDiv = document.getElementById('mensajeBusqueda');
        if (mensajeDiv) {
            mensajeDiv.textContent = mensaje;
            mensajeDiv.className = `search-message ${tipo}`;
            mensajeDiv.style.display = 'block';
            
            // Ocultar el mensaje después de 3 segundos si es de éxito
            if (tipo === 'success') {
                setTimeout(() => {
                    this.ocultarMensajeBusqueda();
                }, 3000);
            }
        }
    }

    // Función para ocultar mensajes de búsqueda
    ocultarMensajeBusqueda() {
        const mensajeDiv = document.getElementById('mensajeBusqueda');
        if (mensajeDiv) {
            mensajeDiv.style.display = 'none';
        }
    }

    // Función para verificar si el producto existe y autocompletar el formulario
    verificarYAutocompletarProducto(codigo) {
        if (!codigo) return;

        // Buscar el producto en el array de productos cargados
        const productoExistente = this.productos.find(producto => 
            producto.codigo === codigo
        );

        if (productoExistente) {
            // Producto existe - autocompletar formulario
            this.autocompletarFormulario(productoExistente);
            this.mostrarMensajeProductoExistente();
            this.deshabilitarBotonAgregar();
        } else {
            // Producto no existe - permitir agregar nuevo
            this.habilitarBotonAgregar();
            this.ocultarMensajeProductoExistente();
            // Enfocar el siguiente campo para continuar con el alta
            const siguienteCampo = document.getElementById('nombre');
            if (siguienteCampo) {
                siguienteCampo.focus();
            }
        }
    }

    // Función para autocompletar el formulario con datos del producto existente
    autocompletarFormulario(producto) {
        document.getElementById('codigo').value = producto.codigo;
        document.getElementById('nombre').value = producto.nombre;
        document.getElementById('categoria').value = producto.categoria_id;
        document.getElementById('detalle').value = producto.detalle;
        document.getElementById('precio').value = producto.precio;
        document.getElementById('stock').value = producto.stock_actual || 0;
        document.getElementById('fechaVencimiento').value = producto.fecha_vencimiento || '';
    }

    // Función para mostrar mensaje de producto existente
    mostrarMensajeProductoExistente() {
        // Crear o actualizar el mensaje si no existe
        let mensajeDiv = document.getElementById('mensajeProductoExistente');
        if (!mensajeDiv) {
            mensajeDiv = document.createElement('div');
            mensajeDiv.id = 'mensajeProductoExistente';
            mensajeDiv.className = 'alert alert-warning';
            
            // Insertar el mensaje después del formulario
            const formulario = document.getElementById('productoForm');
            formulario.parentNode.insertBefore(mensajeDiv, formulario.nextSibling);
        }
        
        mensajeDiv.innerHTML = `
            <strong>⚠️ Este producto ya existe en el stock</strong>
            <p>Los campos se han completado automáticamente con la información actual del producto.</p>
        `;
        mensajeDiv.style.display = 'block';
    }

    // Función para ocultar mensaje de producto existente
    ocultarMensajeProductoExistente() {
        const mensajeDiv = document.getElementById('mensajeProductoExistente');
        if (mensajeDiv) {
            mensajeDiv.style.display = 'none';
        }
    }

    // Función para deshabilitar el botón de agregar producto
    deshabilitarBotonAgregar() {
        const botonAgregar = document.querySelector('#productoForm button[type="submit"]');
        if (botonAgregar) {
            botonAgregar.disabled = true;
            botonAgregar.textContent = 'Producto ya existe en stock';
            botonAgregar.style.backgroundColor = '#6c757d';
            botonAgregar.style.cursor = 'not-allowed';
        }
    }

    // Función para habilitar el botón de agregar producto
    habilitarBotonAgregar() {
        const botonAgregar = document.querySelector('#productoForm button[type="submit"]');
        if (botonAgregar) {
            botonAgregar.disabled = false;
            botonAgregar.textContent = 'Agregar Producto';
            botonAgregar.style.backgroundColor = '';
            botonAgregar.style.cursor = '';
        }
    }

    // Función para limpiar el formulario (bonus)
    limpiarFormularioProducto() {
        document.getElementById('productoForm').reset();
        this.habilitarBotonAgregar();
        this.ocultarMensajeProductoExistente();
        
        // Enfocar el primer campo
        const primerCampo = document.getElementById('categoria');
        if (primerCampo) {
            primerCampo.focus();
        }
    }

    async agregarProducto() {
        try {
            // Validaciones mejoradas
            const codigo = document.getElementById('codigo').value.trim();
            const nombre = document.getElementById('nombre').value.trim();
            const precio = parseFloat(document.getElementById('precio').value);
            const stock = parseInt(document.getElementById('stock').value);
            
            if (!codigo || !nombre) {
                toastManager.error('El código y nombre son obligatorios');
                return;
            }
            
            if (precio <= 0) {
                toastManager.error('El precio debe ser mayor a 0');
                return;
            }
            
            if (stock < 0) {
                toastManager.error('El stock no puede ser negativo');
                return;
            }
            
            // Mostrar loading state
            const submitButton = document.querySelector('#productoForm button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = '⏳ Agregando...';
            submitButton.style.cursor = 'not-allowed';
            
            const producto = {
                nombre: nombre,
                codigo: codigo,
                categoria_id: parseInt(document.getElementById('categoria').value),
                precio: precio,
                detalle: document.getElementById('detalle').value.trim(),
                stock_minimo: 0,
                fecha_vencimiento: document.getElementById('fechaVencimiento').value || null
            };

            // Crear el producto y obtener la respuesta con el ID
            const responseProducto = await api.post('/productos', producto);
            const productoId = responseProducto.id || responseProducto.producto?.id;
            
            // Registrar stock inicial si es necesario
            const stockInicial = parseInt(document.getElementById('stock').value);
            if (stockInicial > 0 && productoId) {
                await api.post('/movimientos/entrada', {
                    producto_id: productoId,
                    cantidad: stockInicial
                });
            }

            // Limpiar formulario inmediatamente para mejor UX
            document.getElementById('productoForm').reset();
            toastManager.success('Producto agregado exitosamente');
            
            // Recargar datos en segundo plano (una sola vez)
            this.cargarProductos().then(() => {
                this.actualizarTablas();
            }).catch(error => {
                console.warn('Error al actualizar tabla después de agregar producto:', error);
            });
            
            // Restaurar botón
            submitButton.disabled = false;
            submitButton.textContent = originalText;
            submitButton.style.cursor = '';
            
        } catch (error) {
            console.error('Error al agregar producto:', error);
            toastManager.error('Error al agregar producto: ' + error.message);
            
            // Restaurar botón en caso de error
            const submitButton = document.querySelector('#productoForm button[type="submit"]');
            submitButton.disabled = false;
            submitButton.textContent = 'Agregar Producto';
            submitButton.style.cursor = '';
        }
    }

    async eliminarProducto(id) {
        const producto = this.productos.find(p => p.id === id);
        const nombreProducto = producto ? producto.nombre : 'este producto';
        
        if (confirm(`¿Está seguro de que desea eliminar "${nombreProducto}"?\n\nEsta acción no se puede deshacer.`)) {
            try {
                // Eliminar del servidor
                await api.delete(`/productos/${id}`);
                
                // Mostrar mensaje de éxito inmediatamente
                toastManager.success(`Producto "${nombreProducto}" eliminado exitosamente`);
                
                // Eliminar localmente para UX inmediato
                this.productos = this.productos.filter(p => p.id !== id);
                
                // Si estamos en modo búsqueda, actualizar los productos filtrados
                if (this.modosBusqueda) {
                    this.productosFiltrados = this.productosFiltrados.filter(p => p.id !== id);
                    if (this.productosFiltrados.length === 0) {
                        // Si no quedan productos filtrados, volver al modo normal
                        this.limpiarBusqueda();
                    } else {
                        this.actualizarTablas();
                    }
                } else {
                    this.actualizarTablas();
                }
                
            } catch (error) {
                console.error('Error al eliminar producto:', error);
                toastManager.error('Error al eliminar producto: ' + error.message);
                
                // En caso de error, recargar datos para sincronizar
                this.cargarProductos().then(() => {
                    this.actualizarTablas();
                }).catch(err => {
                    console.warn('Error al recargar datos después del error:', err);
                });
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
            
            // Formatear fecha para el input de tipo date (YYYY-MM-DD)
            let fechaFormateada = '';
            if (producto.fecha_vencimiento) {
                try {
                    const fecha = new Date(producto.fecha_vencimiento);
                    if (!isNaN(fecha.getTime())) {
                        fechaFormateada = fecha.toISOString().split('T')[0];
                    }
                } catch (error) {
                    console.warn('Error al formatear fecha de vencimiento:', error);
                }
            }
            document.getElementById('editFechaVencimiento').value = fechaFormateada;
            
            document.getElementById('modalEditar').style.display = 'block';
        }
    }

    async guardarEdicion() {
        try {
            // Mostrar loading state
            const submitButton = document.querySelector('#editarForm button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = '⏳ Guardando...';
            submitButton.style.cursor = 'not-allowed';
            
            const id = parseInt(document.getElementById('editId').value);
            const producto = {
                nombre: document.getElementById('editNombre').value,
                codigo: document.getElementById('editCodigo').value,
                categoria_id: parseInt(document.getElementById('editCategoria').value),
                precio: parseFloat(document.getElementById('editPrecio').value),
                detalle: document.getElementById('editDetalle').value,
                stock_minimo: 0,
                fecha_vencimiento: document.getElementById('editFechaVencimiento').value || null
            };

            // Actualizar producto en el servidor
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

            // Actualizar localmente para UX inmediato
            const productoLocal = this.productos.find(p => p.id === id);
            if (productoLocal) {
                Object.assign(productoLocal, {
                    ...producto,
                    stock_actual: nuevoStock
                });
            }
            
            // Si estamos en modo búsqueda, actualizar el producto en los filtrados
            if (this.modosBusqueda) {
                const index = this.productosFiltrados.findIndex(p => p.id === id);
                if (index !== -1) {
                    Object.assign(this.productosFiltrados[index], {
                        ...producto,
                        stock_actual: nuevoStock
                    });
                }
            }
            
            // Cerrar modal y mostrar mensaje inmediatamente
            document.getElementById('modalEditar').style.display = 'none';
            toastManager.success('Producto actualizado exitosamente');
            
            // Actualizar tabla inmediatamente
            this.actualizarTablas();
            
            // Restaurar botón
            submitButton.disabled = false;
            submitButton.textContent = originalText;
            submitButton.style.cursor = '';
            
        } catch (error) {
            console.error('Error al actualizar producto:', error);
            toastManager.error('Error al actualizar producto: ' + error.message);
            
            // En caso de error, recargar datos para sincronizar
            this.cargarProductos().then(() => {
                this.actualizarTablas();
            }).catch(err => {
                console.warn('Error al recargar datos después del error:', err);
            });
            
            // Restaurar botón en caso de error
            const submitButton = document.querySelector('#editarForm button[type="submit"]');
            submitButton.disabled = false;
            submitButton.textContent = 'Guardar Cambios';
            submitButton.style.cursor = '';
        }
    }

    actualizarTablas() {
        // Determinar qué productos usar (todos o filtrados)
        const productosAUsar = this.modosBusqueda ? this.productosFiltrados : this.productos;
        const totalProductos = productosAUsar.length;
        const totalPaginas = Math.ceil(totalProductos / this.productosPorPagina);
        
        // Calcular el rango de productos para la página actual
        const inicio = (this.paginaActual - 1) * this.productosPorPagina;
        const fin = inicio + this.productosPorPagina;
        const productosPagina = productosAUsar.slice(inicio, fin);
        
        // Actualizar controles de paginación (ocultar si estamos en modo búsqueda con un solo producto)
        if (this.modosBusqueda && totalProductos === 1) {
            document.getElementById('pagination-controls').style.display = 'none';
        } else {
            document.getElementById('pagination-controls').style.display = 'block';
            this.actualizarControlesPaginacion(totalProductos, totalPaginas, inicio, fin);
        }
        
        // Si estamos en modo búsqueda, mostrar solo una tabla unificada
        if (this.modosBusqueda) {
            this.renderizarTablaBusqueda(productosPagina);
        } else {
            // Modo normal: agrupar por categorías
            this.renderizarTablasPorCategoria(productosPagina);
        }
    }
    
    actualizarControlesPaginacion(totalProductos, totalPaginas, inicio, fin) {
        // Actualizar texto informativo
        const paginationText = document.getElementById('pagination-text');
        if (paginationText) {
            const mostrandoHasta = Math.min(fin, totalProductos);
            paginationText.textContent = `Mostrando productos ${inicio + 1} a ${mostrandoHasta} de ${totalProductos}`;
        }
        
        // Actualizar indicador de página
        const pageIndicator = document.getElementById('page-indicator');
        if (pageIndicator) {
            pageIndicator.textContent = `Página ${this.paginaActual} de ${totalPaginas}`;
        }
        
        // Actualizar botones anterior/siguiente
        const btnAnterior = document.getElementById('btn-anterior');
        const btnSiguiente = document.getElementById('btn-siguiente');
        
        if (btnAnterior) {
            btnAnterior.disabled = this.paginaActual <= 1;
        }
        
        if (btnSiguiente) {
            btnSiguiente.disabled = this.paginaActual >= totalPaginas;
        }
        
        // Generar números de página
        this.generarNumerosPagina(totalPaginas);
    }
    
    generarNumerosPagina(totalPaginas) {
        const paginationNumbers = document.getElementById('pagination-numbers');
        if (!paginationNumbers) return;
        
        paginationNumbers.innerHTML = '';
        
        // Lógica para mostrar números de página con elipsis
        const maxPaginasVisibles = 7;
        let paginasAMostrar = [];
        
        if (totalPaginas <= maxPaginasVisibles) {
            // Mostrar todas las páginas si son pocas
            for (let i = 1; i <= totalPaginas; i++) {
                paginasAMostrar.push(i);
            }
        } else {
            // Lógica más compleja para páginas con elipsis
            if (this.paginaActual <= 4) {
                // Cerca del inicio
                paginasAMostrar = [1, 2, 3, 4, 5, '...', totalPaginas];
            } else if (this.paginaActual >= totalPaginas - 3) {
                // Cerca del final
                paginasAMostrar = [1, '...', totalPaginas - 4, totalPaginas - 3, totalPaginas - 2, totalPaginas - 1, totalPaginas];
            } else {
                // En el medio
                paginasAMostrar = [1, '...', this.paginaActual - 1, this.paginaActual, this.paginaActual + 1, '...', totalPaginas];
            }
        }
        
        // Crear elementos de página
        paginasAMostrar.forEach(pagina => {
            if (pagina === '...') {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'page-ellipsis';
                ellipsis.textContent = '...';
                paginationNumbers.appendChild(ellipsis);
            } else {
                const pageButton = document.createElement('button');
                pageButton.className = `page-number ${pagina === this.paginaActual ? 'active' : ''}`;
                pageButton.textContent = pagina;
                pageButton.onclick = () => this.irAPagina(pagina);
                paginationNumbers.appendChild(pageButton);
            }
        });
    }
    
    cambiarPagina(direccion) {
        const totalPaginas = Math.ceil(this.productos.length / this.productosPorPagina);
        const nuevaPagina = this.paginaActual + direccion;
        
        if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
            this.paginaActual = nuevaPagina;
            this.actualizarTablas();
            // Scroll suave hacia arriba
            document.getElementById('stockSection').scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    irAPagina(numeroPagina) {
        const totalPaginas = Math.ceil(this.productos.length / this.productosPorPagina);
        
        if (numeroPagina >= 1 && numeroPagina <= totalPaginas) {
            this.paginaActual = numeroPagina;
            this.actualizarTablas();
            // Scroll suave hacia arriba
            document.getElementById('stockSection').scrollIntoView({ behavior: 'smooth' });
        }
    }

    // Nueva función para renderizar tabla de búsqueda
    renderizarTablaBusqueda(productos) {
        const stockTablesContainer = document.getElementById('stock-tables');
        if (!stockTablesContainer) return;

        if (productos.length === 0) {
            stockTablesContainer.innerHTML = '<div class="no-results"><h3>Producto no encontrado</h3><p>No se encontró ningún producto con ese código.</p></div>';
            return;
        }

        const tabla = `
            <div class="search-results">
                <h3>Resultado de búsqueda (${productos.length} producto${productos.length > 1 ? 's' : ''})</h3>
                <div class="tabla-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Nombre</th>
                                <th>Categoría</th>
                                <th>Detalle</th>
                                <th>Precio</th>
                                <th>Stock</th>
                                <th>Vencimiento</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${productos.map(p => `
                                <tr>
                                    <td><strong>${p.codigo}</strong></td>
                                    <td>${p.nombre}</td>
                                    <td><span class="categoria-badge">${p.categoria}</span></td>
                                    <td>${p.detalle}</td>
                                    <td>$${parseFloat(p.precio || 0).toFixed(2)}</td>
                                    <td class="${(p.stock_actual || 0) < 5 ? 'stock-bajo' : ''}">${p.stock_actual || 0}</td>
                                    <td>${p.fecha_vencimiento ? new Date(p.fecha_vencimiento).toLocaleDateString() : 'Sin Fecha'}</td>
                                    <td>
                                        <button class="btn-editar" onclick="productoManager.abrirEditar(${p.id})">Editar</button>
                                        <button class="btn-eliminar" onclick="productoManager.eliminarProducto(${p.id})">Eliminar</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        stockTablesContainer.innerHTML = tabla;
    }

    // Nueva función para renderizar tablas por categoría (modo normal)
    renderizarTablasPorCategoria(productosPagina) {
        // Agrupar productos de la página actual por categoría
        const productosPorCategoria = {};
        this.categorias.forEach(categoria => {
            productosPorCategoria[categoria.nombre] = [];
        });
        
        productosPagina.forEach(producto => {
            if (productosPorCategoria[producto.categoria]) {
                productosPorCategoria[producto.categoria].push(producto);
            }
        });
        
        // Renderizar las tablas solo con los productos de la página actual
        this.categorias.forEach(categoria => {
            const productosFiltrados = productosPorCategoria[categoria.nombre] || [];
            const tabla = `
                <table>
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Nombre</th>
                            <th>Detalle</th>
                            <th>Precio</th>
                            <th>Stock</th>
                            <th>Vencimiento</th>
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
                                <td>${p.fecha_vencimiento ? new Date(p.fecha_vencimiento).toLocaleDateString() : 'Sin Fecha'}</td>
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
                    productosFiltrados.length ? tabla : '<p>No hay productos en esta categoría en esta página</p>';
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
        
        // Configurar scanner para ventas
        if (inputCodigo) {
            scannerManager.setupScannerInput(inputCodigo, 'sales', (codigo, input) => {
                this.procesarCodigo(codigo);
                input.value = ''; // Limpiar input después del escaneo
            });

            // Mantener compatibilidad con Enter manual
            inputCodigo.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !inputCodigo.dataset.scannerInput) {
                    this.procesarCodigo(inputCodigo.value);
                    inputCodigo.value = '';
                }
            });
        }

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
                toastManager.warning('Producto sin stock disponible');
            }
        } catch (error) {
            console.error('Error al buscar producto:', error);
            toastManager.error('Producto no encontrado');
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
                toastManager.warning('Stock insuficiente');
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
            toastManager.warning('Stock insuficiente');
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
            toastManager.warning('No hay productos en la venta actual');
            return;
        }

        try {
            // Mostrar loading state
            const submitButton = document.getElementById('confirmarVenta');
            const originalText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = '⏳ Procesando...';
            submitButton.style.cursor = 'not-allowed';
            
            const productos = this.ventaActual.map(item => ({
                producto_id: item.id,
                cantidad: item.cantidad
            }));

            // Procesar la venta en el servidor
            await api.post('/ventas', { productos });

            // Actualizar stock local inmediatamente para UX más rápido
            this.ventaActual.forEach(item => {
                const producto = this.productoManager.productos.find(p => p.id === item.id);
                if (producto) {
                    producto.stock_actual = Math.max(0, producto.stock_actual - item.cantidad);
                }
                
                // Si estamos en modo búsqueda, también actualizar el producto filtrado
                if (this.productoManager.modosBusqueda) {
                    const productoFiltrado = this.productoManager.productosFiltrados.find(p => p.id === item.id);
                    if (productoFiltrado) {
                        productoFiltrado.stock_actual = Math.max(0, productoFiltrado.stock_actual - item.cantidad);
                    }
                }
            });

            // Limpiar la venta actual y mostrar mensaje inmediatamente
            this.ventaActual = [];
            this.actualizarTablaVenta();
            toastManager.success('Venta realizada con éxito');

            // Actualizar tablas inmediatamente con los datos locales actualizados
            this.productoManager.actualizarTablas();
            
            // Restaurar botón
            submitButton.disabled = false;
            submitButton.textContent = originalText;
            submitButton.style.cursor = '';
            
        } catch (error) {
            console.error('Error al procesar venta:', error);
            toastManager.error('Error al procesar venta: ' + error.message);
            
            // En caso de error, recargar datos para sincronizar
            this.productoManager.cargarProductos().then(() => {
                this.productoManager.actualizarTablas();
            }).catch(err => {
                console.warn('Error al recargar datos después del error:', err);
            });
            
            // Restaurar botón en caso de error
            const submitButton = document.getElementById('confirmarVenta');
            submitButton.disabled = false;
            submitButton.textContent = 'Confirmar Venta';
            submitButton.style.cursor = '';
        }
    }
}

// Inicialización
const productoManager = new ProductoManager();

// Exponer al ámbito global
window.productoManager = productoManager;
window.ventaManager = productoManager.ventaManager;

// Funciones globales para compatibilidad con HTML onclick
window.limpiarFormularioProducto = () => productoManager.limpiarFormularioProducto();