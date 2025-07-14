const { conection } = require("../config/db");

// Obtener todas las categorías
const getCategorias = (req, res) => {
    const query = "SELECT * FROM categorias ORDER BY nombre";
    
    conection.query(query, (err, results) => {
        if (err) {
            console.error("Error al obtener categorías:", err);
            return res.status(500).json({
                error: "Error en el servidor",
                details: err.message
            });
        }
        res.json(results);
    });
};

// Crear nueva categoría
const createCategoria = (req, res) => {
    const { nombre } = req.body;
    
    if (!nombre) {
        return res.status(400).json({
            error: "El nombre de la categoría es obligatorio"
        });
    }
    
    const query = "INSERT INTO categorias (nombre) VALUES (?)";
    
    conection.query(query, [nombre], (err, results) => {
        if (err) {
            console.error("Error al crear categoría:", err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({
                    error: "Ya existe una categoría con ese nombre"
                });
            }
            return res.status(500).json({
                error: "Error en el servidor",
                details: err.message
            });
        }
        
        res.status(201).json({
            message: "Categoría creada exitosamente",
            id: results.insertId
        });
    });
};

// Actualizar categoría
const updateCategoria = (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;
    
    if (!nombre) {
        return res.status(400).json({
            error: "El nombre de la categoría es obligatorio"
        });
    }
    
    const query = "UPDATE categorias SET nombre = ? WHERE id = ?";
    
    conection.query(query, [nombre, id], (err, results) => {
        if (err) {
            console.error("Error al actualizar categoría:", err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({
                    error: "Ya existe una categoría con ese nombre"
                });
            }
            return res.status(500).json({
                error: "Error en el servidor",
                details: err.message
            });
        }
        
        if (results.affectedRows === 0) {
            return res.status(404).json({
                error: "Categoría no encontrada"
            });
        }
        
        res.json({
            message: "Categoría actualizada exitosamente"
        });
    });
};

// Eliminar categoría
const deleteCategoria = (req, res) => {
    const { id } = req.params;
    
    const query = "DELETE FROM categorias WHERE id = ?";
    
    conection.query(query, [id], (err, results) => {
        if (err) {
            console.error("Error al eliminar categoría:", err);
            return res.status(500).json({
                error: "Error en el servidor",
                details: err.message
            });
        }
        
        if (results.affectedRows === 0) {
            return res.status(404).json({
                error: "Categoría no encontrada"
            });
        }
        
        res.json({
            message: "Categoría eliminada exitosamente"
        });
    });
};

module.exports = {
    getCategorias,
    createCategoria,
    updateCategoria,
    deleteCategoria
};
