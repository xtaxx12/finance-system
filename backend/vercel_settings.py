# Configuración específica para Vercel
# Este archivo contiene configuraciones adicionales para el despliegue en Vercel

import os
from .settings import *

# Configuración específica para producción en Vercel
if os.environ.get('VERCEL'):
    # Configuración de archivos estáticos para Vercel
    STATIC_URL = '/static/'
    STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
    
    # Configuración de base de datos para Vercel
    if os.environ.get('DATABASE_URL'):
        import dj_database_url
        DATABASES = {
            'default': dj_database_url.parse(os.environ.get('DATABASE_URL'))
        }
    
    # Configuración de seguridad para Vercel
    SECURE_SSL_REDIRECT = True
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    
    # Configuración de CORS para Vercel
    CORS_ALLOW_ALL_ORIGINS = False
    CORS_ALLOWED_ORIGINS = [
        "https://*.vercel.app",
    ]
    
    CSRF_TRUSTED_ORIGINS = [
        "https://*.vercel.app",
    ]
    
    # Configuración de hosts permitidos
    ALLOWED_HOSTS = [
        '.vercel.app',
        'localhost',
        '127.0.0.1',
    ]