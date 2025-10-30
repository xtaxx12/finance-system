# Fix para Deploy en Render

## Problema
El deploy se queda en "Uploading build..." después de completar exitosamente.

## Causa
Los scripts de build y start pueden no tener permisos de ejecución o el health check está fallando.

## Solución

### 1. Dar permisos de ejecución a los scripts

```bash
chmod +x backend/build.sh
chmod +x backend/start_render.sh
```

### 2. Commit y push

```bash
git add backend/build.sh backend/start_render.sh backend/render.yaml
git commit -m "Fix: Simplify Render deployment scripts and fix permissions"
git push
```

### 3. En Render Dashboard

1. **Cancelar el deploy actual** si sigue en "Building"
2. **Ir a Settings** del servicio
3. **Verificar configuración:**
   - Build Command: `./build.sh`
   - Start Command: `./start_render.sh`
   - Health Check Path: `/api/` (o crear uno específico)

4. **Hacer deploy manual:**
   - Click en "Manual Deploy" > "Deploy latest commit"

### 4. Verificar logs

Cuando inicie el nuevo deploy, monitorear los logs para ver:
- ✅ Build completado
- ✅ Migraciones ejecutadas
- ✅ Gunicorn iniciado
- ✅ Health check respondiendo

## Alternativa: Usar comandos directos

Si los scripts siguen fallando, en Render Settings usar:

**Build Command:**
```bash
pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate --noinput
```

**Start Command:**
```bash
gunicorn finance_api.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --timeout 120 --log-level info
```

## Verificar que funciona

Una vez desplegado, probar:
```bash
curl https://tu-app.onrender.com/api/
```

Debería responder con la lista de endpoints disponibles.

## Notas

- Los cambios en `backend/apps/loans/views.py` y `frontend/src/contexts/BalanceContext.js` están correctos
- El problema de $610.20 vs $366.20 se resolverá una vez que el backend esté desplegado
- Los logs de debugging en el frontend ayudarán a identificar si está usando localStorage o la API
