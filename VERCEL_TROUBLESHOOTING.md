# 🔧 Solución de Problemas - Vercel

## Errores Comunes y Soluciones

### ❌ Error: Command "chmod +x build_files.sh && ./build_files.sh" exited with 1

**Problema**: Vercel no puede ejecutar scripts personalizados de build.

**Solución**:
1. Simplificar `vercel.json` (ya actualizado):
```json
{
  "version": 2,
  "builds": [
    {
      "src": "finance_api/wsgi.py",
      "use": "@vercel/python",
      "config": { 
        "maxLambdaSize": "15mb", 
        "runtime": "python3.9"
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

2. En la configuración de Vercel:
   - **Build Command**: Dejar vacío o `pip install -r requirements.txt`
   - **Output Directory**: Dejar vacío

---

### ❌ Error: Module 'finance_api.wsgi' not found

**Problema**: Vercel no encuentra el módulo WSGI.

**Solución**:
1. Verificar que `finance_api/wsgi.py` existe
2. Asegurar que el `vercel.json` apunte correctamente:
```json
"src": "finance_api/wsgi.py"
```

---

### ❌ Error: Static files not found

**Problema**: Los archivos estáticos no se sirven correctamente.

**Solución**:
1. Verificar configuración en `settings.py`:
```python
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

if not DEBUG:
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
```

2. Ejecutar collectstatic después del despliegue:
```bash
vercel exec -- python manage.py collectstatic --noinput
```

---

### ❌ Error: Database connection failed

**Problema**: No se puede conectar a la base de datos de Railway.

**Solución**:
1. Verificar variables de entorno en Vercel:
   - `DATABASE_URL`
   - `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`

2. Verificar que Railway PostgreSQL esté activo

3. Probar conexión:
```bash
vercel exec -- python manage.py dbshell
```

---

### ❌ Error: CORS policy blocked

**Problema**: El frontend no puede conectar al backend por CORS.

**Solución**:
1. Actualizar `CORS_ALLOWED_ORIGINS` en `settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "https://tu-frontend.vercel.app",
    "http://localhost:3000",  # Para desarrollo
]
```

2. Actualizar `CSRF_TRUSTED_ORIGINS`:
```python
CSRF_TRUSTED_ORIGINS = [
    "https://tu-frontend.vercel.app",
]
```

---

### ❌ Error: Function timeout

**Problema**: Las funciones de Vercel tienen timeout (10s por defecto).

**Solución**:
1. Optimizar consultas de base de datos
2. Usar paginación en APIs
3. Considerar upgrade a Vercel Pro (60s timeout)

---

### ❌ Error: Package size too large

**Problema**: El paquete excede el límite de 15MB.

**Solución**:
1. Remover dependencias innecesarias de `requirements.txt`
2. Usar `--no-cache-dir` en pip
3. Considerar separar en múltiples funciones

---

## 🔍 Comandos de Diagnóstico

### Ver logs en tiempo real:
```bash
vercel logs --follow
```

### Ver logs de una función específica:
```bash
vercel logs [deployment-url]
```

### Probar función localmente:
```bash
vercel dev
```

### Ver variables de entorno:
```bash
vercel env ls
```

### Ejecutar comandos en producción:
```bash
vercel exec -- python manage.py check
vercel exec -- python manage.py migrate --dry-run
vercel exec -- python manage.py collectstatic --dry-run
```

---

## 📝 Checklist de Verificación

Antes de hacer troubleshooting, verifica:

- [ ] `vercel.json` está en la raíz del directorio backend
- [ ] `requirements.txt` tiene todas las dependencias
- [ ] Variables de entorno están configuradas en Vercel
- [ ] Base de datos de Railway está activa
- [ ] CORS está configurado correctamente
- [ ] `ALLOWED_HOSTS` incluye `.vercel.app`

---

## 🆘 Si Nada Funciona

1. **Revisar logs detallados**:
```bash
vercel logs --follow --scope=tu-proyecto
```

2. **Probar despliegue local**:
```bash
vercel dev
```

3. **Verificar configuración paso a paso**:
   - Crear proyecto nuevo en Vercel
   - Subir solo `vercel.json` y `wsgi.py`
   - Agregar dependencias gradualmente

4. **Contactar soporte**:
   - Vercel tiene excelente documentación
   - Community en Discord
   - GitHub Issues

---

## 🎯 Configuración Mínima que Funciona

Si tienes problemas, usa esta configuración mínima:

**vercel.json**:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "finance_api/wsgi.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "finance_api/wsgi.py"
    }
  ]
}
```

**Variables de entorno mínimas**:
- `SECRET_KEY`
- `DEBUG=False`
- `DATABASE_URL`

Una vez que funcione, agrega configuraciones adicionales gradualmente.