# Guía Rápida de Testing

## Instalación

```bash
cd backend
pip install -r requirements.txt
```

## Ejecutar Tests

### Comando Básico
```bash
pytest
```

### Con Cobertura
```bash
pytest --cov=apps --cov-report=html --cov-report=term-missing
```

### Solo Tests Rápidos
```bash
pytest -m "not slow"
```

### Tests de una App Específica
```bash
pytest apps/transactions/tests/
pytest apps/goals/tests/
pytest apps/budgets/tests/
pytest apps/loans/tests/
```

### Ver Reporte HTML
```bash
# Windows
start htmlcov\index.html

# Mac/Linux
open htmlcov/index.html
```

## Resultados Actuales

- ✅ **110 de 116 tests pasando (95%)**
- ✅ **82% de cobertura de código**
- ⚠️ 6 tests requieren ajuste menor de endpoints

## Estructura de Tests

```
backend/apps/
├── transactions/tests/
│   ├── test_models.py       (15 tests)
│   ├── test_serializers.py  (12 tests)
│   ├── test_views.py        (10 tests)
│   └── test_api.py          (19 tests)
├── goals/tests/
│   ├── test_models.py       (7 tests)
│   └── test_api.py          (8 tests)
├── budgets/tests/
│   ├── test_models.py       (7 tests)
│   └── test_api.py          (5 tests)
├── loans/tests/
│   ├── test_models.py       (4 tests)
│   └── test_api.py          (5 tests)
└── users/tests/
    └── test_api.py          (9 tests)
```

## Tips

- Usa `pytest -v` para ver nombres de tests
- Usa `pytest -x` para parar en el primer fallo
- Usa `pytest --lf` para ejecutar solo tests que fallaron
- Usa `pytest -k "nombre_test"` para filtrar por nombre

## Más Información

Ver `TESTING_SUMMARY.md` para detalles completos.
