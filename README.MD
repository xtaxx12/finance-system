# 🪙 Sistema de Gestión de Finanzas Personales

✅ **PROYECTO COMPLETADO** - Aplicación web funcional para gestionar finanzas personales, visualizar hábitos de gasto y alcanzar metas de ahorro.

## 🎉 Estado del Proyecto: TERMINADO ✨

La aplicación está **100% funcional** y lista para usar. Incluye:
- ✅ Backend completo con Django + PostgreSQL
- ✅ Frontend moderno con React
- ✅ Dashboard interactivo con gráficas
- ✅ Gestión completa de ingresos y gastos
- ✅ Sistema de metas de ahorro
- ✅ **NUEVO**: Sistema completo de préstamos y deudas
- ✅ **NUEVO**: Balance inteligente considerando deudas
- ✅ **NUEVO**: Diseño responsivo con menú hamburguesa
- ✅ Recomendaciones inteligentes
- ✅ Autenticación de usuarios
- ✅ Dockerización completa

---

## ✨ Características Principales

### 1. Gestión de Ingresos y Gastos
- **Registro de Ingresos**
  - Permitir registrar sueldos o ingresos mensuales.
  - Incluir monto y fecha de recepción (fecha fija o recurrente).
- **Registro de Gastos**
  - Permitir registrar gastos únicos o recurrentes.
  - Cada gasto tendrá monto, fecha y categoría (Comida, Transporte, Vivienda, Ocio, etc.).

### 2. Dashboard y Visualización de Datos
- **Dashboard Principal**
  - Resumen mensual con:
    - Ingresos totales.
    - Gastos totales.
    - Balance (Ingresos - Gastos).
- **Gráficas Interactivas**
  - **Gráfico circular (Pie Chart):** distribución de gastos por categoría.
  - **Gráfico de barras/líneas:** evolución de ingresos y gastos en el tiempo.

### 3. Metas de Ahorro
- **Creación de Metas**
  - Definir un monto objetivo y, opcionalmente, fecha límite.
  - Ejemplo: "Ahorrar $1,500 para vacaciones".
- **Seguimiento de Progreso**
  - Barra de progreso o porcentaje.
- **Recomendaciones Inteligentes**
  - Cálculo de cuota de ahorro mensual para cumplir la meta en el plazo deseado.
  - Ejemplo: Ahorrar $1500 en 10 meses → $150/mes.

### 4. Sistema de Préstamos y Deudas 🏦 **NUEVO**
- **Gestión Completa de Préstamos**
  - Crear préstamos con nombre, monto total, número de cuotas y fecha
  - Descripción opcional para detalles adicionales
  - Seguimiento visual del progreso con barras animadas
  - Estados: En progreso / Completado
- **Registro de Pagos Individuales**
  - Agregar pagos con monto y fecha específica
  - Historial completo de todos los pagos realizados
  - Cálculo automático de cuotas restantes
- **Cálculos Automáticos**
  - Monto por cuota (distribución equitativa)
  - Total pagado hasta la fecha
  - Monto restante por pagar
  - Porcentaje de progreso completado
- **Integración Inteligente con Balance**
  - Balance real considerando deudas pendientes
  - Alertas visuales cuando el balance no cubre las deudas
  - Ratio deuda/ingresos para análisis financiero

### 5. Recomendaciones para Ahorrar
- Análisis automático de gastos con consejos personalizados.
- Ejemplo: "Tu gasto en *Comida a domicilio* representa el 25% de tus gastos. Reduciendo un 10% ahorrarías $X."

---

## 💻 Stack Tecnológico y Arquitectura

- **Base de Datos:** PostgreSQL (fiable, escalable, ideal para datos financieros).
- **Backend:** API REST con un framework moderno:
  - Opción A: Django (Python)
- **Frontend:** SPA (Single Page Application) con:
  - React

---

## 🎨 Interfaz de Usuario (UI) / Experiencia de Usuario (UX)

- **Diseño limpio y moderno**: tipografía clara, espacios en blanco, paleta coherente.
- **Navegación sencilla**: acceso directo al Dashboard, Gastos y Metas desde un menú principal.
- **Responsivo**: óptimo en escritorio y móviles.
- **Formularios simples**: agregar gastos/ingresos en pocos pasos.

---

## 🚀 Guía para la IA que construirá este proyecto

