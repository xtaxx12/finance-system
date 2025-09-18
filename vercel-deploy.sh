#!/bin/bash

# 🚀 Script de Despliegue para Vercel
# Sistema de Finanzas Personales

echo "🚀 Configurando despliegue en Vercel..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar estructura del proyecto
print_status "Verificando estructura del proyecto..."

if [ ! -f "backend/vercel.json" ]; then
    print_error "Falta backend/vercel.json"
    exit 1
fi

if [ ! -f "frontend/vercel.json" ]; then
    print_error "Falta frontend/vercel.json"
    exit 1
fi

if [ ! -f "backend/build_files.sh" ]; then
    print_error "Falta backend/build_files.sh"
    exit 1
fi

print_success "Estructura del proyecto verificada ✓"

# Generar SECRET_KEY
print_status "Generando SECRET_KEY para producción..."
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(50))")

echo ""
print_success "🔑 SECRET_KEY generada:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "$SECRET_KEY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Mostrar checklist específico para Vercel
print_status "📋 CHECKLIST DE DESPLIEGUE EN VERCEL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🐘 1. BASE DE DATOS (Railway PostgreSQL):"
echo "   ✓ Crear instancia PostgreSQL en Railway"
echo "   ✓ Copiar DATABASE_URL y credenciales"
echo ""
echo "🟢 2. BACKEND (Vercel):"
echo "   ✓ Crear nuevo proyecto en Vercel"
echo "   ✓ Conectar repositorio GitHub"
echo "   ✓ Configurar:"
echo "      - Framework: Other"
echo "      - Root Directory: backend"
echo "      - Build Command: chmod +x build_files.sh && ./build_files.sh"
echo "      - Output Directory: staticfiles_build"
echo "   ✓ Variables de entorno:"
echo "      - SECRET_KEY: $SECRET_KEY"
echo "      - DEBUG: False"
echo "      - DATABASE_URL: [de Railway]"
echo "      - PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD"
echo ""
echo "⚡ 3. FRONTEND (Vercel):"
echo "   ✓ Crear segundo proyecto en Vercel"
echo "   ✓ Conectar mismo repositorio GitHub"
echo "   ✓ Configurar:"
echo "      - Framework: Create React App"
echo "      - Root Directory: frontend"
echo "      - Build Command: npm run build"
echo "      - Output Directory: build"
echo "   ✓ Variables de entorno:"
echo "      - REACT_APP_API_URL: [URL del backend en Vercel]"
echo ""
echo "🔧 4. CONFIGURACIÓN FINAL:"
echo "   ✓ Actualizar CORS_ALLOWED_ORIGINS con URL del frontend"
echo "   ✓ Ejecutar migraciones: vercel exec -- python manage.py migrate"
echo "   ✓ Crear superusuario: vercel exec -- python manage.py createsuperuser"
echo ""

# Mostrar comandos específicos de Vercel
print_status "📝 COMANDOS ÚTILES DE VERCEL:"
echo ""
echo "# Instalar Vercel CLI:"
echo "npm install -g vercel"
echo ""
echo "# Login:"
echo "vercel login"
echo ""
echo "# Desplegar manualmente:"
echo "vercel --prod"
echo ""
echo "# Ver proyectos:"
echo "vercel list"
echo ""
echo "# Cambiar entre proyectos:"
echo "vercel switch"
echo ""
echo "# Ver logs:"
echo "vercel logs --follow"
echo ""
echo "# Ejecutar comandos en producción:"
echo "vercel exec -- python manage.py migrate"
echo "vercel exec -- python manage.py createsuperuser"
echo ""
echo "# Gestionar variables de entorno:"
echo "vercel env ls"
echo "vercel env add SECRET_KEY"
echo "vercel env add DATABASE_URL"
echo ""

# Mostrar configuración específica
print_status "⚙️  CONFIGURACIÓN ESPECÍFICA PARA VERCEL:"
echo ""
echo "Backend vercel.json:"
echo "- Usa @vercel/python para Django"
echo "- Configura rutas para static files"
echo "- Máximo 15MB por function"
echo ""
echo "Frontend vercel.json:"
echo "- Optimizado para SPA (Single Page App)"
echo "- Cache de archivos estáticos"
echo "- Redirección a index.html"
echo ""

print_status "🌐 URLS DE EJEMPLO:"
echo ""
echo "Frontend: https://finanzas-frontend.vercel.app"
echo "Backend:  https://finanzas-backend.vercel.app"
echo "Admin:    https://finanzas-backend.vercel.app/admin"
echo "DB:       [Gestionada en Railway]"
echo ""

print_success "🎉 ¡Configuración para Vercel completada!"
print_status "Sigue los pasos del checklist para desplegar en Vercel."

echo ""
print_status "📚 RECURSOS ADICIONALES:"
echo "• Guía completa: DEPLOYMENT_GUIDE.md"
echo "• Vercel Docs: https://vercel.com/docs"
echo "• Railway Docs: https://docs.railway.app"
echo "• Django on Vercel: https://vercel.com/guides/deploying-django-with-vercel"
echo ""

print_success "✨ ¡Tu aplicación está lista para Vercel!"