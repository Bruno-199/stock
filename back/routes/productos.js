const express = require("express");
const router = express.Router();
const {
    getProductos,
    getProductosPorCategoria,
    getProductoPorId,
    getProductoPorCodigo,
    createProducto,
    updateProducto,
    deleteProducto,
    getProductosStockBajo
} = require("../controllers/productos");

// Rutas para productos
router.get("/productos", getProductos);
router.get("/productos/stock-bajo", getProductosStockBajo);
router.get("/productos/categoria/:categoria", getProductosPorCategoria);
router.get("/productos/codigo/:codigo", getProductoPorCodigo);
router.get("/productos/:id", getProductoPorId);
router.post("/productos", createProducto);
router.put("/productos/:id", updateProducto);
router.delete("/productos/:id", deleteProducto);

module.exports = router;