1. **Diseño del Esquema de la Base de Datos**
   - Tablas sugeridas:
     - `Usuarios`
     - `Ingresos`
     - `Gastos`
     - `Categorías`
     - `Metas_Ahorro`

2. **Desarrollo del Backend**
   - Implementar endpoints CRUD para todas las entidades.
   - Ejemplo:
     - `POST /ingresos`
     - `GET /gastos`
     - `PUT /metas/:id`
     - `DELETE /categorias/:id`

3. **Construcción del Frontend**
   - Componentes SPA conectados a la API.
   - Dashboard, gráficas, formularios para ingresos/gastos/metas.

4. **Implementación de la Lógica de Negocio**
   - Cálculo de balance mensual.
   - Recomendaciones de ahorro.
   - Seguimiento de metas.

---

## 📦 Resultado esperado

Una **aplicación web funcional, atractiva y desplegable** que permita:
- Registrar ingresos y gastos.
- Visualizar el estado financiero con gráficas.
- Establecer y cumplir metas de ahorro.
- Recibir recomendaciones personalizadas para mejorar las finanzas.

---

---

## 🚀 Instalación Rápida

### Opción 1: Docker (Recomendado) 🐳
```bash
# Clonar el repositorio
git clone <tu-repo>
cd finance-system

# Construir y ejecutar con Docker
docker-compose build
docker-compose up -d

# Verificar que los servicios estén funcionando
docker-compose ps

# La aplicación estará disponible en:
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# Base de datos: PostgreSQL en puerto 5432
```

### Configuración Inicial
```bash
# Crear superusuario para el admin (opcional)
docker-compose exec backend python manage.py createsuperuser

# Ver logs si hay problemas
docker-compose logs backend
docker-compose logs frontend
```

### Opción 2: Instalación Manual
Ver archivo `setup_instructions.md` para instrucciones detalladas.

## 📱 Capturas de Pantalla

### Dashboard Principal 📊
- Resumen mensual de ingresos, gastos y balance
- **NUEVO**: Métrica de deudas pendientes
- **NUEVO**: Balance disponible real (considerando deudas)
- **NUEVO**: Alertas de balance insuficiente
- Gráfico circular de gastos por categoría
- Gráfico de barras de evolución mensual
- Recomendaciones personalizadas de ahorro

### Gestión de Transacciones 💳
- Registro de ingresos y gastos
- Categorización automática
- Soporte para transacciones recurrentes
- Historial completo con filtros

### Metas de Ahorro 🎯
- Creación de metas personalizadas
- Seguimiento visual del progreso
- Cálculo automático de ahorro mensual sugerido
- Notificaciones de logros

### Sistema de Préstamos 🏦 **NUEVO**
- Interfaz moderna para gestión de préstamos
- Formularios intuitivos para crear préstamos
- Registro rápido de pagos
- Visualización de progreso con barras animadas
- Historial detallado de pagos
- Estados visuales (completado/en progreso)

### Diseño Responsivo 📱 **NUEVO**
- Menú hamburguesa animado para móviles
- Adaptación automática a diferentes tamaños de pantalla
- Navegación optimizada para touch
- Formularios responsivos

## 🛠️ Tecnologías Utilizadas

**Backend:**
- Django 4.2 + Django REST Framework
- PostgreSQL con Docker
- Python 3.9+
- **NUEVO**: drf-nested-routers para APIs anidadas
- **NUEVO**: Modelos de préstamos y pagos

**Frontend:**
- React 18
- Chart.js para gráficas
- Axios para API calls
- React Router para navegación
- **NUEVO**: Context API para balance inteligente
- **NUEVO**: Servicios API para préstamos

**Infraestructura:**
- Docker & Docker Compose
- PostgreSQL containerizado
- CORS configurado
- Variables de entorno
- **NUEVO**: Healthchecks para servicios

## 📊 Funcionalidades Implementadas

### ✅ Gestión de Usuarios
- Registro y autenticación
- Perfil de usuario
- Sesiones seguras

### ✅ Transacciones Financieras
- **Ingresos**: Registro con fecha y descripción
- **Gastos**: Categorización, montos, fechas
- **Recurrentes**: Soporte para transacciones periódicas
- **CRUD completo**: Crear, leer, actualizar, eliminar

### ✅ Dashboard Inteligente
- **Resumen mensual**: Ingresos, gastos, balance
- **Gráfico circular**: Distribución de gastos por categoría
- **Gráfico de barras**: Evolución de 6 meses
- **Recomendaciones**: Análisis automático de gastos

