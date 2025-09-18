# 🚀 Guía de Despliegue - Sistema de Finanzas Personales

## 📋 Stack de Despliegue Recomendado

- **Frontend**: Vercel (React)
- **Backend**: Vercel (Django) 
- **Base de Datos**: Railway PostgreSQL
- **Dominio**: Gratuito con HTTPS

## ✨ Ventajas de esta Configuración

- ✅ **Todo en Vercel**: Gestión unificada de frontend y backend
- ✅ **Despliegue automático**: Git push = deploy automático
- ✅ **Escalamiento automático**: Serverless functions
- ✅ **HTTPS gratuito**: Certificados SSL automáticos
- ✅ **CDN global**: Velocidad mundial
- ✅ **Monitoreo integrado**: Analytics y logs

---

## 1. 🐘 Desplegar Base de Datos en Railway

### Paso 1: Crear cuenta en Railway
1. Ve a [railway.app](https://railway.app)
2. Regístrate con GitHub
3. Haz clic en "New Project"

### Paso 2: Crear base de datos PostgreSQL
1. Selecciona "Provision PostgreSQL"
2. Espera a que se cree la instancia
3. Ve a la pestaña "Variables"
4. Copia las credenciales:
   - `DATABASE_URL`
   - `PGHOST`
   - `PGPORT`
   - `PGDATABASE`
   - `PGUSER`
   - `PGPASSWORD`

### Paso 3: Configurar variables de entorno
Guarda estas variables, las necesitarás para el backend.

---

## 2. �  Desplegar Backend en Vercel

### Paso 1: Preparar el proyecto para Vercel

Crear archivo `backend/vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "finance_api/wsgi.py",
      "use": "@vercel/python",
      "config": { "maxLambdaSize": "15mb", "runtime": "python3.9" }
    },
    {
      "src": "build_files.sh",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "staticfiles_build"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "dest": "/static/$1"
    },
    {
      "src": "/(.*)",
      "dest": "finance_api/wsgi.py"
    }
  ]
}
```

### Paso 2: Crear script de build
Crear archivo `backend/build_files.sh`:
```bash
#!/bin/bash
echo "Building Django application for Vercel..."
pip install -r requirements.txt
python manage.py collectstatic --noinput --clear
echo "Build completed successfully!"
```

### Paso 3: Actualizar requirements.txt
Agregar a `backend/requirements.txt`:
```
gunicorn==21.2.0
whitenoise==6.6.0
```

### Paso 4: Configurar settings para Vercel
Actualizar `backend/finance_api/settings.py`:

```python
import os
from decouple import config
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config('SECRET_KEY', default='django-insecure-change-this-in-production')

DEBUG = config('DEBUG', default=False, cast=bool)

ALLOWED_HOSTS = [
    'localhost', 
    '127.0.0.1', 
    '0.0.0.0',
    '.railway.app',  # Para Railway
    '.vercel.app'    # Para el frontend en Vercel
]

# Apps
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'apps.users',
    'apps.transactions',
    'apps.categories',
    'apps.goals',
    'apps.notifications',
    'apps.budgets',
    'apps.loans',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Para archivos estáticos
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'finance_api.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'finance_api.wsgi.application'

# Base de datos
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('PGDATABASE', default='finance_db'),
        'USER': config('PGUSER', default='postgres'),
        'PASSWORD': config('PGPASSWORD', default='password'),
        'HOST': config('PGHOST', default='localhost'),
        'PORT': config('PGPORT', default='5432'),
    }
}

# También soportar DATABASE_URL de Railway
import dj_database_url
if config('DATABASE_URL', default=None):
    DATABASES['default'] = dj_database_url.parse(config('DATABASE_URL'))

# Validadores de contraseña
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internacionalización
LANGUAGE_CODE = 'es-es'
TIME_ZONE = 'America/Mexico_City'
USE_I18N = True
USE_TZ = True

# Archivos estáticos para Vercel
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles_build', 'static')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Django REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.OrderingFilter',
    ],
}

# Para desarrollo, usar autenticación sin CSRF
if DEBUG:
    REST_FRAMEWORK['DEFAULT_AUTHENTICATION_CLASSES'] = [
        'apps.users.authentication.CsrfExemptSessionAuthentication',
    ]

# CORS settings para producción
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://tu-app-frontend.vercel.app",  # Cambiar por tu dominio de Vercel
]

CORS_ALLOW_CREDENTIALS = True

# CSRF settings
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://tu-app-frontend.vercel.app",  # Cambiar por tu dominio de Vercel
]

# Configuración de seguridad para producción
if not DEBUG:
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
```

### Paso 4: Agregar dj-database-url a requirements
```
dj-database-url==2.1.0
```

### Paso 5: Desplegar Backend en Vercel
1. Ve a [vercel.com](https://vercel.com) y haz login
2. Haz clic en "New Project"
3. Selecciona tu repositorio de GitHub
4. Configura el proyecto:
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
   - **Build Command**: `chmod +x build_files.sh && ./build_files.sh`
   - **Output Directory**: `staticfiles_build`
5. Configura las variables de entorno:
   - `SECRET_KEY`: Una clave secreta fuerte
   - `DEBUG`: `False`
   - `DATABASE_URL`: La URL de tu base de datos PostgreSQL de Railway
   - `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`: De tu base de datos
6. Haz clic en "Deploy"

### Paso 6: Ejecutar migraciones
Una vez desplegado, ejecuta las migraciones:
1. Ve a tu proyecto en Vercel
2. En la pestaña "Functions", busca tu función
3. O usa Vercel CLI:
```bash
vercel env pull
python manage.py migrate
```

---

## 3. ⚡ Desplegar Frontend en Vercel

### Paso 1: Preparar el frontend para producción

Crear archivo `frontend/vercel.json`:
```json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "headers": {
        "cache-control": "s-maxage=31536000,immutable"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### Paso 2: Actualizar variables de entorno del frontend
Crear archivo `frontend/.env.production`:
```
REACT_APP_API_URL=https://tu-backend.railway.app
REACT_APP_ENVIRONMENT=production
```

### Paso 3: Actualizar el servicio API
Actualizar `frontend/src/services/api.js`:
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Resto del código igual...
```

### Paso 4: Desplegar Frontend en Vercel
1. Ve a [vercel.com](https://vercel.com) (si no tienes cuenta ya)
2. Haz clic en "New Project" (segundo proyecto)
3. Selecciona tu repositorio nuevamente
4. Configura:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
5. Agrega variables de entorno:
   - `REACT_APP_API_URL`: URL de tu backend en Vercel (ej: `https://tu-backend.vercel.app`)
6. Haz clic en "Deploy"

---

## 4. 🔧 Configuración Final

### Paso 1: Actualizar CORS en el backend
Una vez que tengas las URLs de producción, actualiza `CORS_ALLOWED_ORIGINS` en settings.py:
```python
CORS_ALLOWED_ORIGINS = [
    "https://tu-frontend.vercel.app",  # Tu dominio del frontend
]

CSRF_TRUSTED_ORIGINS = [
    "https://tu-frontend.vercel.app",  # Tu dominio del frontend
]
```

### Paso 2: Crear superusuario en producción
Usando Vercel CLI:
```bash
# Instalar Vercel CLI
npm install -g vercel

# Login y conectar al proyecto backend
vercel login
vercel link

# Ejecutar comando en producción
vercel exec -- python manage.py createsuperuser
```

### Paso 3: Verificar funcionamiento
1. Ve a tu frontend en Vercel
2. Regístrate/inicia sesión
3. Verifica que todas las funcionalidades trabajen
4. Revisa los logs en Vercel si hay errores

---

## 5. 📊 Monitoreo y Mantenimiento

### Vercel (Backend y Frontend)
- **Analytics**: Tráfico y performance de ambos proyectos
- **Logs**: Errores de build y runtime
- **Functions**: Monitoreo de serverless functions (backend)
- **Dominios**: Gestión de dominios personalizados
- **Variables**: Fácil actualización de env vars

### Railway (Base de Datos)
- **Métricas**: CPU, memoria, conexiones de PostgreSQL
- **Backups**: Automáticos y manuales
- **Logs**: Logs de base de datos

---

## 6. 💰 Costos

### Tier Gratuito Incluye:
- **Vercel**: 100GB bandwidth, builds ilimitados, serverless functions
- **Railway**: $5 USD de crédito mensual para PostgreSQL
- **Dominios**: HTTPS gratuito en ambos

### Escalamiento:
- **Vercel Pro**: $20/mes (más bandwidth, analytics avanzados)
- **Railway**: $5/mes por GB de PostgreSQL adicional

---

## 7. 🔒 Seguridad en Producción

### Checklist de Seguridad:
- ✅ `DEBUG = False`
- ✅ `SECRET_KEY` fuerte y secreta
- ✅ HTTPS habilitado (automático en Railway/Vercel)
- ✅ CORS configurado correctamente
- ✅ Variables de entorno seguras
- ✅ Base de datos con credenciales fuertes

---

## 8. 🚀 Comandos Útiles

### Redeploy Backend y Frontend:
```bash
git push origin main  # Auto-deploy en ambos proyectos de Vercel
```

### Ver logs en tiempo real:
```bash
# Vercel CLI (para ambos proyectos)
vercel logs --follow

# Ver logs específicos
vercel logs [deployment-url]
```

### Comandos útiles de Vercel:
```bash
# Ver proyectos
vercel list

# Cambiar entre proyectos
vercel switch

# Variables de entorno
vercel env ls
vercel env add
```

---

## 9. 🐛 Troubleshooting

### Errores Comunes:

**Error de CORS:**
- Verificar `CORS_ALLOWED_ORIGINS` en settings.py
- Asegurar que las URLs de Vercel coincidan exactamente

**Error de Base de Datos:**
- Verificar variables de entorno en Vercel (backend)
- Verificar conexión a Railway PostgreSQL
- Ejecutar migraciones: `vercel exec -- python manage.py migrate`

**Error 500 en Backend:**
- Revisar logs en Vercel Functions
- Verificar `ALLOWED_HOSTS` en settings.py
- Verificar que `build_files.sh` sea ejecutable

**Frontend no conecta al Backend:**
- Verificar `REACT_APP_API_URL` en Vercel (frontend)
- Asegurar que apunte al dominio correcto del backend
- Verificar que ambos proyectos estén desplegados

**Error de Serverless Function:**
- Verificar que el tamaño no exceda 15MB
- Revisar timeout de functions (10s por defecto)
- Verificar logs de la función específica

---

## 🎉 ¡Listo!

Tu aplicación de finanzas personales estará disponible en:
- **Frontend**: `https://tu-frontend.vercel.app`
- **Backend API**: `https://tu-backend.vercel.app`
- **Admin**: `https://tu-backend.vercel.app/admin`
- **Base de Datos**: Gestionada en Railway

¡Felicidades! Tu aplicación está en producción y lista para usar. 🚀