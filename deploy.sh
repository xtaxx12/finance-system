#!/bin/bash

# 🚀 Script de Despliegue Automatizado
# Sistema de Finanzas Personales

echo "🚀 Iniciando despliegue..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes con colores
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

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.yml" ]; then
    print_error "No se encontró docker-compose.yml. Ejecuta este script desde la raíz del proyecto."
    exit 1
fi

print_status "Verificando estructura del proyecto..."

# Verificar archivos necesarios
if [ ! -f "backend/railway.json" ]; then
    print_error "Falta backend/railway.json"
    exit 1
fi

if [ ! -f "frontend/vercel.json" ]; then
    print_error "Falta frontend/vercel.json"
    exit 1
fi

print_success "Estructura del proyecto verificada ✓"

# Verificar dependencias de Python
print_status "Verificando dependencias del backend..."
if ! grep -q "gunicorn" backend/requirements.txt; then
    print_error "Falta gunicorn en requirements.txt"
    exit 1
fi

if ! grep -q "whitenoise" backend/requirements.txt; then
    print_error "Falta whitenoise en requirements.txt"
    exit 1
fi

if ! grep -q "dj-database-url" backend/requirements.txt; then
    print_error "Falta dj-database-url en requirements.txt"
    exit 1
fi

print_success "Dependencias del backend verificadas ✓"

# Verificar configuración del frontend
print_status "Verificando configuración del frontend..."
if [ ! -f "frontend/.env.production" ]; then
    print_warning "No se encontró frontend/.env.production"
    print_status "Creando archivo de ejemplo..."
    echo "REACT_APP_API_URL=https://tu-backend.railway.app" > frontend/.env.production
    echo "REACT_APP_ENVIRONMENT=production" >> frontend/.env.production
    print_warning "⚠️  Actualiza frontend/.env.production con tu URL real de Railway"
fi

print_success "Configuración del frontend verificada ✓"

# Verificar Git
print_status "Verificando estado de Git..."
if [ -n "$(git status --porcelain)" ]; then
    print_warning "Hay cambios sin commitear. Recomendamos hacer commit antes del despliegue."
    read -p "¿Continuar de todos modos? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Despliegue cancelado."
        exit 1
    fi
fi

print_success "Estado de Git verificado ✓"

# Mostrar checklist de despliegue
echo ""
print_status "📋 CHECKLIST DE DESPLIEGUE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🐘 BASE DE DATOS (Railway PostgreSQL):"
echo "   1. ✓ Crear instancia PostgreSQL en Railway"
echo "   2. ✓ Copiar variables de entorno (DATABASE_URL, PGHOST, etc.)"
echo ""
echo "🚂 BACKEND (Railway):"
echo "   1. ✓ Crear nuevo proyecto en Railway"
echo "   2. ✓ Conectar repositorio GitHub"
echo "   3. ✓ Configurar variables de entorno:"
echo "      - SECRET_KEY (generar una nueva)"
echo "      - DEBUG=False"
echo "      - DATABASE_URL (de PostgreSQL)"
echo "      - PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD"
echo "   4. ✓ Desplegar automáticamente"
echo ""
echo "⚡ FRONTEND (Vercel):"
echo "   1. ✓ Crear nuevo proyecto en Vercel"
echo "   2. ✓ Conectar repositorio GitHub"
echo "   3. ✓ Configurar:"
echo "      - Framework: Create React App"
echo "      - Root Directory: frontend"
echo "      - Build Command: npm run build"
echo "      - Output Directory: build"
echo "   4. ✓ Agregar variable de entorno:"
echo "      - REACT_APP_API_URL (URL de Railway backend)"
echo "   5. ✓ Desplegar automáticamente"
echo ""
echo "🔧 CONFIGURACIÓN FINAL:"
echo "   1. ✓ Actualizar CORS_ALLOWED_ORIGINS con URL de Vercel"
echo "   2. ✓ Crear superusuario en Railway"
echo "   3. ✓ Probar funcionalidades"
echo ""

read -p "¿Has completado todos los pasos del checklist? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_status "Completa el checklist y vuelve a ejecutar el script."
    exit 1
fi

# Generar SECRET_KEY
print_status "Generando SECRET_KEY para producción..."
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(50))")
echo ""
print_success "SECRET_KEY generada:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "$SECRET_KEY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
print_warning "⚠️  Guarda esta clave y úsala como SECRET_KEY en Railway"
echo ""

# Mostrar comandos útiles
print_status "📝 COMANDOS ÚTILES PARA RAILWAY:"
echo ""
echo "# Instalar Railway CLI:"
echo "npm install -g @railway/cli"
echo ""
echo "# Login y conectar proyecto:"
echo "railway login"
echo "railway link"
echo ""
echo "# Ver logs:"
echo "railway logs --follow"
echo ""
echo "# Ejecutar comandos en producción:"
echo "railway run python manage.py createsuperuser"
echo "railway run python manage.py migrate"
echo ""

print_status "📝 COMANDOS ÚTILES PARA VERCEL:"
echo ""
echo "# Instalar Vercel CLI:"
echo "npm install -g vercel"
echo ""
echo "# Login y desplegar:"
echo "vercel login"
echo "vercel --prod"
echo ""
echo "# Ver logs:"
echo "vercel logs"
echo ""

# URLs de ejemplo
print_status "🌐 URLs DE EJEMPLO:"
echo ""
echo "Frontend: https://finanzas-personales.vercel.app"
echo "Backend:  https://finanzas-backend.railway.app"
echo "Admin:    https://finanzas-backend.railway.app/admin"
echo ""

print_success "🎉 ¡Preparación para despliegue completada!"
print_status "Sigue la guía en DEPLOYMENT_GUIDE.md para los pasos específicos."

echo ""
print_status "📚 RECURSOS ADICIONALES:"
echo "• Guía completa: DEPLOYMENT_GUIDE.md"
echo "• Railway: https://railway.app"
echo "• Vercel: https://vercel.com"
echo "• Documentación Django: https://docs.djangoproject.com/en/4.2/howto/deployment/"
echo ""

print_success "✨ ¡Tu aplicación está lista para producción!"