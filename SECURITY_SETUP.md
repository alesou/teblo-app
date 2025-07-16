# 🔐 Configuración de Seguridad - Teblo App

## ✅ Mejoras de Seguridad Implementadas

### 1. **Variables de Entorno**
- ✅ Credenciales de Firebase movidas a variables de entorno
- ✅ Validación de variables críticas en desarrollo
- ✅ Archivo de ejemplo creado (`frontend/env.example`)

### 2. **Rate Limiting**
- ✅ Implementado `express-rate-limit`
- ✅ Límites configurados por tipo de endpoint
- ✅ Protección contra ataques de fuerza bruta

### 3. **Headers de Seguridad**
- ✅ Implementado `helmet`
- ✅ CSP (Content Security Policy) configurado
- ✅ HSTS (HTTP Strict Transport Security) habilitado
- ✅ Headers de seguridad adicionales

### 4. **Logging Seguro**
- ✅ Logger centralizado que oculta información sensible
- ✅ Logs de debug solo en desarrollo
- ✅ Redacción automática de tokens y credenciales

## 📋 Configuración Requerida

### Frontend (.env)
Crea un archivo `.env` en el directorio `frontend/` con las siguientes variables:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=tu_api_key_de_firebase
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
VITE_FIREBASE_MEASUREMENT_ID=tu_measurement_id

# Google OAuth
VITE_GOOGLE_CLIENT_ID=tu_google_client_id

# API Configuration
VITE_API_URL=http://localhost:3001
```

### Backend (.env)
Crea un archivo `.env` en el directorio `backend/` con las siguientes variables:

```bash
# Database
DATABASE_URL=tu_url_de_postgresql

# Firebase Admin
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}

# Environment
NODE_ENV=production

# Frontend URL (for CORS)
FRONTEND_URL=https://tu-dominio.com
```

## 🚀 Pasos para Desplegar

### 1. Configurar Variables de Entorno
```bash
# Frontend
cd frontend
cp env.example .env
# Editar .env con tus credenciales

# Backend
cd ../backend
cp .env.example .env
# Editar .env con tus credenciales
```

### 2. Verificar Configuración
```bash
# Frontend
npm run dev
# Deberías ver mensajes de validación de variables

# Backend
npm run dev
# Deberías ver logs de inicio sin errores
```

### 3. Probar Seguridad
```bash
# Verificar rate limiting
curl -X GET http://localhost:3001/api/clients
# Deberías recibir respuesta normal

# Verificar headers de seguridad
curl -I http://localhost:3001/
# Deberías ver headers como X-Frame-Options, X-Content-Type-Options, etc.
```

## 🔍 Verificaciones de Seguridad

### Rate Limiting
- ✅ Máximo 100 requests por 15 minutos por IP
- ✅ Máximo 5 intentos de auth por 15 minutos
- ✅ Máximo 50 creaciones/ediciones por 15 minutos
- ✅ Máximo 200 búsquedas por 15 minutos

### Headers de Seguridad
- ✅ `X-Frame-Options: DENY`
- ✅ `X-Content-Type-Options: nosniff`
- ✅ `X-XSS-Protection: 1; mode=block`
- ✅ `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`

### Logging Seguro
- ✅ Tokens redactados automáticamente
- ✅ Logs de debug solo en desarrollo
- ✅ Información sensible oculta en producción

## ⚠️ Próximos Pasos Recomendados

### Fase 2: Optimización
- [ ] Implementar singleton para PrismaClient
- [ ] Agregar paginación a endpoints
- [ ] Implementar compresión de respuestas

### Fase 3: Validación
- [ ] Implementar validación de entrada con Joi/Zod
- [ ] Sanitización de datos
- [ ] Validación de tipos más estricta

### Fase 4: Monitoreo
- [ ] Implementar logging estructurado
- [ ] Agregar métricas de rendimiento
- [ ] Configurar alertas de seguridad

## 🆘 Solución de Problemas

### Error: "Variables de entorno faltantes"
```bash
# Verificar que el archivo .env existe
ls -la frontend/.env

# Verificar contenido (sin mostrar valores)
cat frontend/.env | grep -v "="
```

### Error: "Rate limit exceeded"
```bash
# Esperar 15 minutos o cambiar IP
# En desarrollo, puedes reiniciar el servidor
```

### Error: "CORS policy"
```bash
# Verificar configuración de CORS en backend/src/index.ts
# Asegurar que el dominio del frontend esté incluido
```

---

**✅ La aplicación ahora cumple con estándares básicos de seguridad para producción.** 