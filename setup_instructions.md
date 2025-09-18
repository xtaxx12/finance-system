# 🚀 Instrucciones de Instalación - Sistema de Finanzas Personales

## Requisitos Previos

- Python 3.8+
- Node.js 16+
- PostgreSQL 12+
- Git

## 1. Configuración de la Base de Datos

### Instalar PostgreSQL
```bash
# Windows (usando Chocolatey)
choco install postgresql

# O descargar desde: https://www.postgresql.org/download/windows/
```

### Crear la base de datos
```sql
-- Conectar a PostgreSQL como superusuario
psql -U postgres

-- Crear base de datos
CREATE DATABASE finance_db;

-- Crear usuario (opcional)
CREATE USER finance_user WITH PASSWORD 'password123';
GRANT ALL PRIVILEGES ON DATABASE finance_db TO finance_user;

-- Salir
\q
```

### Ejecutar el schema
```bash
psql -U postgres -d finance_db -f database/schema.sql
```

## 2. Configuración del Backend (Django)

### Navegar al directorio backend
```bash
cd backend
```

### Crear entorno virtual
```bash
python -m venv venv

# Activar entorno virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate
```

### Instalar dependencias
```bash
pip install -r requirements.txt
```

### Configurar variables de entorno
```bash
# Copiar archivo de ejemplo
copy .env.example .env

# Editar .env con tus configuraciones:
# DB_NAME=finance_db
# DB_USER=postgres
# DB_PASSWORD=tu_password
# DB_HOST=localhost
# DB_PORT=5432
# SECRET_KEY=tu_secret_key_aqui
# DEBUG=True
```

### Ejecutar migraciones
```bash
python manage.py makemigrations
python manage.py migrate
```

### Crear superusuario (opcional)
```bash
python manage.py createsuperuser
```

### Ejecutar servidor de desarrollo
```bash
python manage.py runserver
```

El backend estará disponible en: http://localhost:8000

## 3. Configuración del Frontend (React)

### Abrir nueva terminal y navegar al directorio frontend
```bash
cd frontend
```

### Instalar dependencias
```bash
npm install
```

### Ejecutar servidor de desarrollo
```bash
npm start
```

El frontend estará disponible en: http://localhost:3000

## 4. Verificación de la Instalación

1. **Backend**: Visita http://localhost:8000/admin para acceder al panel de administración
2. **Frontend**: Visita http://localhost:3000 para acceder a la aplicación
3. **API**: Prueba http://localhost:8000/api/categories/ para verificar que la API funciona

## 5. Uso de la Aplicación

### Registro de Usuario
1. Ve a http://localhost:3000/register
2. Crea una nueva cuenta
3. Serás redirigido automáticamente al dashboard

### Funcionalidades Principales
- **Dashboard**: Visualiza resumen financiero y gráficas
- **Transacciones**: Registra ingresos y gastos
- **Metas**: Crea y gestiona metas de ahorro

## 6. Estructura de la API

### Endpoints Principales
```
POST /api/auth/register/          # Registro de usuario
POST /api/auth/login/             # Login
POST /api/auth/logout/            # Logout
GET  /api/auth/profile/           # Perfil del usuario

GET  /api/categories/             # Listar categorías

GET  /api/transactions/ingresos/  # Listar ingresos
POST /api/transactions/ingresos/  # Crear ingreso
GET  /api/transactions/gastos/    # Listar gastos
POST /api/transactions/gastos/    # Crear gasto
GET  /api/transactions/gastos/dashboard/  # Datos del dashboard

GET  /api/goals/                  # Listar metas
POST /api/goals/                  # Crear meta
POST /api/goals/{id}/add_savings/ # Agregar ahorro a meta
```

## 7. Solución de Problemas Comunes

### Error de conexión a la base de datos
- Verificar que PostgreSQL esté ejecutándose
- Revisar credenciales en el archivo .env
- Verificar que la base de datos existe

### Error CORS en el frontend
- Verificar que el backend esté ejecutándose en el puerto 8000
- Revisar configuración CORS en settings.py

### Dependencias faltantes
```bash
# Backend
pip install -r requirements.txt

# Frontend
npm install
```

## 8. Datos de Prueba

Las categorías se insertan automáticamente al ejecutar el schema SQL. Para agregar datos de prueba:

1. Registra un usuario
2. Agrega algunos ingresos y gastos
3. Crea metas de ahorro
4. Explora el dashboard con gráficas

## 9. Producción

Para desplegar en producción:

1. Configurar DEBUG=False en settings.py
2. Configurar base de datos de producción
3. Ejecutar `npm run build` en el frontend
4. Configurar servidor web (nginx, apache)
5. Usar gunicorn para el backend Django

¡Tu sistema de finanzas personales está listo para usar! 🎉