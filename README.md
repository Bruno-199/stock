# 🏪 Sistema de Stock - Kiosco

Sistema completo de control de stock con backend API REST y frontend web. **Optimizado para Render con ping automático anti-congelamiento.**

## 🚀 Deploy en Render (GRATIS)

### URLs del proyecto:
- **Backend API:** `https://tu-stock-api.onrender.com`
- **Frontend:** `https://tu-stock-frontend.onrender.com`
- **Ping endpoint:** `https://tu-stock-api.onrender.com/ping`

## ⚡ Características Anti-Congelamiento

✅ **Ping automático cada 5 minutos**  
✅ **Endpoint `/ping` optimizado**  
✅ **Mantiene el servicio siempre activo**  
✅ **Logs de monitoreo en consola**  

## 🛠️ Tecnologías

**Backend:**
- Node.js + Express
- MySQL/PostgreSQL (compatible con ambos)
- CORS configurado para Render
- Sistema anti-sleep integrado

**Frontend:**
- HTML5, CSS3, JavaScript
- Responsive design
- Scanner de códigos
- Ping automático incorporado

## 📋 Funcionalidades

- ✅ Control de stock en tiempo real
- ✅ Gestión de categorías y productos  
- ✅ Sistema de ventas con scanner
- ✅ Alertas de stock mínimo
- ✅ Histórico completo de movimientos
- ✅ **Servicio siempre activo** (no se congela)

## 🔧 Configuración Local

```bash
# Backend
cd back
npm install
npm start

# Frontend  
# Abrir "Sistema de Stock/index.html" en el navegador
```

## 🌍 Variables de Entorno

Render configurará automáticamente:
- `NODE_ENV=production`
- `PORT=10000`
- `DATABASE_*` (para PostgreSQL)

## 📱 Uso del Sistema

1. **Agregar productos:** Formulario con categorías dinámicas
2. **Control de stock:** Vista en tiempo real por categorías
3. **Realizar ventas:** Scanner de códigos automático  
4. **Gestión:** Edición y actualización de productos

## 🔒 Optimizaciones de Producción

- Conexión a BD con pool y reconexión automática
- Manejo robusto de errores
- CORS configurado para Render
- Logs mejorados para debugging
- Sistema de ping para mantener servicio activo

## 📊 Monitoreo

El sistema incluye monitoreo automático:
- Ping cada 5 minutos para evitar sleep
- Logs en consola del navegador
- Health check endpoint en `/ping`
- Métricas de uptime en Render Dashboard

---

**🎯 Resultado:** Sistema de stock profesional disponible 24/7 en la nube, completamente gratis y sin interrupciones.

Para deploy completo, consultar: `RENDER-DEPLOY.md`
