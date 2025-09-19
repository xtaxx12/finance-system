# Correcciones de CORS y CSRF

## Problemas Identificados

1. **CORS cross-domain**: Solicitudes bloqueadas entre dominios
2. **CSRF token faltante**: Token CSRF no se enviaba correctamente
3. **Cookies cross-domain**: Cookies no se configuraban correctamente para dominios diferentes
4. **Endpoint 404**: Endpoint de presupuesto no funcionaba correctamente

## Correcciones Implementadas

### Backend (Django)

1. **Endpoint CSRF Token** (`backend/apps/users/views.py`):
   ```python
   @api_view(['GET'])
   @permission_classes([AllowAny])
   @ensure_csrf_cookie
   def csrf_token_view(request):
       return Response({'csrfToken': get_token(request)})
   ```

2. **Configuración CORS mejorada** (`backend/finance_api/settings.py`):
   ```python
   CORS_ALLOW_ALL_ORIGINS = True  # Para producción
   CORS_ALLOW_CREDENTIALS = True
   CORS_ALLOW_ALL_HEADERS = True
   CORS_ALLOW_ALL_METHODS = True
   
   # Configuración de cookies cross-domain
   SESSION_COOKIE_SAMESITE = 'None'
   SESSION_COOKIE_SECURE = True
   CSRF_COOKIE_SAMESITE = 'None'
   CSRF_COOKIE_SECURE = True
   ```

3. **CSRF Trusted Origins**:
   ```python
   CSRF_TRUSTED_ORIGINS = [
       "https://finance-frontend-tawny.vercel.app",
       "https://*.vercel.app",
       "https://*.onrender.com",
   ]
   ```

4. **Corrección en Budget Views** (`backend/apps/budgets/views.py`):
   - Agregado import `from django.db.models import F`
   - Corregido uso de `models.F` por `F`

### Frontend (React)

1. **Servicio API mejorado** (`frontend/src/services/api.js`):
   ```javascript
   // Función para obtener CSRF token del servidor
   const fetchCSRFToken = async () => {
     const response = await axios.get(`${baseURL}/auth/csrf/`, {
       withCredentials: true,
     });
     return response.data.csrfToken;
   };
   
   // Interceptor mejorado para CSRF
   api.interceptors.request.use(async (config) => {
     if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase())) {
       const token = await getCSRFToken();
       if (token) {
         config.headers['X-CSRFToken'] = token;
       }
     }
     return config;
   });
   ```

2. **Hook para inicializar CSRF** (`frontend/src/hooks/useCSRF.js`):
   ```javascript
   const useCSRF = () => {
     useEffect(() => {
       const initializeCSRF = async () => {
         await axios.get(`${baseURL}/auth/csrf/`, {
           withCredentials: true,
         });
       };
       initializeCSRF();
     }, []);
   };
   ```

3. **API de Presupuestos** (`frontend/src/services/budgetApi.js`):
   - Servicio completo para manejar presupuestos
   - Manejo de errores 404 para presupuestos no existentes

## URLs Actualizadas

- **Backend**: https://finance-backend-k12z.onrender.com
- **Frontend**: https://finance-frontend-tawny.vercel.app
- **CSRF Endpoint**: https://finance-backend-k12z.onrender.com/api/auth/csrf/

## Verificaciones

1. **CSRF Token**: GET `/api/auth/csrf/`
2. **Presupuesto actual**: GET `/api/budgets/monthly/current_month/`
3. **Login**: POST `/api/auth/login/`
4. **Transacciones**: POST `/api/transactions/ingresos/`

## Próximos Pasos

1. Desplegar cambios en Render (automático)
2. Desplegar cambios en Vercel: `npx vercel --prod`
3. Probar funcionalidad completa
4. Monitorear logs para errores adicionales

## Comandos de Despliegue

```bash
# Frontend
cd frontend
npm run build
npx vercel --prod

# Backend se actualiza automáticamente en Render
```

## Troubleshooting

Si persisten los errores:

1. Verificar variables de entorno en Render
2. Revisar logs de Render para errores específicos
3. Verificar que las URLs estén correctas en `.env.production`
4. Limpiar caché del navegador
5. Verificar que las cookies se estén enviando correctamente