# 🚀 CONFIGURACIÓN EN RENDER CON CLEVER CLOUD MYSQL

## ✅ Tu situación actual:
- ✅ MySQL funcionando en Clever Cloud (GRATIS)
- ✅ Base de datos con datos de ejemplo
- ✅ Credenciales ya conocidas y funcionando

## 📋 VARIABLES PARA RENDER DASHBOARD

Cuando crees el Web Service en Render, configura estas **5 variables de entorno**:

### 🔧 Environment Variables:

```bash
NODE_ENV=production
PORT=10000

DATABASE_HOST=bmxmxtdp6u4aorkf4h9y-mysql.services.clever-cloud.com
DATABASE_PORT=3306
DATABASE_USER=udw12ldxhzrkmvz5
DATABASE_PASSWORD=mh2lXow9rpQ2VavbhMul
DATABASE_NAME=bmxmxtdp6u4aorkf4h9y
```

### 🎯 CORS (después del deploy del frontend):
```bash
CORS_ORIGIN=https://tu-frontend.onrender.com
```

## 🚀 PASOS EXACTOS:

### 1. **Subir a GitHub**
```bash
git init
git add .
git commit -m "Sistema Stock con Clever Cloud MySQL"
git remote add origin https://github.com/TU-USUARIO/sistema-stock.git
git push -u origin main
```

### 2. **Crear Web Service en Render**
1. Ir a [render.com](https://render.com) → Login con GitHub
2. **New → Web Service**
3. **Connect GitHub repo** → Seleccionar tu repositorio
4. **Configuración básica:**
   ```
   Name: stock-api
   Root Directory: back
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```

### 3. **Configurar Variables de Entorno**
En la sección **Environment Variables**, agregar una por una:
- `NODE_ENV` = `production`
- `DATABASE_HOST` = `bmxmxtdp6u4aorkf4h9y-mysql.services.clever-cloud.com`
- `DATABASE_PORT` = `3306`
- `DATABASE_USER` = `udw12ldxhzrkmvz5`
- `DATABASE_PASSWORD` = `mh2lXow9rpQ2VavbhMul`
- `DATABASE_NAME` = `bmxmxtdp6u4aorkf4h9y`

### 4. **Deploy**
- Click **Create Web Service**
- Render empezará el build automáticamente
- En 3-5 minutos tendrás tu API funcionando

### 5. **Verificar funcionamiento**
- URL: `https://tu-app.onrender.com`
- Ping: `https://tu-app.onrender.com/ping`
- API: `https://tu-app.onrender.com/api/productos`

## 💡 **VENTAJAS de usar tu Clever Cloud MySQL:**

✅ **Ya está configurado** - No necesitas crear nueva BD  
✅ **Datos incluidos** - Categorías y productos de ejemplo  
✅ **Gratis para siempre** - Plan gratuito de Clever Cloud  
✅ **Sin migración** - Todo sigue funcionando igual  
✅ **Probado** - Ya sabes que funciona correctamente  

## 🔍 **Si hay problemas:**

### Logs en Render:
1. Ir a tu servicio en Render Dashboard
2. Tab **Logs** para ver errores
3. Buscar mensajes de conexión a BD

### Variables mal configuradas:
```
❌ Error: Variables de entorno requeridas para producción: DATABASE_HOST
```
**Solución:** Verificar que todas las variables estén en Render

### Error de conexión:
```  
❌ Error al conectar a la base de datos: connect ETIMEDOUT
```
**Solución:** Verificar credenciales de Clever Cloud

## 🎯 **Resultado final:**

- **Backend API:** `https://stock-api.onrender.com`
- **Base de datos:** Tu MySQL de Clever Cloud (funcionando)
- **Ping automático:** Evita que se congele
- **Costo:** $0 USD/mes

¡Tu sistema estará 100% funcional usando tu base de datos existente! 🎉
