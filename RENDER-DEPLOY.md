# 🚀 GUÍA COMPLETA: DEPLOY EN RENDER

## ✨ ¿Por qué Render?

✅ **100% GRATIS** para proyectos pequeños  
✅ **PostgreSQL incluida** sin configuración  
✅ **Deploy automático** desde GitHub  
✅ **HTTPS automático**  
✅ **Sin configuración compleja**  
✅ **Ping automático** para evitar que se congele  

## 📋 PASOS PARA SUBIR A RENDER

### 🔧 1. Subir a GitHub

```bash
cd "c:\Users\BRUNO\Desktop\Sistema-Stock-Front"
git init
git add .
git commit -m "Sistema de Stock para Render"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/sistema-stock.git
git push -u origin main
```

### 🌐 2. Deploy Backend en Render

1. **Ir a [render.com](https://render.com)**
2. **Sign up/Login** con GitHub
3. **New → Web Service**
4. **Connect GitHub repo** → Seleccionar tu repositorio
5. **Configuración:**
   ```
   Name: stock-api
   Root Directory: back
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```

6. **Variables de entorno automáticas:**
   - Render configurará automáticamente `PORT` y `NODE_ENV=production`

7. **Base de datos MySQL (YA CONFIGURADA):**
   - ✅ **Tu proyecto ya usa MySQL de Clever Cloud (GRATIS)**
   - ✅ **No necesitas crear nada más**
   - ✅ **Ya tiene datos de ejemplo incluidos**
   - ✅ **Conexión automática configurada**

### 🎨 3. Deploy Frontend (Render Static Site)

1. **New → Static Site**
2. **Connect mismo repo de GitHub**
3. **Configuración:**
   ```
   Name: stock-frontend
   Root Directory: Sistema de Stock
   Build Command: echo "No build needed"
   Publish Directory: Sistema de Stock
   ```

### ⚙️ 4. Configurar URLs

1. **Copiar URL del backend** (ej: `https://stock-api.onrender.com`)
2. **Actualizar frontend:**
   - Editar `Sistema de Stock/script.js` línea 7:
   ```javascript
   return 'https://TU-BACKEND-URL.onrender.com/api';
   ```

## 🔄 SISTEMA ANTI-CONGELAMIENTO

### 💓 Ping Automático Configurado

El sistema ya está configurado para hacer ping cada 5 minutos:

- ✅ **Ping cada 5 minutos** automático
- ✅ **Endpoint `/ping`** en el backend  
- ✅ **Solo en producción** (no en desarrollo)
- ✅ **Logs en consola** para monitoreo

### 📊 Cómo funciona:

```javascript
// En script.js - líneas 22-35
setInterval(keepAlive, 300000); // Cada 5 minutos
```

## 🆓 ALTERNATIVA: UNA SOLA APP (TODO EN RENDER)

Si prefieres todo en un solo servicio:

1. **Copiar frontend al backend:**
   ```bash
   mkdir back/public
   copy "Sistema de Stock/*" back/public/
   ```

2. **En index.js ya está configurado:**
   ```javascript
   app.use(express.static('public'));
   ```

3. **Deploy solo el backend** y tendrás todo en una URL

## 💰 COSTOS Y LÍMITES (100% GRATIS)

- **Render Web Service:** 750 horas/mes (suficiente para 1 app)
- **MySQL Clever Cloud:** GRATIS incluido (ya configurado)
- **Static Sites:** Ilimitados
- **Ancho de banda:** 100GB/mes
- **Build time:** 500 minutos/mes

## ⚡ OPTIMIZACIONES INCLUIDAS

✅ **Conexión a BD optimizada** con pool y reconexión  
✅ **CORS configurado** para Render  
✅ **Variables de entorno** automáticas  
✅ **Manejo de errores** robusto  
✅ **Logs mejorados** para debugging  
✅ **Ping automático** anti-sleep  

## 🔍 MONITOREO

### En Render Dashboard:
- **Logs en tiempo real**
- **Métricas de CPU/memoria**  
- **Status del servicio**
- **URLs de acceso**

### En el navegador:
- **Consola del frontend** mostrará pings exitosos
- **Network tab** para ver requests a la API

## 🚨 TROUBLESHOOTING

### ❌ Error "Service Unavailable":
1. Verificar que el backend esté corriendo
2. Revisar logs en Render Dashboard
3. Comprobar variables de entorno

### ❌ Error CORS:
1. Verificar URL en `script.js`
2. Comprobar configuración CORS en `index.js`

### ❌ Error de Base de Datos:
1. Tu MySQL ya está configurado y funcionando
2. Si hay problemas, verificar logs en Render
3. La conexión a Clever Cloud MySQL es automática

## 🎯 URLs FINALES

Después del deploy tendrás:
- **API:** `https://stock-api.onrender.com`
- **Frontend:** `https://stock-frontend.onrender.com`
- **Ping:** `https://stock-api.onrender.com/ping`

---

## 🏁 RESULTADO

¡Tu sistema de stock estará disponible 24/7 en la nube completamente gratis y SIN CONGELARSE! 🎉

El ping automático mantendrá el servicio siempre activo para tus usuarios.
