# Sistema de Stock - Backend + Frontend

Este es un sistema completo de control de stock para kiosco con backend API REST y frontend web.

## Configuración

### 1. Instalar dependencias del backend
```bash
cd back
npm install
```

### 2. Configurar base de datos
Asegúrate de tener MySQL instalado y ejecutándose con:
- Usuario: `root`
- Contraseña: `1234`
- Base de datos: `stock`

Si necesitas cambiar estos valores, edita el archivo `config/db.js`.

### 3. Insertar datos de ejemplo (opcional)
Ejecuta el archivo `datos_ejemplo.sql` en MySQL Workbench o tu cliente MySQL para tener datos de prueba.

### 4. Ejecutar el backend
```bash
cd back
npm start
# o para desarrollo
npm run dev
```

El servidor se ejecutará en `http://localhost:8000`

### 5. Abrir el frontend
Abre el archivo `Sistema de Stock/index.html` en tu navegador web.

## Funcionalidades

### Backend API
- **Categorías**: CRUD completo
- **Productos**: CRUD con validación y cálculo de stock
- **Movimientos**: Entradas, salidas y procesamiento de ventas
- **Validaciones**: Stock disponible, datos requeridos

### Frontend
- **Agregar Productos**: Formulario completo con categorías dinámicas
- **Control de Stock**: Visualización por categorías con stock en tiempo real
- **Realizar Ventas**: Scanner de códigos y procesamiento automático
- **Editar Productos**: Modal de edición con actualización de stock

## Endpoints principales

- `GET /api/categorias` - Obtener categorías
- `GET /api/productos` - Obtener productos con stock
- `GET /api/productos/codigo/:codigo` - Buscar producto por código
- `POST /api/productos` - Crear producto
- `POST /api/movimientos/entrada` - Registrar entrada de stock
- `POST /api/movimientos/salida` - Registrar salida de stock
- `POST /api/ventas` - Procesar venta

## Uso del sistema

1. **Agregar productos**: Usar el formulario en la sección "Agregar Productos"
2. **Ver stock**: Consultar la sección "Control de Stock"
3. **Realizar ventas**: Usar el scanner en "Realizar Ventas"
   - Ingresa el código del producto (1-8 para los productos de ejemplo)
   - Presiona Enter para agregarlo a la venta
   - Ajusta cantidades si es necesario
   - Confirma la venta

## Notas importantes

- El frontend se conecta automáticamente al backend en `http://localhost:8000`
- El stock se actualiza en tiempo real después de cada operación
- Los códigos de productos son únicos y se generan automáticamente
- El sistema valida el stock disponible antes de procesar ventas

## Estructura de la Base de Datos

### Tabla `categorias`
- `id` (INT, AUTO_INCREMENT, PRIMARY KEY)
- `nombre` (VARCHAR(50), UNIQUE, NOT NULL)

### Tabla `productos`
- `id` (INT, AUTO_INCREMENT, PRIMARY KEY)
- `nombre` (VARCHAR(100), NOT NULL)
- `codigo` (VARCHAR(50), UNIQUE)
- `categoria_id` (INT, FOREIGN KEY)
- `precio` (DECIMAL(10,2), NOT NULL)
- `detalle` (TEXT)
- `stock_minimo` (INT, DEFAULT 0)

### Tabla `movimientos_stock`
- `id` (INT, AUTO_INCREMENT, PRIMARY KEY)
- `producto_id` (INT, NOT NULL, FOREIGN KEY)
- `cantidad` (INT, NOT NULL) - Positivo para entradas, negativo para salidas
- `fecha` (DATETIME, DEFAULT CURRENT_TIMESTAMP)

## Endpoints de la API

### Categorías

- `GET /api/categorias` - Obtener todas las categorías
- `POST /api/categorias` - Crear nueva categoría
- `PUT /api/categorias/:id` - Actualizar categoría
- `DELETE /api/categorias/:id` - Eliminar categoría

### Productos

- `GET /api/productos` - Obtener todos los productos con stock
- `GET /api/productos/:id` - Obtener producto por ID
- `GET /api/productos/codigo/:codigo` - Obtener producto por código
- `GET /api/productos/categoria/:categoria` - Obtener productos por categoría
- `GET /api/productos/stock-bajo` - Obtener productos con stock bajo
- `POST /api/productos` - Crear nuevo producto
- `PUT /api/productos/:id` - Actualizar producto
- `DELETE /api/productos/:id` - Eliminar producto

### Movimientos de Stock

- `GET /api/movimientos` - Obtener todos los movimientos
- `GET /api/movimientos/producto/:producto_id` - Obtener movimientos por producto
- `GET /api/stock/:producto_id` - Obtener stock actual de un producto
- `POST /api/movimientos/entrada` - Registrar entrada de stock
- `POST /api/movimientos/salida` - Registrar salida de stock
- `POST /api/ventas` - Procesar venta (múltiples salidas)

## Ejemplos de Uso

### Crear producto
```json
POST /api/productos
{
  "nombre": "Pepsi Cola",
  "codigo": "9",
  "categoria_id": 1,
  "precio": 800.00,
  "detalle": "Gaseosa 500ml",
  "stock_minimo": 5
}
```

### Registrar entrada de stock
```json
POST /api/movimientos/entrada
{
  "producto_id": 1,
  "cantidad": 20
}
```

### Procesar venta
```json
POST /api/ventas
{
  "productos": [
    {
      "producto_id": 1,
      "cantidad": 2
    },
    {
      "producto_id": 3,
      "cantidad": 1
    }
  ]
}
```

## Características

- **Control de Stock**: Sistema de entradas y salidas con seguimiento en tiempo real
- **Validaciones**: Verificación de stock disponible antes de procesar ventas
- **Categorización**: Organización de productos por categorías
- **Stock Mínimo**: Alertas para productos con stock bajo
- **Histórico**: Registro completo de todos los movimientos de stock
- **Códigos**: Soporte para códigos de producto únicos (ideal para escáneres)

## Notas

- El stock actual se calcula dinámicamente sumando todos los movimientos (entradas positivas + salidas negativas)
- Las salidas de stock se registran con cantidad negativa
- El sistema verifica automáticamente el stock disponible antes de procesar ventas
- Se incluyen datos de ejemplo para facilitar las pruebas
