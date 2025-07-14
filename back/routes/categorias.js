const express = require("express");
const router = express.Router();
const {
    getCategorias,
    createCategoria,
    updateCategoria,
    deleteCategoria
} = require("../controllers/categorias");

// Rutas para categorías
router.get("/categorias", getCategorias);
router.post("/categorias", createCategoria);
router.put("/categorias/:id", updateCategoria);
router.delete("/categorias/:id", deleteCategoria);

module.exports = router;
