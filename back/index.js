// Cargar variables de entorno al inicio
require('dotenv').config();

const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const { conection } = require("./config/db");

// Importación de rutas del sistema de stock
const categoriasRoutes = require("./routes/categorias");
const productosRoutes = require("./routes/productos");
const movimientosRoutes = require("./routes/movimientos");

// Inicialización de la app
const app = express();
const port = process.env.PORT || 8000;

// Middlewares
app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'https://*.onrender.com', '*'],
  credentials: true
}));

// Middleware para servir archivos estáticos del frontend
app.use(express.static('public'));

// Endpoint para mantener el servicio activo (anti-sleep)
app.get("/ping", (req, res) => {
  res.status(200).json({ 
    status: "alive", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Rutas principales
app.get("/", (req, res) => {
  res.send({ 
    message: "🏪 API del Sistema de Stock", 
    version: "1.0.0",
    status: "running",
    endpoints: {
      ping: "/ping",
      categorias: "/api/categorias",
      productos: "/api/productos", 
      movimientos: "/api/movimientos",
      ventas: "/api/ventas"
    }
  });
});

// Rutas del sistema de stock
app.use("/api", categoriasRoutes);
app.use("/api", productosRoutes);
app.use("/api", movimientosRoutes);

// Conexión a la base de datos
conection.query('SELECT 1', (err) => {
  if (err) {
    console.error("❌ Error al conectar a la base de datos:", err);
    return;
  }
  console.log("✅ Conectado exitosamente a la base de datos");
});

// Sistema de auto-ping interno para evitar que Render congele el servicio
const selfPing = () => {
  // Solo hacer auto-ping en producción (Render)
  if (process.env.NODE_ENV === 'production' && process.env.RENDER_EXTERNAL_URL) {
    const pingUrl = `${process.env.RENDER_EXTERNAL_URL}/ping`;
    
    fetch(pingUrl)
      .then(response => response.json())
      .then(data => {
        console.log(`💓 Auto-ping exitoso: ${data.timestamp}`);
      })
      .catch(error => {
        console.warn(`⚠️ Error en auto-ping: ${error.message}`);
      });
  }
};

// Iniciar servidor
app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${port}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📍 URL: ${process.env.RENDER_EXTERNAL_URL || `http://localhost:${port}`}`);
  
  // Configurar auto-ping en producción
  if (process.env.NODE_ENV === 'production') {
    console.log('🔄 Iniciando sistema de auto-ping cada 10 minutos...');
    // Auto-ping cada 10 minutos (600000 ms)
    setInterval(selfPing, 600000);
    // Primer auto-ping después de 2 minutos
    setTimeout(selfPing, 120000);
  }
});

// Manejo de errores
process.on("unhandledRejection", (err) => {
  console.log("❌ Error no manejado:", err);
  process.exit(1);
});

// Manejo de cierre graceful para Render
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM recibido, cerrando servidor...');
  process.exit(0);
});
