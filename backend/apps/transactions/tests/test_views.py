import pytest
from decimal import Decimal
from datetime import date
from django.utils import timezone
from apps.transactions.models import Income, Expense
from apps.transactions.views import IncomeViewSet, ExpenseViewSet


@pytest.mark.django_db
class TestIncomeViewSet:
    """Tests para IncomeViewSet"""

    def test_get_queryset_filters_by_user(self, user, another_user):
        """Verifica que get_queryset filtra por usuario"""
        Income.objects.create(
            usuario=user,
            monto=Decimal('100'),
            fecha=date(2024, 1, 1)
        )
        Income.objects.create(
            usuario=another_user,
            monto=Decimal('200'),
            fecha=date(2024, 1, 1)
        )

        from rest_framework.test import APIRequestFactory
        factory = APIRequestFactory()
        request = factory.get('/')
        request.user = user

        viewset = IncomeViewSet()
        viewset.request = request

        queryset = viewset.get_queryset()
        assert queryset.count() == 1
        assert queryset.first().usuario == user

    def test_requires_authentication(self, api_client):
        """Verifica que se requiere autenticación"""
        response = api_client.get('/api/transactions/ingresos/')
        assert response.status_code == 403  # Forbidden sin autenticación


@pytest.mark.django_db
class TestExpenseViewSet:
    """Tests para ExpenseViewSet"""

    def test_get_queryset_filters_by_user(self, user, another_user, category):
        """Verifica que get_queryset filtra por usuario"""
        Expense.objects.create(
            usuario=user,
            categoria=category,
            monto=Decimal('100'),
            fecha=date(2024, 1, 1)
        )
        Expense.objects.create(
            usuario=another_user,
            categoria=category,
            monto=Decimal('200'),
            fecha=date(2024, 1, 1)
        )

        from rest_framework.test import APIRequestFactory
        factory = APIRequestFactory()
        request = factory.get('/')
        request.user = user

        viewset = ExpenseViewSet()
        viewset.request = request

        queryset = viewset.get_queryset()
        assert queryset.count() == 1
        assert queryset.first().usuario == user

    def test_queryset_uses_select_related(self, user, category):
        """Verifica que get_queryset usa select_related para optimizar queries"""
        Expense.objects.create(
            usuario=user,
            categoria=category,
            monto=Decimal('100'),
            fecha=date(2024, 1, 1)
        )

        from rest_framework.test import APIRequestFactory
        factory = APIRequestFactory()
        request = factory.get('/')
        request.user = user

        viewset = ExpenseViewSet()
        viewset.request = request

        queryset = viewset.get_queryset()

        # Verificar que la query incluye select_related
        assert 'categoria' in str(queryset.query)

    def test_requires_authentication(self, api_client):
        """Verifica que se requiere autenticación"""
        response = api_client.get('/api/transactions/gastos/')
        assert response.status_code == 403


