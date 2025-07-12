#!/bin/bash

echo "🚀 Instalando Aplicación de Facturación..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor, instala Node.js 18+ primero."
    exit 1
fi

echo "✅ Node.js encontrado: $(node --version)"

# Instalar dependencias del monorepo
echo "📦 Instalando dependencias del monorepo..."
npm install

# Instalar dependencias del backend
echo "🔧 Instalando dependencias del backend..."
cd backend
npm install

# Generar cliente de Prisma
echo "🗄️ Generando cliente de Prisma..."
npx prisma generate

# Crear y migrar la base de datos
echo "📊 Creando base de datos..."
npx prisma db push

cd ..

# Instalar dependencias del frontend
echo "🎨 Instalando dependencias del frontend..."
cd frontend
npm install
cd ..

echo ""
echo "✅ ¡Instalación completada!"
echo ""
echo "🚀 Para ejecutar la aplicación:"
echo "   npm run dev"
echo ""
echo "📱 La aplicación estará disponible en:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo ""
echo "📖 Consulta el README.md para más información." 