#!/bin/bash

# Script de inicio para Render
echo "Iniciando aplicación en Render..."

# Ejecutar migraciones
echo "Ejecutando migraciones..."
python manage.py migrate --noinput

# Recopilar archivos estáticos
echo "Recopilando archivos estáticos..."
python manage.py collectstatic --noinput

# Crear superusuario si no existe (opcional)
echo "Verificando superusuario..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(is_superuser=True).exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('Superusuario creado')
else:
    print('Superusuario ya existe')
"

# Inicializar datos si es necesario
if [ -f "init_data.py" ]; then
    echo "Inicializando datos..."
    python init_data.py
fi

# Iniciar servidor con Gunicorn
echo "Iniciando servidor..."
exec gunicorn finance_api.wsgi:application \
    --bind 0.0.0.0:$PORT \
    --workers 2 \
    --worker-class sync \
    --timeout 120 \
    --keep-alive 2 \
    --max-requests 1000 \
    --max-requests-jitter 100 \
    --log-level info \
    --access-logfile - \
    --error-logfile -