@pytest.mark.django_db
class TestBudgetUpdateLogic:
    """Tests para la lógica de actualización de presupuestos"""

    def test_update_budgets_after_expense_create(self, user, category):
        """Verifica que se actualizan presupuestos al crear gasto"""
        from apps.budgets.models import MonthlyBudget, CategoryBudget

        # Crear presupuesto mensual
        monthly_budget = MonthlyBudget.objects.create(
            usuario=user,
            año=2024,
            mes=1,
            presupuesto_total=Decimal('1000'),
            activo=True
        )

        # Crear presupuesto de categoría
        category_budget = CategoryBudget.objects.create(
            presupuesto_mensual=monthly_budget,
            categoria=category,
            limite_asignado=Decimal('500')
        )

        from rest_framework.test import APIRequestFactory
        factory = APIRequestFactory()
        request = factory.post('/')
        request.user = user

        viewset = ExpenseViewSet()
        viewset.request = request

        # Crear gasto
        expense = Expense.objects.create(
            usuario=user,
            categoria=category,
            monto=Decimal('100'),
            fecha=date(2024, 1, 15)
        )

        # Ejecutar actualización de presupuestos
        viewset.update_budgets_after_expense(expense)

        # Verificar que se actualizó el presupuesto
        monthly_budget.refresh_from_db()
        category_budget.refresh_from_db()

        assert monthly_budget.gastado_actual == Decimal('100')
        assert category_budget.gastado_actual == Decimal('100')

    def test_update_budgets_handles_missing_budget(self, user, category):
        """Verifica que no falla si no hay presupuesto configurado"""
        from rest_framework.test import APIRequestFactory
        factory = APIRequestFactory()
        request = factory.post('/')
        request.user = user

        viewset = ExpenseViewSet()
        viewset.request = request

        expense = Expense.objects.create(
            usuario=user,
            categoria=category,
            monto=Decimal('100'),
            fecha=date(2024, 1, 15)
        )

        # No debería lanzar excepción
        viewset.update_budgets_after_expense(expense)

    def test_recalculate_monthly_budget(self, user, category):
        """Verifica que recalculate_monthly_budget funciona correctamente"""
        from apps.budgets.models import MonthlyBudget

        monthly_budget = MonthlyBudget.objects.create(
            usuario=user,
            año=2024,
            mes=1,
            presupuesto_total=Decimal('1000'),
            activo=True
        )

        # Crear varios gastos
        Expense.objects.create(
            usuario=user,
            categoria=category,
            monto=Decimal('100'),
            fecha=date(2024, 1, 5)
        )
        Expense.objects.create(
            usuario=user,
            categoria=category,
            monto=Decimal('250'),
            fecha=date(2024, 1, 15)
        )

        from rest_framework.test import APIRequestFactory
        factory = APIRequestFactory()
        request = factory.post('/')
        request.user = user

        viewset = ExpenseViewSet()
        viewset.request = request

        # Recalcular
        viewset.recalculate_monthly_budget(monthly_budget)

        monthly_budget.refresh_from_db()
        assert monthly_budget.gastado_actual == Decimal('350')

    def test_check_budget_alerts_creates_alert_at_threshold(self, user, category):
        """Verifica que se crean alertas cuando se alcanza el umbral"""
        from apps.budgets.models import MonthlyBudget, CategoryBudget, BudgetAlert

        monthly_budget = MonthlyBudget.objects.create(
            usuario=user,
            año=2024,
            mes=1,
            presupuesto_total=Decimal('1000'),
            activo=True
        )

        category_budget = CategoryBudget.objects.create(
            presupuesto_mensual=monthly_budget,
            categoria=category,
            limite_asignado=Decimal('100'),
            gastado_actual=Decimal('85'),  # 85% - por encima del umbral del 80%
            alerta_porcentaje=Decimal('80')
        )

        from rest_framework.test import APIRequestFactory
        factory = APIRequestFactory()
        request = factory.post('/')
        request.user = user

        viewset = ExpenseViewSet()
        viewset.request = request

        # Verificar alertas
        viewset.check_budget_alerts(category_budget)

        # Debería haber creado una alerta
        alerts = BudgetAlert.objects.filter(usuario=user)
        assert alerts.count() == 1
        assert 'gastado' in alerts.first().mensaje.lower()

    def test_check_budget_alerts_no_duplicate(self, user, category):
        """Verifica que no se crean alertas duplicadas el mismo día"""
        from apps.budgets.models import MonthlyBudget, CategoryBudget, BudgetAlert

        monthly_budget = MonthlyBudget.objects.create(
            usuario=user,
            año=2024,
            mes=1,
            presupuesto_total=Decimal('1000'),
            activo=True
        )

        category_budget = CategoryBudget.objects.create(
            presupuesto_mensual=monthly_budget,
            categoria=category,
            limite_asignado=Decimal('100'),
            gastado_actual=Decimal('85'),
            alerta_porcentaje=Decimal('80')
        )

        # Crear alerta existente
        BudgetAlert.objects.create(
            usuario=user,
            tipo='category_warning',
            presupuesto_categoria=category_budget,
            mensaje='Test alert',
            porcentaje_gastado=Decimal('85'),
            activa=True
        )

        from rest_framework.test import APIRequestFactory
        factory = APIRequestFactory()
        request = factory.post('/')
        request.user = user

        viewset = ExpenseViewSet()
        viewset.request = request

        # Intentar crear otra alerta
        viewset.check_budget_alerts(category_budget)

        # Debería seguir habiendo solo 1 alerta
        alerts = BudgetAlert.objects.filter(usuario=user)
        assert alerts.count() == 1
