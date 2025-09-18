# 🚀 Guía de Despliegue en Render - Backend Django

## 📋 Stack Final Recomendado

- **Frontend**: Vercel (React)
- **Backend**: Render (Django Web Service)
- **Base de Datos**: Railway PostgreSQL

## ✨ Ventajas de Render para Django

- ✅ **Especializado en Django**: Configuración nativa
- ✅ **Fácil setup**: Sin configuraciones complejas
- ✅ **Logs claros**: Debugging sencillo
- ✅ **Migraciones automáticas**: Se ejecutan en deploy
- ✅ **Archivos estáticos**: Manejo automático
- ✅ **HTTPS gratuito**: SSL incluido

---

## 1. 🔧 Preparar el Backend para Render

### Paso 1: Crear archivo `build.sh`
Crear `backend/build.sh`:
```bash
#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate
```

### Paso 2: Hacer el script ejecutable
```bash
chmod +x backend/build.sh
```

### Paso 3: Actualizar `requirements.txt`
Asegurar que tenga todas las dependencias:
```
Django==4.2.7
djangorestframework==3.14.0
django-cors-headers==4.3.1
psycopg2-binary==2.9.9
python-decouple==3.8
django-filter==23.3
drf-nested-routers==0.93.4
gunicorn==21.2.0
whitenoise==6.6.0
dj-database-url==2.1.0
```

### Paso 4: Configurar `settings.py` para Render
Agregar al final de `backend/finance_api/settings.py`:

```python
# Configuración para Render
import os
import dj_database_url

# Render detecta automáticamente el entorno
if 'RENDER' in os.environ:
    DEBUG = False
    
    # Configuración de base de datos
    DATABASES = {
        'default': dj_database_url.parse(os.environ.get('DATABASE_URL'))
    }
    
    # Hosts permitidos
    ALLOWED_HOSTS = [
        '.onrender.com',
        'localhost',
        '127.0.0.1',
    ]
    
    # Configuración de CORS
    CORS_ALLOWED_ORIGINS = [
        "https://tu-frontend.vercel.app",  # Actualizar con tu URL real
        "http://localhost:3000",
    ]
    
    CSRF_TRUSTED_ORIGINS = [
        "https://tu-frontend.vercel.app",  # Actualizar con tu URL real
    ]
    
    # Configuración de archivos estáticos
    STATIC_URL = '/static/'
    STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
    
    # Configuración de seguridad
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
```

---

## 2. 🚀 Desplegar en Render

### Paso 1: Crear cuenta en Render
1. Ve a [render.com](https://render.com)
2. Regístrate con GitHub
3. Conecta tu repositorio

### Paso 2: Crear Web Service
1. Haz clic en "New +"
2. Selecciona "Web Service"
3. Conecta tu repositorio GitHub
4. Configura el servicio:

**Configuración básica:**
- **Name**: `finance-backend`
- **Region**: `Oregon (US West)` o el más cercano
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Python 3`
- **Build Command**: `./build.sh`
- **Start Command**: `gunicorn finance_api.wsgi:application`

**Plan:**
- Selecciona "Free" (0$/mes)

### Paso 3: Configurar Variables de Entorno
En la sección "Environment Variables", agrega:

```
SECRET_KEY = tu-clave-secreta-super-segura-aqui
DEBUG = False
DATABASE_URL = postgresql://postgres:wTfYillMzsnwaECnDQEGsSamAwznLHrv@yamanote.proxy.rlwy.net:38735/railway
PYTHON_VERSION = 3.9.18
```

### Paso 4: Desplegar
1. Haz clic en "Create Web Service"
2. Render comenzará el build automáticamente
3. Espera a que termine (puede tomar 5-10 minutos)

---

## 3. ✅ Verificar el Despliegue

### Paso 1: Probar la URL
Render te dará una URL como: `https://finance-backend.onrender.com`

### Paso 2: Probar endpoints
- **API Root**: `https://finance-backend.onrender.com/api/`
- **Admin**: `https://finance-backend.onrender.com/admin/`

### Paso 3: Crear superusuario
1. Ve a tu servicio en Render
2. Haz clic en "Shell" en el menú lateral
3. Ejecuta:
```bash
python manage.py createsuperuser
```

---

## 4. 🔧 Configurar Frontend (Vercel)

### Paso 1: Actualizar variable de entorno
```bash
cd frontend
vercel env add REACT_APP_API_URL
# Valor: https://finance-backend.onrender.com
```

### Paso 2: Redesplegar frontend
```bash
vercel --prod
```

### Paso 3: Actualizar CORS en backend
Actualiza `settings.py` con la URL real del frontend:
```python
CORS_ALLOWED_ORIGINS = [
    "https://tu-frontend-real.vercel.app",  # URL real de Vercel
    "http://localhost:3000",
]
```

---

## 5. 📊 Monitoreo y Logs

### Ver logs en tiempo real:
1. Ve a tu servicio en Render
2. Haz clic en "Logs"
3. Los logs se actualizan automáticamente

### Métricas disponibles:
- CPU usage
- Memory usage
- Response times
- Error rates

---

## 6. 🔄 Auto-Deploy

Render se conecta automáticamente a tu repositorio:
- **Cada push a main** = deploy automático
- **Pull requests** = preview deploys
- **Rollback** = un clic para versión anterior

---

## 7. 💰 Costos

### Plan Gratuito incluye:
- ✅ 750 horas/mes (suficiente para 24/7)
- ✅ SSL automático
- ✅ Custom domains
- ✅ Auto-deploy desde Git

### Limitaciones del plan gratuito:
- ⚠️ Se "duerme" después de 15 min sin uso
- ⚠️ Tarda ~30s en "despertar"
- ⚠️ 512MB RAM

### Plan Starter ($7/mes):
- ✅ Siempre activo
- ✅ 1GB RAM
- ✅ Mejor performance

---

## 8. 🐛 Troubleshooting

### Error de build:
```bash
# Ver logs detallados en Render Dashboard
# Verificar que build.sh sea ejecutable
chmod +x build.sh
```

### Error de base de datos:
```bash
# Verificar DATABASE_URL en variables de entorno
# Probar conexión desde Shell de Render
python manage.py dbshell
```

### Error de CORS:
```python
# Actualizar CORS_ALLOWED_ORIGINS con URLs reales
CORS_ALLOWED_ORIGINS = [
    "https://tu-frontend-real.vercel.app",
]
```

---

## 9. 🎯 Checklist Final

- [ ] `build.sh` creado y ejecutable
- [ ] `requirements.txt` actualizado
- [ ] `settings.py` configurado para Render
- [ ] Variables de entorno configuradas
- [ ] Servicio desplegado exitosamente
- [ ] Migraciones ejecutadas
- [ ] Superusuario creado
- [ ] Frontend actualizado con nueva URL
- [ ] CORS configurado correctamente
- [ ] Endpoints funcionando

---

## 🎉 URLs Finales

Una vez completado:
- **Frontend**: `https://tu-frontend.vercel.app`
- **Backend**: `https://finance-backend.onrender.com`
- **Admin**: `https://finance-backend.onrender.com/admin`
- **API**: `https://finance-backend.onrender.com/api`

¡Tu aplicación estará completamente funcional! 🚀