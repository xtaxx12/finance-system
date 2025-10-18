# Despliegue en Render

## Configuración necesaria en Render

### Variables de entorno:
```
RENDER=1
DEBUG=False
SECRET_KEY=tu-secret-key-aqui
DATABASE_URL=postgresql://user:password@host:port/database
PYTHON_VERSION=3.11.0
```

### Comandos de construcción:
```bash
pip install -r requirements.txt && python manage.py collectstatic --noinput
```

### Comando de inicio:
```bash
./start_render.sh
```

### Health Check:
- URL: `/health/`
- Método: GET

## Problemas comunes y soluciones:

### Error 502 Bad Gateway:
1. Verificar que gunicorn esté instalado
2. Verificar que el puerto esté configurado correctamente
3. Revisar los logs de Render

### Problemas de CORS:
1. Verificar que CORS_ALLOW_ALL_ORIGINS esté en True para Render
2. Verificar que el dominio del frontend esté en CORS_ALLOWED_ORIGINS
3. Verificar que las cookies estén configuradas para cross-domain

### Problemas de base de datos:
1. Verificar que DATABASE_URL esté configurada
2. Ejecutar migraciones manualmente si es necesario
3. Verificar conexión a PostgreSQL

## URLs importantes:
- Health check: `https://tu-app.onrender.com/health/`
- Admin: `https://tu-app.onrender.com/admin/`
- API: `https://tu-app.onrender.com/api/`