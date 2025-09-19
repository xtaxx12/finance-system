#!/bin/bash

echo "🚀 Desplegando correcciones de CORS y CSRF..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ] && [ ! -f "backend/requirements.txt" ]; then
    echo "❌ Error: Ejecuta este script desde la raíz del proyecto"
    exit 1
fi

echo "📦 Instalando dependencias del frontend..."
cd frontend
npm install

echo "🔧 Construyendo el frontend..."
npm run build

echo "📤 Desplegando frontend a Vercel..."
npx vercel --prod

echo "🔄 El backend se actualizará automáticamente en Render"
echo "✅ Despliegue completado!"

echo ""
echo "🔍 Verificaciones recomendadas:"
echo "1. Verificar que el backend esté funcionando: https://finance-backend-k12z.onrender.com/api/auth/csrf/"
echo "2. Verificar que el frontend esté funcionando: https://finance-frontend-tawny.vercel.app"
echo "3. Probar el login y las transacciones"
echo ""
echo "🐛 Si persisten los errores de CORS:"
echo "1. Verificar las variables de entorno en Render"
echo "2. Verificar que CORS_ALLOW_ALL_ORIGINS esté en True"
echo "3. Revisar los logs de Render para errores específicos"