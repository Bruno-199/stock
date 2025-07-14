# 🚀 DEPLOY SIMPLE - UNA SOLA BASE DE DATOS

## ✅ **CONFIGURACIÓN ACTUAL:**

Tu archivo `.env` está configurado para usar **Clever Cloud MySQL** tanto en desarrollo como en producción.

## 🔧 **PARA RENDER (PRODUCCIÓN):**

En Render Dashboard, configurar **exactamente estas 7 variables**:

```
NODE_ENV=production
PORT=10000
DATABASE_HOST=bmxmxtdp6u4aorkf4h9y-mysql.services.clever-cloud.com
DATABASE_PORT=3306
DATABASE_USER=udw12ldxhzrkmvz5
DATABASE_PASSWORD=mh2lXow9rpQ2VavbhMul
DATABASE_NAME=bmxmxtdp6u4aorkf4h9y
```

## 📋 **PASOS:**

### 1. Subir a GitHub
```bash
git init
git add .
git commit -m "Sistema Stock"
git remote add origin https://github.com/TU-USUARIO/sistema-stock.git
git push -u origin main
```

### 2. Crear Web Service en Render
- Ir a [render.com](https://render.com)
- New → Web Service → Connect GitHub
- Root Directory: `back`
- Start Command: `npm start`

### 3. Configurar variables
Copiar las 6 variables de arriba en Environment Variables

### 4. Deploy
Click "Create Web Service" ¡y listo!

## 🎯 **RESULTADO:**
- **Desarrollo:** Usa Clever Cloud MySQL (datos reales para pruebas)
- **Producción:** Usa la misma Clever Cloud MySQL
- **Una sola BD** para todo - más simple y consistente

¡Simple y directo! 🚀
