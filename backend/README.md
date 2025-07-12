# Teblo Backend

Backend para aplicación de facturación con Node.js + Express + Prisma + PostgreSQL

## Variables de Entorno Requeridas

### Base de Datos
```
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
```

### Producción
```
NODE_ENV=production
```



### CORS
```
FRONTEND_URL=https://your-frontend-url.railway.app
```

### Puerto (Opcional)
```
PORT=3000
```

## Scripts Disponibles

- `npm run dev` - Ejecutar en desarrollo
- `npm run build` - Compilar para producción (incluye migraciones)
- `npm start` - Ejecutar en producción
- `npm run prisma:migrate` - Crear nueva migración
- `npm run prisma:deploy` - Aplicar migraciones en producción
- `npm run prisma:studio` - Abrir Prisma Studio

## Configuración en Railway

1. **Agregar servicio PostgreSQL** en Railway
2. **Configurar variables de entorno** con los valores apropiados
3. **El build automáticamente ejecutará las migraciones** de base de datos # Last updated: Sat Jul 12 16:43:53 CEST 2025
