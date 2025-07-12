# 🚀 Configuración de Railway para Teblo

## 📋 Servicios separados

Vamos a crear **2 servicios separados** en Railway:

### 1. 🔧 Backend Service (teblo-backend)
### 2. 🎨 Frontend Service (teblo-frontend)

---

## 🔧 **PASO 1: Configurar Backend**

### A. Crear servicio backend
1. Ve a Railway → **New Project** → **Deploy from GitHub repo**
2. Selecciona tu repositorio `teblo-app`
3. **Service Name**: `teblo-backend`
4. **Root Directory**: `backend`

### B. Variables de entorno para Backend
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=file:./dev.db

# Puppeteer optimizado para Railway
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# CORS - URL del frontend (se configurará después)
FRONTEND_URL=https://teblo-frontend.railway.app
```

### C. Build Command (si es necesario)
```bash
npm install && npx prisma generate && npm run build
```

### D. Start Command
```bash
npm start
```

---

## 🎨 **PASO 2: Configurar Frontend**

### A. Crear servicio frontend
1. En el mismo proyecto de Railway → **New Service**
2. **Deploy from GitHub repo** → mismo repositorio
3. **Service Name**: `teblo-frontend` 
4. **Root Directory**: `frontend`

### B. Variables de entorno para Frontend
```env
NODE_ENV=production

# URL del backend (usar la URL que te dé Railway para el backend)
VITE_API_URL=https://teblo-backend.railway.app/api
```

### C. Build Command
```bash
npm install && npm run build
```

### D. Start Command (Railway lo detecta automáticamente)
```bash
npm run preview
```

---

## ⚙️ **PASO 3: Variables de entorno importantes**

### Backend necesita:
- `NODE_ENV=production`
- `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true`
- `PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium`
- `FRONTEND_URL=https://teblo-frontend.railway.app`

### Frontend necesita:
- `VITE_API_URL=https://teblo-backend.railway.app/api`

---

## 🔄 **PASO 4: Orden de despliegue**

1. **Primero**: Despliega el **Backend**
2. **Segundo**: Copia la URL del backend
3. **Tercero**: Configura `VITE_API_URL` en el frontend
4. **Cuarto**: Despliega el **Frontend**
5. **Quinto**: Actualiza `FRONTEND_URL` en el backend

---

## ✅ **URLs finales**

- **Backend API**: `https://teblo-backend.railway.app`
- **Frontend App**: `https://teblo-frontend.railway.app`

---

## 🐛 **Solución de problemas**

### Si el backend falla:
- Verificar variables de entorno
- Revisar logs de Puppeteer
- Asegurar que Chromium está instalado

### Si el frontend no conecta:
- Verificar `VITE_API_URL`
- Revisar CORS en backend
- Verificar que backend esté corriendo

### Si los PDFs fallan:
- Verificar variables de Puppeteer
- Revisar que Chromium esté disponible

---

## 🎯 **¡Listo para desplegar!**

Los archivos están configurados para servicios separados.
Sigue los pasos en orden y debería funcionar perfectamente. 