# Estructura del Proyecto - Sistema de Finanzas Personales

```
finance-system/
├── backend/                    # Django API
│   ├── finance_api/           # Proyecto Django principal
│   ├── apps/                  # Aplicaciones Django
│   │   ├── users/            # Gestión de usuarios
│   │   ├── transactions/     # Ingresos y gastos
│   │   ├── categories/       # Categorías de gastos
│   │   └── goals/           # Metas de ahorro
│   ├── requirements.txt
│   └── manage.py
├── frontend/                  # React SPA
│   ├── src/
│   │   ├── components/       # Componentes reutilizables
│   │   ├── pages/           # Páginas principales
│   │   ├── services/        # API calls
│   │   └── utils/           # Utilidades
│   ├── package.json
│   └── public/
├── database/                 # Scripts SQL
│   └── schema.sql
└── README.md
```