### ✅ Metas de Ahorro
- **Creación flexible**: Monto objetivo, fecha límite opcional
- **Seguimiento visual**: Barra de progreso animada
- **Cálculos automáticos**: Ahorro mensual sugerido
- **Gestión de ahorros**: Agregar dinero a las metas

### ✅ Sistema de Préstamos y Deudas 🏦 **NUEVO**
- **Gestión completa**: Crear, editar y eliminar préstamos
- **Formularios intuitivos**: Nombre, monto, cuotas, fecha, descripción
- **Seguimiento de pagos**: Registrar pagos individuales con historial completo
- **Cálculos automáticos**: Progreso, montos restantes, cuotas pagadas
- **Integración con balance**: Balance real considerando deudas pendientes
- **Visualización clara**: Barras de progreso animadas, estados, alertas
- **API REST completa**: Endpoints para CRUD de préstamos y pagos
- **Validaciones**: Montos mínimos, fechas válidas, integridad de datos

### ✅ Diseño Responsivo 📱 **NUEVO**
- **Menú hamburguesa**: Navegación móvil con animaciones suaves
- **Grid adaptable**: Layouts que se ajustan automáticamente
- **Formularios responsivos**: Optimizados para pantallas táctiles
- **Breakpoints**: Móvil (≤768px), Tablet (769-1024px), Desktop (≥1025px)
- **Interacciones táctiles**: Botones y elementos optimizados para móvil

### ✅ Categorías Predefinidas
- Comida, Transporte, Vivienda, Ocio, Salud, Educación, Ropa, Otros
- Colores e iconos personalizados
- Extensible para futuras categorías

## 🎯 Casos de Uso Cubiertos

1. **Usuario nuevo**: Se registra → Ve dashboard vacío → Agrega ingresos/gastos → Ve gráficas
2. **Seguimiento mensual**: Revisa dashboard → Analiza gastos por categoría → Recibe recomendaciones
3. **Planificación**: Crea meta de ahorro → Agrega dinero periódicamente → Alcanza objetivo
4. **Análisis histórico**: Ve evolución de 6 meses → Identifica patrones → Mejora hábitos
5. **Gestión de deudas** 🏦 **NUEVO**: Registra préstamo → Hace pagos periódicos → Ve progreso → Completa pago
6. **Control financiero** 💰 **NUEVO**: Ve balance real → Considera deudas → Toma decisiones informadas
7. **Uso móvil** 📱 **NUEVO**: Accede desde móvil → Usa menú hamburguesa → Gestiona finanzas en movimiento

## 🔧 API Endpoints

```
Authentication:
POST /api/auth/register/
POST /api/auth/login/
POST /api/auth/logout/
GET  /api/auth/profile/

Transactions:
GET  /api/transactions/ingresos/
POST /api/transactions/ingresos/
GET  /api/transactions/gastos/
POST /api/transactions/gastos/
GET  /api/transactions/gastos/dashboard/

Goals:
GET  /api/goals/
POST /api/goals/
POST /api/goals/{id}/add_savings/

Loans: 🏦 **NUEVO**
GET    /api/loans/                    # Listar préstamos
POST   /api/loans/                    # Crear préstamo
GET    /api/loans/{id}/               # Obtener préstamo específico
PUT    /api/loans/{id}/               # Actualizar préstamo
DELETE /api/loans/{id}/               # Eliminar préstamo
GET    /api/loans/summary/            # Resumen de préstamos
POST   /api/loans/{id}/add_payment/   # Agregar pago
GET    /api/loans/{id}/payments/      # Obtener pagos del préstamo
GET    /api/loan-payments/            # Listar todos los pagos
DELETE /api/loan-payments/{id}/       # Eliminar pago específico

Categories:
GET  /api/categories/
```

## 🎨 Diseño y UX

- **Diseño limpio**: Paleta de colores coherente, espacios en blanco
- **Navegación intuitiva**: Menú principal con acceso directo
- **Responsivo completo** 📱 **NUEVO**: 
  - Menú hamburguesa animado para móviles
  - Grid adaptable que se reorganiza automáticamente
  - Formularios optimizados para pantallas táctiles
  - Breakpoints específicos para diferentes dispositivos
- **Formularios simples**: Pocos campos, validación en tiempo real
- **Feedback visual**: Notificaciones toast, colores semánticos
- **Animaciones suaves** ✨ **NUEVO**: 
  - Transiciones en menú hamburguesa
  - Barras de progreso animadas
  - Efectos hover mejorados
  - Fade-in y slide-in para elementos

