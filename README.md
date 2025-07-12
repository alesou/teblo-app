# Teblo

Una aplicación web simple y moderna para gestionar facturas, clientes y generar PDFs profesionales.

## 🚀 Características

### Gestión de Clientes
- ✅ Crear, editar y eliminar clientes
- ✅ Almacenar datos completos (nombre, NIF/CIF, dirección, email, teléfono)
- ✅ Lista de clientes con búsqueda
- ✅ Historial de facturas por cliente

### Gestión de Facturas
- ✅ Crear facturas con numeración automática
- ✅ Seleccionar cliente desde la base de datos
- ✅ Añadir múltiples líneas de productos/servicios
- ✅ Cálculo automático de subtotales, IVA y totales
- ✅ Diferentes tipos de IVA (0%, 4%, 10%, 21%)
- ✅ Generar PDF profesional y moderno
- ✅ Descargar múltiples facturas en un solo PDF
- ✅ Marcar facturas como pagadas/pendientes/canceladas
- ✅ Historial completo de facturas

### Configuración
- ✅ Datos de la empresa (nombre, NIF, dirección)
- ✅ Configurar numeración de facturas
- ✅ Interfaz moderna y responsive

### Reportes
- ✅ Dashboard con estadísticas
- ✅ Facturas pendientes de pago
- ✅ Resumen de ingresos
- ✅ Exportar múltiples facturas

## 🛠️ Tecnologías

### Backend
- **Node.js** con **Express**
- **TypeScript** para mayor seguridad
- **SQLite** con **Prisma** ORM
- **Puppeteer** para generación de PDFs

### Frontend
- **React 18** con **TypeScript**
- **Vite** para desarrollo rápido
- **Tailwind CSS** para diseño moderno
- **React Query** para gestión de estado
- **React Hook Form** para formularios
- **Lucide React** para iconos

## 📦 Instalación

### Prerrequisitos
- Node.js 18+ 
- npm o yarn

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd facturacion-app
```

### 2. Instalar dependencias
```bash
# Instalar dependencias del monorepo
npm install

# Instalar dependencias del backend
cd backend
npm install

# Generar cliente de Prisma
npx prisma generate

# Crear y migrar la base de datos
npx prisma db push

# Volver al directorio raíz
cd ..

# Instalar dependencias del frontend
cd frontend
npm install
cd ..
```

### 3. Configurar variables de entorno (opcional)
```bash
# En el directorio backend, crear .env
cp backend/.env.example backend/.env
```

## 🚀 Ejecución

### Desarrollo
```bash
# Ejecutar backend y frontend simultáneamente
npm run dev

# O ejecutar por separado:
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend  
npm run dev:frontend
```

### Producción
```bash
# Construir frontend
npm run build

# Ejecutar en producción
npm start
```

## 📱 Uso

### Acceso a la aplicación
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

### Primeros pasos
1. **Configurar empresa**: Ve a Configuración y añade los datos de tu empresa
2. **Crear clientes**: Ve a Clientes y añade tus primeros clientes
3. **Crear facturas**: Ve a Facturas → Nueva Factura
4. **Generar PDFs**: Descarga las facturas en PDF desde la lista

### Funcionalidades principales

#### Crear una factura
1. Ve a "Facturas" → "Nueva Factura"
2. Selecciona un cliente
3. Añade líneas de productos/servicios
4. Los totales se calculan automáticamente
5. Guarda la factura
6. Descarga el PDF

#### Gestionar clientes
1. Ve a "Clientes"
2. Añade nuevos clientes con sus datos
3. Edita o elimina clientes existentes
4. Ve el historial de facturas por cliente

#### Descargar múltiples facturas
1. Ve a "Facturas"
2. Selecciona las facturas que quieres descargar
3. Haz clic en "Descargar Seleccionadas"
4. Se genera un PDF con todas las facturas

## 🗄️ Estructura de la base de datos

### Tablas principales
- **clients**: Información de clientes
- **invoices**: Facturas principales
- **invoice_items**: Líneas de factura
- **settings**: Configuración de la empresa

### Relaciones
- Un cliente puede tener múltiples facturas
- Una factura pertenece a un cliente
- Una factura puede tener múltiples líneas

## 🎨 Diseño

### Paleta de colores
- **Primario**: Azul (#2563eb)
- **Secundario**: Gris (#6b7280)
- **Éxito**: Verde (#10b981)
- **Advertencia**: Amarillo (#f59e0b)
- **Error**: Rojo (#ef4444)

### Características del diseño
- ✅ Interfaz moderna y limpia
- ✅ Diseño responsive
- ✅ Pocos colores como solicitado
- ✅ Iconografía clara
- ✅ Tipografía legible

## 📄 Generación de PDFs

### Características del PDF
- ✅ Diseño profesional y moderno
- ✅ Información completa de empresa y cliente
- ✅ Tabla detallada de productos/servicios
- ✅ Cálculos automáticos de IVA
- ✅ Formato A4 optimizado
- ✅ Múltiples facturas en un solo archivo

### Formato del PDF
- Encabezado con datos de la empresa
- Información del cliente
- Tabla de productos con subtotales e IVA
- Total general
- Notas opcionales

## 🔧 Configuración avanzada

### Personalizar numeración de facturas
1. Ve a Configuración
2. Cambia el prefijo (ej: "FAC", "INV", "2024")
3. El sistema incrementará automáticamente

### Tipos de IVA disponibles
- 0% (exento)
- 4% (superreducido)
- 10% (reducido)
- 21% (general)

## 🐛 Solución de problemas

### Error de base de datos
```bash
cd backend
npx prisma db push
npx prisma generate
```

### Error de dependencias
```bash
# Limpiar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Error de puertos
- Verifica que los puertos 3000 y 3001 estén libres
- Cambia los puertos en `vite.config.ts` y `backend/src/index.ts`

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request.

---

**Desarrollado con ❤️ para autónomos** 