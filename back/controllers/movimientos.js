const { conection } = require("../config/db");

// Obtener todos los movimientos de stock
const getMovimientos = (req, res) => {
    const query = `
        SELECT m.id, m.producto_id, m.cantidad, m.fecha,
               p.nombre as producto_nombre, p.codigo,
               c.nombre as categoria
        FROM movimientos_stock m
        JOIN productos p ON m.producto_id = p.id
        LEFT JOIN categorias c ON p.categoria_id = c.id
        ORDER BY m.fecha DESC
    `;
    
    conection.query(query, (err, results) => {
        if (err) {
            console.error("Error al obtener movimientos:", err);
            return res.status(500).json({
                error: "Error en el servidor",
                details: err.message
            });
        }
        res.json(results);
    });
};

// Obtener movimientos por producto
const getMovimientosPorProducto = (req, res) => {
    const { producto_id } = req.params;
    
    const query = `
        SELECT m.id, m.producto_id, m.cantidad, m.fecha,
               p.nombre as producto_nombre, p.codigo,
               c.nombre as categoria
        FROM movimientos_stock m
        JOIN productos p ON m.producto_id = p.id
        LEFT JOIN categorias c ON p.categoria_id = c.id
        WHERE m.producto_id = ?
        ORDER BY m.fecha DESC
    `;
    
    conection.query(query, [producto_id], (err, results) => {
        if (err) {
            console.error("Error al obtener movimientos por producto:", err);
            return res.status(500).json({
                error: "Error en el servidor",
                details: err.message
            });
        }
        res.json(results);
    });
};

// Registrar entrada de stock
const registrarEntrada = (req, res) => {
    const { producto_id, cantidad } = req.body;
    
    if (!producto_id || !cantidad || cantidad <= 0) {
        return res.status(400).json({
            error: "Producto ID y cantidad positiva son obligatorios"
        });
    }
    
    // Verificar que el producto existe
    const checkProductQuery = "SELECT id FROM productos WHERE id = ?";
    
    conection.query(checkProductQuery, [producto_id], (err, results) => {
        if (err) {
            console.error("Error al verificar producto:", err);
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
        
        // Registrar la entrada (cantidad positiva)
        const insertQuery = "INSERT INTO movimientos_stock (producto_id, cantidad) VALUES (?, ?)";
        
        conection.query(insertQuery, [producto_id, Math.abs(cantidad)], (err, results) => {
            if (err) {
                console.error("Error al registrar entrada:", err);
                return res.status(500).json({
                    error: "Error en el servidor",
                    details: err.message
                });
            }
            
            res.status(201).json({
                message: "Entrada de stock registrada exitosamente",
                id: results.insertId
            });
        });
    });
};

// Registrar salida de stock
const registrarSalida = (req, res) => {
    const { producto_id, cantidad } = req.body;
    
    if (!producto_id || !cantidad || cantidad <= 0) {
        return res.status(400).json({
            error: "Producto ID y cantidad positiva son obligatorios"
        });
    }
    
    // Verificar que el producto existe
    const checkProductQuery = "SELECT id FROM productos WHERE id = ?";
    
    conection.query(checkProductQuery, [producto_id], (err, results) => {
        if (err) {
            console.error("Error al verificar producto:", err);
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
        
        // Verificar stock disponible
        const stockQuery = `
            SELECT COALESCE(SUM(cantidad), 0) as stock_actual
            FROM movimientos_stock
            WHERE producto_id = ?
        `;
        
        conection.query(stockQuery, [producto_id], (err, stockResults) => {
            if (err) {
                console.error("Error al verificar stock:", err);
                return res.status(500).json({
                    error: "Error en el servidor",
                    details: err.message
                });
            }
            
            const stockActual = stockResults[0].stock_actual;
            
            if (stockActual < cantidad) {
                return res.status(400).json({
                    error: "Stock insuficiente",
                    stock_actual: stockActual,
                    cantidad_solicitada: cantidad
                });
            }
            
            // Registrar la salida (cantidad negativa)
            const insertQuery = "INSERT INTO movimientos_stock (producto_id, cantidad) VALUES (?, ?)";
            
            conection.query(insertQuery, [producto_id, -Math.abs(cantidad)], (err, results) => {
                if (err) {
                    console.error("Error al registrar salida:", err);
                    return res.status(500).json({
                        error: "Error en el servidor",
                        details: err.message
                    });
                }
                
                res.status(201).json({
                    message: "Salida de stock registrada exitosamente",
                    id: results.insertId
                });
            });
        });
    });
};

// Procesar venta (registrar salidas múltiples)
const procesarVenta = (req, res) => {
    const { productos } = req.body; // Array de { producto_id, cantidad }
    
    if (!productos || !Array.isArray(productos) || productos.length === 0) {
        return res.status(400).json({
            error: "Se requiere un array de productos para la venta"
        });
    }
    
    // Verificar stock disponible para todos los productos
    const verificarStock = async () => {
        for (const item of productos) {
            const { producto_id, cantidad } = item;
            
            if (!producto_id || !cantidad || cantidad <= 0) {
                throw new Error(`Datos inválidos para producto ${producto_id}`);
            }
            
            const stockQuery = `
                SELECT COALESCE(SUM(cantidad), 0) as stock_actual
                FROM movimientos_stock
                WHERE producto_id = ?
            `;
            
            const stockResults = await new Promise((resolve, reject) => {
                conection.query(stockQuery, [producto_id], (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });
            
            const stockActual = stockResults[0].stock_actual;
            
            if (stockActual < cantidad) {
                throw new Error(`Stock insuficiente para producto ${producto_id}. Stock actual: ${stockActual}, solicitado: ${cantidad}`);
            }
        }
    };
    
    verificarStock()
        .then(async () => {
            // Procesar todas las salidas SECUENCIALMENTE para evitar múltiples conexiones
            for (const item of productos) {
                const { producto_id, cantidad } = item;
                await new Promise((resolve, reject) => {
                    const insertQuery = "INSERT INTO movimientos_stock (producto_id, cantidad) VALUES (?, ?)";
                    conection.query(insertQuery, [producto_id, -Math.abs(cantidad)], (err, results) => {
                        if (err) reject(err);
                        else resolve(results);
                    });
                });
            }
        })
        .then(() => {
            res.json({
                message: "Venta procesada exitosamente",
                productos_vendidos: productos.length
            });
        })
        .catch(error => {
            console.error("Error al procesar venta:", error);
            res.status(400).json({
                error: error.message
            });
        });
};

// Obtener stock actual de un producto
const getStock = (req, res) => {
    const { producto_id } = req.params;
    
    const query = `
        SELECT p.id, p.nombre, p.codigo, p.stock_minimo,
               COALESCE(SUM(m.cantidad), 0) as stock_actual
        FROM productos p
        LEFT JOIN movimientos_stock m ON p.id = m.producto_id
        WHERE p.id = ?
        GROUP BY p.id, p.nombre, p.codigo, p.stock_minimo
    `;
    
    conection.query(query, [producto_id], (err, results) => {
        if (err) {
            console.error("Error al obtener stock:", err);
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

module.exports = {
    getMovimientos,
    getMovimientosPorProducto,
    registrarEntrada,
    registrarSalida,
    procesarVenta,
    getStock
};