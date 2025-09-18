# 🏦 Sistema de Préstamos y Deudas

## Funcionalidades Implementadas

### ✅ Backend (Django REST API)
- **Modelos**: `Loan` y `LoanPayment` con relaciones apropiadas
- **API REST**: Endpoints completos para CRUD de préstamos y pagos
- **Validaciones**: Montos mínimos, fechas válidas, etc.
- **Cálculos automáticos**: Progreso, montos restantes, cuotas pagadas
- **Admin interface**: Panel de administración para gestionar préstamos

### ✅ Frontend (React)
- **Página de préstamos**: Interfaz completa para gestionar préstamos
- **Formularios**: Agregar préstamos y registrar pagos
- **Visualización**: Progreso visual, historial de pagos
- **Integración**: Balance actualizado considerando deudas
- **Responsivo**: Diseño adaptable a móviles con menú hamburguesa

### ✅ Características Principales

#### Gestión de Préstamos
- ➕ **Crear préstamo**: Nombre, monto, número de cuotas, fecha, descripción
- 📊 **Seguimiento**: Progreso visual con barras de progreso
- 💰 **Pagos**: Registrar pagos individuales con fecha y monto
- 📈 **Cálculos automáticos**: 
  - Monto por cuota
  - Total pagado
  - Monto restante
  - Porcentaje de progreso
  - Estado (completado/en progreso)

#### Dashboard Integrado
- 🏦 **Métrica de deudas**: Nueva tarjeta en el dashboard
- ⚖️ **Balance disponible**: Balance real considerando deudas
- ⚠️ **Alertas**: Notificaciones cuando el balance no cubre las deudas
- 📊 **Ratio deuda/ingresos**: Indicador financiero importante

#### Diseño Responsivo
- 📱 **Menú hamburguesa**: Navegación móvil mejorada
- 🎨 **Adaptable**: Diseño que se ajusta a diferentes tamaños de pantalla
- 🖱️ **Interactivo**: Animaciones y efectos hover

## 🚀 Cómo usar

### 1. Configuración inicial
```bash
# Ejecutar el script de configuración
python setup_loans.py
```

### 2. Acceder a la funcionalidad
- Ve a `http://localhost:3000/loans`
- Usa el menú de navegación "🏦 Préstamos"

### 3. Crear un préstamo
1. Haz clic en "➕ Agregar Préstamo"
2. Completa los campos:
   - **Nombre**: Ej. "Préstamo personal", "Tarjeta de crédito"
   - **Monto total**: Cantidad total adeudada
   - **Número de cuotas**: Cuántas cuotas planeas pagar
   - **Fecha**: Cuándo se hizo el préstamo
   - **Descripción**: Detalles adicionales (opcional)

### 4. Registrar pagos
1. En la tarjeta del préstamo, haz clic en "💰 Pagar"
2. Ingresa el monto del pago y la fecha
3. El sistema actualizará automáticamente:
   - Progreso del préstamo
   - Monto restante
   - Balance disponible

## 🔧 API Endpoints

### Préstamos
- `GET /api/loans/` - Listar préstamos
- `POST /api/loans/` - Crear préstamo
- `GET /api/loans/{id}/` - Obtener préstamo específico
- `PUT /api/loans/{id}/` - Actualizar préstamo
- `DELETE /api/loans/{id}/` - Eliminar préstamo
- `GET /api/loans/summary/` - Resumen de préstamos
- `POST /api/loans/{id}/add_payment/` - Agregar pago

### Pagos
- `GET /api/loan-payments/` - Listar todos los pagos
- `DELETE /api/loan-payments/{id}/` - Eliminar pago

## 📱 Características Responsivas

### Móvil (≤ 768px)
- Menú hamburguesa animado
- Tarjetas de préstamos en columna única
- Formularios adaptados para pantallas pequeñas
- Botones de tamaño completo

### Tablet (769px - 1024px)
- Grid de 2 columnas para métricas
- Navegación híbrida

### Desktop (≥ 1025px)
- Grid completo de 4 columnas
- Navegación horizontal completa
- Máximo aprovechamiento del espacio

## 🎨 Mejoras Visuales

### Animaciones
- Fade-in para elementos que aparecen
- Slide-in para elementos de navegación
- Hover effects en botones y tarjetas
- Transiciones suaves en el menú hamburguesa

### Colores y Temas
- Soporte completo para modo oscuro/claro
- Colores específicos para estados:
  - 🟢 Verde: Préstamos completados
  - 🟡 Amarillo: Deudas pendientes
  - 🔴 Rojo: Alertas de balance insuficiente
  - 🔵 Azul: Información general

## 🔮 Próximas Mejoras Sugeridas

1. **Notificaciones**: Recordatorios de pagos próximos
2. **Reportes**: Exportar historial de pagos
3. **Categorías**: Tipos de préstamos (personal, hipoteca, etc.)
4. **Intereses**: Cálculo de intereses compuestos
5. **Gráficos**: Visualización de tendencias de pago
6. **Calendario**: Vista de calendario para pagos programados

## 🐛 Solución de Problemas

### Error de migración
```bash
cd backend
python manage.py makemigrations loans
python manage.py migrate
```

### Error de dependencias
```bash
pip install drf-nested-routers==0.93.4
```

### Error de CORS
Verifica que el frontend esté corriendo en `http://localhost:3000`

## 📞 Soporte

Si encuentras algún problema:
1. Verifica que ambos servidores estén corriendo
2. Revisa la consola del navegador para errores
3. Verifica los logs del servidor Django
4. Asegúrate de que las migraciones estén aplicadas