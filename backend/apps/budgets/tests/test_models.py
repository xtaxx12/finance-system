import pytest
from decimal import Decimal
from apps.budgets.models import MonthlyBudget, CategoryBudget
from apps.transactions.models import Expense
from datetime import date


@pytest.mark.django_db
class TestMonthlyBudget:
    """Tests para modelo MonthlyBudget"""

    def test_create_monthly_budget(self, user):
        """Verifica creación de presupuesto mensual"""
        budget = MonthlyBudget.objects.create(
            usuario=user,
            año=2024,
            mes=1,
            presupuesto_total=Decimal('3000'),
            activo=True
        )

        assert budget.id is not None
        assert budget.gastado_actual == Decimal('0')
        assert budget.activo is True

    def test_porcentaje_gastado(self, user):
        """Verifica cálculo de porcentaje gastado"""
        budget = MonthlyBudget.objects.create(
            usuario=user,
            año=2024,
            mes=1,
            presupuesto_total=Decimal('1000'),
            gastado_actual=Decimal('250')
        )

        assert budget.porcentaje_gastado == Decimal('25.0')

    def test_unique_together_constraint(self, user):
        """Verifica que solo hay un presupuesto activo por mes/año/usuario"""
        MonthlyBudget.objects.create(
            usuario=user,
            año=2024,
            mes=1,
            presupuesto_total=Decimal('1000'),
            activo=True
        )

        # Intentar crear otro para el mismo mes debe fallar
        from django.db import IntegrityError
        with pytest.raises(IntegrityError):
            MonthlyBudget.objects.create(
                usuario=user,
                año=2024,
                mes=1,
                presupuesto_total=Decimal('2000'),
                activo=True
            )


@pytest.mark.django_db
class TestCategoryBudget:
    """Tests para modelo CategoryBudget"""

    def test_create_category_budget(self, user, category):
        """Verifica creación de presupuesto de categoría"""
        monthly_budget = MonthlyBudget.objects.create(
            usuario=user,
            año=2024,
            mes=1,
            presupuesto_total=Decimal('3000')
        )

        cat_budget = CategoryBudget.objects.create(
            presupuesto_mensual=monthly_budget,
            categoria=category,
            limite_asignado=Decimal('500')
        )

        assert cat_budget.id is not None
        assert cat_budget.gastado_actual == Decimal('0')
        assert cat_budget.alerta_porcentaje == Decimal('80')

    def test_porcentaje_gastado(self, user, category):
        """Verifica cálculo de porcentaje gastado"""
        monthly_budget = MonthlyBudget.objects.create(
            usuario=user,
            año=2024,
            mes=1,
            presupuesto_total=Decimal('3000')
        )

        cat_budget = CategoryBudget.objects.create(
            presupuesto_mensual=monthly_budget,
            categoria=category,
            limite_asignado=Decimal('500'),
            gastado_actual=Decimal('400')
        )

        assert cat_budget.porcentaje_gastado == Decimal('80.0')

    def test_necesita_alerta_threshold(self, user, category):
        """Verifica que necesita_alerta se activa al 80%"""
        monthly_budget = MonthlyBudget.objects.create(
            usuario=user,
            año=2024,
            mes=1,
            presupuesto_total=Decimal('3000')
        )

        cat_budget = CategoryBudget.objects.create(
            presupuesto_mensual=monthly_budget,
            categoria=category,
            limite_asignado=Decimal('100'),
            gastado_actual=Decimal('85')
        )

        assert cat_budget.necesita_alerta is True

    def test_esta_excedido(self, user, category):
        """Verifica detección de presupuesto excedido"""
        monthly_budget = MonthlyBudget.objects.create(
            usuario=user,
            año=2024,
            mes=1,
            presupuesto_total=Decimal('3000')
        )

        cat_budget = CategoryBudget.objects.create(
            presupuesto_mensual=monthly_budget,
            categoria=category,
            limite_asignado=Decimal('100'),
            gastado_actual=Decimal('150')
        )

        assert cat_budget.esta_excedido is True
