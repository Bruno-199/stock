const { conection } = require("../config/db");

// Obtener todos los productos con información de categoría
const getProductos = (req, res) => {
    const query = `
        SELECT p.id, p.nombre, p.codigo, p.precio, p.detalle, p.stock_minimo, p.fecha_vencimiento,
               c.nombre as categoria, p.categoria_id,
               COALESCE(SUM(m.cantidad), 0) as stock_actual
        FROM productos p
        LEFT JOIN categorias c ON p.categoria_id = c.id
        LEFT JOIN movimientos_stock m ON p.id = m.producto_id
        GROUP BY p.id, p.nombre, p.codigo, p.precio, p.detalle, p.stock_minimo, p.fecha_vencimiento, c.nombre, p.categoria_id
        ORDER BY c.nombre, p.nombre
    `;
    
    conection.query(query, (err, results) => {
        if (err) {
            console.error("Error al obtener productos:", err);
            return res.status(500).json({
                error: "Error en el servidor",
                details: err.message
            });
        }
        res.json(results);
    });
};

// Obtener productos por categoría
const getProductosPorCategoria = (req, res) => {
    const { categoria } = req.params;
    
    const query = `
        SELECT p.id, p.nombre, p.codigo, p.precio, p.detalle, p.stock_minimo, p.fecha_vencimiento,
               c.nombre as categoria, p.categoria_id,
               COALESCE(SUM(m.cantidad), 0) as stock_actual
        FROM productos p
        LEFT JOIN categorias c ON p.categoria_id = c.id
        LEFT JOIN movimientos_stock m ON p.id = m.producto_id
        WHERE c.nombre = ?
        GROUP BY p.id, p.nombre, p.codigo, p.precio, p.detalle, p.stock_minimo, p.fecha_vencimiento, c.nombre, p.categoria_id
        ORDER BY p.nombre
    `;
    
    conection.query(query, [categoria], (err, results) => {
        if (err) {
            console.error("Error al obtener productos por categoría:", err);
            return res.status(500).json({
                error: "Error en el servidor",
                details: err.message
            });
        }
        res.json(results);
    });
};

// Obtener producto por ID
const getProductoPorId = (req, res) => {
    const { id } = req.params;
    
    const query = `
        SELECT p.id, p.nombre, p.codigo, p.precio, p.detalle, p.stock_minimo, p.fecha_vencimiento,
               c.nombre as categoria, p.categoria_id,
               COALESCE(SUM(m.cantidad), 0) as stock_actual
        FROM productos p
        LEFT JOIN categorias c ON p.categoria_id = c.id
        LEFT JOIN movimientos_stock m ON p.id = m.producto_id
        WHERE p.id = ?
        GROUP BY p.id, p.nombre, p.codigo, p.precio, p.detalle, p.stock_minimo, p.fecha_vencimiento, c.nombre, p.categoria_id
    `;
    
    conection.query(query, [id], (err, results) => {
        if (err) {
            console.error("Error al obtener producto:", err);
            return res.status(500).json({
                error: "Error en el servidor",
                details: err.message
            });
        }
        
        if (results.length === 0) {
            return res.status(404).json({
                error: "Producto no encontrado"
            });
        }
        
        res.json(results[0]);
    });
};

// Buscar producto por código
const getProductoPorCodigo = (req, res) => {
    const { codigo } = req.params;
    
    const query = `
        SELECT p.id, p.nombre, p.codigo, p.precio, p.detalle, p.stock_minimo, p.fecha_vencimiento,
               c.nombre as categoria, p.categoria_id,
               COALESCE(SUM(m.cantidad), 0) as stock_actual
        FROM productos p
        LEFT JOIN categorias c ON p.categoria_id = c.id
        LEFT JOIN movimientos_stock m ON p.id = m.producto_id
        WHERE p.codigo = ?
        GROUP BY p.id, p.nombre, p.codigo, p.precio, p.detalle, p.stock_minimo, p.fecha_vencimiento, c.nombre, p.categoria_id
    `;
    
    conection.query(query, [codigo], (err, results) => {
        if (err) {
            console.error("Error al buscar producto por código:", err);
            return res.status(500).json({
                error: "Error en el servidor",
                details: err.message
            });
        }
        
        if (results.length === 0) {
            return res.status(404).json({
                error: "Producto no encontrado"
            });
        }
        
        res.json(results[0]);
    });
};

