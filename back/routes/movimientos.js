const express = require("express");
const router = express.Router();
const {
    getMovimientos,
    getMovimientosPorProducto,
    registrarEntrada,
    registrarSalida,
    procesarVenta,
    getStock
} = require("../controllers/movimientos");

// Rutas para movimientos de stock
router.get("/movimientos", getMovimientos);
router.get("/movimientos/producto/:producto_id", getMovimientosPorProducto);
router.get("/stock/:producto_id", getStock);
router.post("/movimientos/entrada", registrarEntrada);
router.post("/movimientos/salida", registrarSalida);
router.post("/ventas", procesarVenta);

module.exports = router;