## 📈 Métricas y Análisis

- **Balance mensual**: Ingresos - Gastos
- **Balance real** 💰 **NUEVO**: Balance considerando deudas pendientes
- **Distribución por categoría**: Porcentajes y montos
- **Tendencias**: Evolución de 6 meses
- **Recomendaciones**: Basadas en patrones de gasto
- **Progreso de metas**: Porcentaje completado, tiempo restante
- **Análisis de deudas** 🏦 **NUEVO**:
  - Total adeudado vs. balance disponible
  - Progreso de pago por préstamo
  - Ratio deuda/ingresos
  - Alertas de balance insuficiente
  - Proyección de pagos completados

## 🔒 Seguridad

- Autenticación basada en sesiones
- CSRF protection habilitado
- Validación de datos en backend y frontend
- Permisos por usuario (cada usuario ve solo sus datos)

## 🚀 Próximas Mejoras (Opcionales)

### Funcionalidades Avanzadas
- [ ] Exportar datos a Excel/PDF
- [ ] Notificaciones push para metas y pagos de préstamos
- [ ] Categorías personalizadas por usuario
- [ ] Presupuestos mensuales con alertas
- [ ] Integración con bancos (Open Banking API)
- [ ] Calculadora de intereses compuestos
- [ ] Reportes financieros avanzados

### Mejoras de UX/UI
- [ ] Modo oscuro completo
- [ ] Temas personalizables
- [ ] Aplicación móvil nativa (React Native)
- [ ] PWA (Progressive Web App)
- [ ] Accesibilidad mejorada (WCAG)

### Funcionalidades de Préstamos
- [ ] Recordatorios de pagos próximos
- [ ] Cálculo de intereses variables
- [ ] Amortización de préstamos
- [ ] Comparador de préstamos
- [ ] Exportar cronograma de pagos

## 🏦 Guía Rápida: Sistema de Préstamos

### Crear un Préstamo
1. Ve a `http://localhost:3000/loans`
2. Haz clic en "➕ Agregar Préstamo"
3. Completa los campos:
   - **Nombre**: Ej. "Préstamo personal", "Tarjeta de crédito"
   - **Monto total**: Cantidad total adeudada
   - **Número de cuotas**: Cuántas cuotas planeas pagar
   - **Fecha**: Cuándo se hizo el préstamo
   - **Descripción**: Detalles adicionales (opcional)

### Registrar Pagos
1. En la tarjeta del préstamo, haz clic en "💰 Pagar"
2. Ingresa el monto del pago y la fecha
3. El sistema actualizará automáticamente:
   - Progreso del préstamo
   - Monto restante
   - Balance disponible en el dashboard

### Características Destacadas
- ✅ **Cálculos automáticos**: Progreso, cuotas restantes, montos
- ✅ **Visualización clara**: Barras de progreso, estados, colores
- ✅ **Historial completo**: Todos los pagos con fechas y montos
- ✅ **Integración total**: Balance real en dashboard
- ✅ **Responsivo**: Funciona perfecto en móviles

## 🔧 Solución de Problemas

### Docker
```bash
# Si los contenedores no inician
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Ver logs de errores
docker-compose logs backend
docker-compose logs frontend

# Reiniciar servicios específicos
docker-compose restart backend
```

### Base de Datos
```bash
# Aplicar migraciones manualmente
docker-compose exec backend python manage.py migrate

# Crear superusuario
docker-compose exec backend python manage.py createsuperuser
```

### Frontend
```bash
# Si hay problemas con dependencias
docker-compose exec frontend npm install
docker-compose restart frontend
```

---

## 👨‍💻 Desarrollado por Joel Rojas

### 📋 Changelog v2.0 - Sistema de Préstamos
- ✅ **Nuevo**: Sistema completo de préstamos y deudas
- ✅ **Nuevo**: Balance inteligente considerando deudas
- ✅ **Nuevo**: Diseño responsivo con menú hamburguesa
- ✅ **Nuevo**: API REST para préstamos con validaciones
- ✅ **Nuevo**: Context API para balance en tiempo real
- ✅ **Mejorado**: Dashboard con métricas de deudas
- ✅ **Mejorado**: Navegación móvil optimizada
- ✅ **Mejorado**: Animaciones y transiciones suaves