// Crear nuevo producto
const createProducto = (req, res) => {
    const { nombre, codigo, categoria_id, precio, detalle, stock_minimo, fecha_vencimiento } = req.body;
    
    // Validaciones
    if (!nombre || !precio || !categoria_id) {
        return res.status(400).json({
            error: "Nombre, precio y categoría son obligatorios"
        });
    }
    
    const query = "INSERT INTO productos (nombre, codigo, categoria_id, precio, detalle, stock_minimo, fecha_vencimiento) VALUES (?, ?, ?, ?, ?, ?, ?)";
    
    conection.query(query, [nombre, codigo, categoria_id, precio, detalle || '', stock_minimo || 0, fecha_vencimiento || null], (err, results) => {
        if (err) {
            console.error("Error al crear producto:", err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({
                    error: "Ya existe un producto con ese código"
                });
            }
            return res.status(500).json({
                error: "Error en el servidor",
                details: err.message
            });
        }
        
        res.status(201).json({
            message: "Producto creado exitosamente",
            id: results.insertId
        });
    });
};

// Actualizar producto
const updateProducto = (req, res) => {
    const { id } = req.params;
    const { nombre, codigo, categoria_id, precio, detalle, stock_minimo, fecha_vencimiento } = req.body;
    
    // Validaciones
    if (!nombre || !precio || !categoria_id) {
        return res.status(400).json({
            error: "Nombre, precio y categoría son obligatorios"
        });
    }
    
    const query = "UPDATE productos SET nombre = ?, codigo = ?, categoria_id = ?, precio = ?, detalle = ?, stock_minimo = ?, fecha_vencimiento = ? WHERE id = ?";
    
    conection.query(query, [nombre, codigo, categoria_id, precio, detalle || '', stock_minimo || 0, fecha_vencimiento || null, id], (err, results) => {
        if (err) {
            console.error("Error al actualizar producto:", err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({
                    error: "Ya existe un producto con ese código"
                });
            }
            return res.status(500).json({
                error: "Error en el servidor",
                details: err.message
            });
        }
        
        if (results.affectedRows === 0) {
            return res.status(404).json({
                error: "Producto no encontrado"
            });
        }
        
        res.json({
            message: "Producto actualizado exitosamente"
        });
    });
};

// Eliminar producto
const deleteProducto = (req, res) => {
    const { id } = req.params;
    
    // Primero eliminar los movimientos de stock asociados
    const deleteMovimientosQuery = "DELETE FROM movimientos_stock WHERE producto_id = ?";
    
    conection.query(deleteMovimientosQuery, [id], (err, movimientosResults) => {
        if (err) {
            console.error("Error al eliminar movimientos de stock:", err);
            return res.status(500).json({
                error: "Error en el servidor",
                details: err.message
            });
        }
        
        // Luego eliminar el producto
        const deleteProductoQuery = "DELETE FROM productos WHERE id = ?";
        
        conection.query(deleteProductoQuery, [id], (err, productoResults) => {
            if (err) {
                console.error("Error al eliminar producto:", err);
                return res.status(500).json({
                    error: "Error en el servidor",
                    details: err.message
                });
            }
            
            if (productoResults.affectedRows === 0) {
                return res.status(404).json({
                    error: "Producto no encontrado"
                });
            }
            
            res.json({
                message: "Producto eliminado exitosamente",
                movimientos_eliminados: movimientosResults.affectedRows
            });
        });
    });
};

// Obtener productos con stock bajo
const getProductosStockBajo = (req, res) => {
    const query = `
        SELECT p.id, p.nombre, p.codigo, p.precio, p.detalle, p.stock_minimo,
               c.nombre as categoria, p.categoria_id,
               COALESCE(SUM(m.cantidad), 0) as stock_actual
        FROM productos p
        LEFT JOIN categorias c ON p.categoria_id = c.id
        LEFT JOIN movimientos_stock m ON p.id = m.producto_id
        GROUP BY p.id, p.nombre, p.codigo, p.precio, p.detalle, p.stock_minimo, c.nombre, p.categoria_id
        HAVING stock_actual <= p.stock_minimo
        ORDER BY c.nombre, p.nombre
    `;
    
    conection.query(query, (err, results) => {
        if (err) {
            console.error("Error al obtener productos con stock bajo:", err);
            return res.status(500).json({
                error: "Error en el servidor",
                details: err.message
            });
        }
        res.json(results);
    });
};

module.exports = {
    getProductos,
    getProductosPorCategoria,
    getProductoPorId,
    getProductoPorCodigo,
    createProducto,
    updateProducto,
    deleteProducto,
    getProductosStockBajo
};