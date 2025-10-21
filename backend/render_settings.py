# Configuración específica para Render
import os
from .settings import *

# Configuración específica para Render
if os.environ.get('RENDER'):
    DEBUG = False
    
    # Configuración de hosts permitidos
    ALLOWED_HOSTS = [
        '.onrender.com',
        'finance-backend-k12z.onrender.com',
        'localhost',
        '127.0.0.1',
    ]
    
    # Configuración de CORS más permisiva para Render
    CORS_ALLOW_ALL_ORIGINS = True
    CORS_ALLOW_CREDENTIALS = True
    
    # Configuración específica para cookies cross-domain
    SESSION_COOKIE_SAMESITE = 'None'
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SAMESITE = 'None'
    CSRF_COOKIE_SECURE = True
    
    # Configuración de archivos estáticos
    STATIC_URL = '/static/'
    STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
    
    # Configuración de base de datos
    if os.environ.get('DATABASE_URL'):
        import dj_database_url
        DATABASES = {
            'default': dj_database_url.parse(os.environ.get('DATABASE_URL'))
        }
    
    # Configuración de logging para debugging
    LOGGING = {
        'version': 1,
        'disable_existing_loggers': False,
        'handlers': {
            'console': {
                'class': 'logging.StreamHandler',
            },
        },
        'root': {
            'handlers': ['console'],
            'level': 'INFO',
        },
        'loggers': {
            'django': {
                'handlers': ['console'],
                'level': 'INFO',
                'propagate': False,
            },
        },
    }
    
    # Configuración adicional para CORS
    CORS_ALLOWED_HEADERS = [
        'accept',
        'accept-encoding',
        'authorization',
        'content-type',
        'dnt',
        'origin',
        'user-agent',
        'x-csrftoken',
        'x-requested-with',
        'cache-control',
        'pragma',
    ]
    
    CORS_ALLOWED_METHODS = [
        'DELETE',
        'GET',
        'OPTIONS',
        'PATCH',
        'POST',
        'PUT',
    ]
    
    # Configuración de timeout
    CONN_MAX_AGE = 60