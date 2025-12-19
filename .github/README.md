# 🔄 CI/CD Pipeline Documentation

## Overview

Este documento describe la configuración de CI/CD implementada para el proyecto **Finance System**.

## 📁 Estructura de Archivos

```
.github/
├── workflows/
│   ├── ci.yml           # Pipeline principal de CI
│   ├── security.yml     # Análisis de seguridad
│   ├── docker.yml       # Build y push de imágenes Docker
│   └── release.yml      # Release automático
├── dependabot.yml       # Actualización automática de dependencias
├── CODEOWNERS           # Propietarios del código
└── pull_request_template.md  # Template para PRs

frontend/
├── playwright.config.js # Configuración de Playwright
└── e2e/
    ├── fixtures.js      # Fixtures compartidos
    ├── auth.spec.js     # Tests de autenticación
    ├── dashboard.spec.js    # Tests del dashboard
    ├── transactions.spec.js # Tests de transacciones
    ├── api-integration.spec.js  # Tests de integración API
    ├── accessibility.spec.js    # Tests de accesibilidad
    └── performance.spec.js      # Tests de rendimiento
```

## 🔄 Workflows

### 1. CI Pipeline (`ci.yml`)

**Trigger:** Push a `main`, `develop`, `feature/*` y PRs

**Jobs:**
| Job | Descripción |
|-----|-------------|
| `changes` | Detecta archivos modificados para optimizar ejecución |
| `backend-lint` | Linting del backend (Black, isort, Flake8) |
| `backend-test` | Tests unitarios con pytest y coverage |
| `frontend-lint` | ESLint para el frontend |
| `frontend-build` | Build de producción del frontend |
| `e2e-tests` | Tests E2E con Playwright |
| `ci-summary` | Resumen del estado de CI |

### 2. Security Analysis (`security.yml`)

**Trigger:** Push a `main`/`develop`, PRs, y diariamente a las 2:00 AM UTC

**Jobs:**
| Job | Descripción |
|-----|-------------|
| `codeql` | Análisis estático con CodeQL (JS/Python) |
| `dependency-check` | Escaneo de vulnerabilidades en dependencias |
| `secret-scan` | Detección de secretos (Gitleaks, TruffleHog) |
| `container-scan` | Escaneo de imágenes Docker (Trivy) |
| `sast` | Análisis SAST con Bandit |

### 3. Docker Build (`docker.yml`)

**Trigger:** Push a `main`, tags `v*.*.*`, y PRs con cambios en Docker

**Jobs:**
| Job | Descripción |
|-----|-------------|
| `build-backend` | Build y push imagen del backend |
| `build-frontend` | Build y push imagen del frontend |
| `test-compose` | Test de docker-compose (solo en PRs) |

### 4. Release (`release.yml`)

**Trigger:** Push a `main` o manual

**Funcionalidad:**
- Semantic versioning automático basado en commits
- Generación de changelog
- Creación de GitHub Release

## 🧪 Tests E2E

### Ejecutar Tests Localmente

```bash
# Navegar al frontend
cd frontend

# Instalar dependencias (si no están instaladas)
npm install

# Instalar navegadores de Playwright
npx playwright install

# Ejecutar todos los tests
npm run test:e2e

# Ejecutar con UI modo interactivo
npm run test:e2e:ui

# Ejecutar en modo headed (ver navegador)
npm run test:e2e:headed

# Ejecutar solo en Chromium
npm run test:e2e:chromium

# Debug mode
npm run test:e2e:debug

# Ver reporte
npm run test:e2e:report
```

### Tipos de Tests E2E

| Archivo | Descripción |
|---------|-------------|
| `auth.spec.js` | Login, registro, validaciones de autenticación |
| `dashboard.spec.js` | Carga del dashboard, responsividad, assets |
| `transactions.spec.js` | CRUD de ingresos y gastos |
| `api-integration.spec.js` | Health checks de API, CORS, endpoints |
| `accessibility.spec.js` | Accesibilidad (a11y): headings, labels, keyboard nav |
| `performance.spec.js` | Tiempos de carga, LCP, memory leaks |

## 🔐 Secretos Requeridos

Configura estos secretos en GitHub Settings → Secrets and variables → Actions:

| Secreto | Descripción | Requerido |
|---------|-------------|-----------|
| `GITHUB_TOKEN` | Automático - No necesita configuración | ✅ |
| `VITE_API_URL` | URL del backend en producción | Opcional |

## 🤖 Dependabot

Configurado para actualizar automáticamente:
- **Python dependencies** (semanalmente)
- **npm dependencies** (semanalmente)
- **GitHub Actions** (semanalmente)
- **Dockerfiles** (semanalmente)

## 📋 Flujo de Trabajo Recomendado

### Para Desarrolladores

1. Crear branch desde `develop`: `git checkout -b feature/mi-feature`
2. Desarrollar y hacer commits (usar [Conventional Commits](https://www.conventionalcommits.org/))
3. Ejecutar tests localmente: `npm run test:e2e`
4. Crear PR hacia `develop`
5. Esperar que CI pase
6. Solicitar code review

### Para Releases

1. Merge PRs aprobados a `develop`
2. Cuando listos para release, merge `develop` → `main`
3. El workflow de release se ejecuta automáticamente
4. Se crea tag y GitHub Release

## 📈 Badges para README

Añade estos badges al README principal:

```markdown
[![CI](https://github.com/USUARIO/finance-system/actions/workflows/ci.yml/badge.svg)](https://github.com/USUARIO/finance-system/actions/workflows/ci.yml)
[![Security](https://github.com/USUARIO/finance-system/actions/workflows/security.yml/badge.svg)](https://github.com/USUARIO/finance-system/actions/workflows/security.yml)
[![Docker](https://github.com/USUARIO/finance-system/actions/workflows/docker.yml/badge.svg)](https://github.com/USUARIO/finance-system/actions/workflows/docker.yml)
```

## 🛠️ Troubleshooting

### CI Falla en Tests E2E

1. Verificar que el backend está corriendo
2. Revisar logs de Playwright en artifacts
3. Ejecutar localmente: `npm run test:e2e:debug`

### Security Scan Reporta Vulnerabilidades

1. Revisar detalles en la pestaña Security de GitHub
2. Actualizar dependencias afectadas
3. Para falsos positivos, considerar configurar excepciones

### Docker Build Falla

1. Verificar Dockerfiles
2. Revisar logs detallados en GitHub Actions
3. Probar localmente: `docker-compose build`

---

**Última actualización:** 2025-12-19
**Autor:** Senior DevOps Engineer
