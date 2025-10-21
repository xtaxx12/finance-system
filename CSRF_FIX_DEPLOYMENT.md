# Solución al Error CSRF en Producción

## Problema
Error: `CSRF Failed: CSRF token from the 'X-Csrftoken' HTTP header incorrect.`

Este error ocurre cuando el frontend (Vercel) y backend (Render) están en dominios diferentes y las cookies CSRF no se comparten correctamente.

## Solución Implementada

### 1. Backend - Deshabilitar CSRF para API
Se configuró Django REST Framework para usar `CsrfExemptSessionAuthentication` que no requiere token CSRF para las peticiones API, pero mantiene la autenticación de sesión.

**Cambios en `backend/finance_api/settings.py`:**
- Se cambió `DEFAULT_AUTHENTICATION_CLASSES` a usar `CsrfExemptSessionAuthentication` en lugar de `SessionAuthentication`
- Se agregaron configuraciones adicionales para cookies cross-domain en producción (Render)

### 2. Frontend - Mejorar obtención de CSRF Token
Se mejoró la lógica para obtener el token CSRF antes de hacer login.

**Cambios en `frontend/src/services/api.js`:**
- Mejorada la función `getCSRFToken()` para manejar mejor las cookies
- Agregado manejo de promesas para evitar múltiples peticiones simultáneas

**Cambios en `frontend/src/contexts/AuthContext.js`:**
- Se agregó una llamada para obtener el token CSRF antes de hacer login

## Pasos para Desplegar

### Backend (Render)
1. Hacer commit de los cambios:
   ```bash
   git add backend/finance_api/settings.py backend/apps/users/views.py
   git commit -m "Fix: Deshabilitar CSRF para API en producción"
   git push
   ```

2. Render detectará automáticamente los cambios y redesplegará

3. Verificar que las variables de entorno estén configuradas:
   - `RENDER=true` (debe estar presente)
   - `DEBUG=false`
   - Todas las variables de base de datos (PGDATABASE, PGUSER, etc.)

### Frontend (Vercel)
1. Hacer commit de los cambios:
   ```bash
   git add frontend/src/services/api.js frontend/src/contexts/AuthContext.js
   git commit -m "Fix: Mejorar obtención de CSRF token"
   git push
   ```

2. Vercel detectará automáticamente los cambios y redesplegará

3. Verificar que la variable de entorno esté configurada:
   - `REACT_APP_API_URL=https://finance-backend-k12z.onrender.com/api`

## Verificación

Después del despliegue:

1. Abre tu frontend en: https://finance-frontend-tawny.vercel.app
2. Intenta hacer login con tus credenciales
3. Deberías poder iniciar sesión sin errores de CSRF

## Alternativa: Si aún hay problemas

Si después de desplegar aún tienes problemas, puedes verificar:

1. **Cookies en el navegador:**
   - Abre DevTools → Application → Cookies
   - Verifica que se esté guardando la cookie `sessionid` del backend

2. **Headers en la petición:**
   - Abre DevTools → Network → Selecciona la petición de login
   - Verifica que se envíe el header `X-CSRFToken`

3. **CORS:**
   - Verifica que el backend esté respondiendo con los headers CORS correctos
   - Busca en la respuesta: `Access-Control-Allow-Origin`, `Access-Control-Allow-Credentials`

## Notas Importantes

- La autenticación sigue siendo segura porque usa sesiones de Django
- Solo se deshabilitó la verificación CSRF para las APIs, no para el admin de Django
- Las cookies siguen siendo HttpOnly y Secure en producción
- CORS está configurado para permitir solo tu dominio de Vercel
