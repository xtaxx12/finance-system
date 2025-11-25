import pytest
from decimal import Decimal
from datetime import date, timedelta
from apps.goals.models import SavingGoal


@pytest.mark.django_db
class TestSavingGoalModel:
    """Tests para el modelo SavingGoal"""

    def test_create_goal(self, user):
        """Verifica creación básica de meta"""
        goal = SavingGoal.objects.create(
            usuario=user,
            nombre='Vacaciones',
            monto_objetivo=Decimal('5000'),
            fecha_limite=date(2024, 12, 31)
        )

        assert goal.id is not None
        assert goal.usuario == user
        assert goal.monto_actual == Decimal('0')
        assert goal.completada is False

    def test_porcentaje_completado(self, user):
        """Verifica cálculo de porcentaje"""
        goal = SavingGoal.objects.create(
            usuario=user,
            nombre='Test',
            monto_objetivo=Decimal('1000'),
            monto_actual=Decimal('250')
        )

        assert goal.porcentaje_completado == Decimal('25.0')

    def test_monto_faltante(self, user):
        """Verifica cálculo de monto faltante"""
        goal = SavingGoal.objects.create(
            usuario=user,
            nombre='Test',
            monto_objetivo=Decimal('1000'),
            monto_actual=Decimal('400')
        )

        assert goal.monto_faltante == Decimal('600')

    def test_dias_restantes(self, user):
        """Verifica cálculo de días restantes"""
        future_date = date.today() + timedelta(days=30)
        goal = SavingGoal.objects.create(
            usuario=user,
            nombre='Test',
            monto_objetivo=Decimal('1000'),
            fecha_limite=future_date
        )

        assert goal.dias_restantes == 30

    def test_dias_restantes_past_date(self, user):
        """Verifica que días restantes no es negativo"""
        past_date = date.today() - timedelta(days=10)
        goal = SavingGoal.objects.create(
            usuario=user,
            nombre='Test',
            monto_objetivo=Decimal('1000'),
            fecha_limite=past_date
        )

        assert goal.dias_restantes == 0

    def test_ahorro_mensual_sugerido(self, user):
        """Verifica cálculo de ahorro mensual sugerido"""
        future_date = date.today() + timedelta(days=60)
        goal = SavingGoal.objects.create(
            usuario=user,
            nombre='Test',
            monto_objetivo=Decimal('1000'),
            monto_actual=Decimal('400'),
            fecha_limite=future_date
        )

        sugerido = goal.ahorro_mensual_sugerido
        assert sugerido is not None
        assert sugerido > Decimal('0')

    def test_string_representation(self, user):
        """Verifica representación en string"""
        goal = SavingGoal.objects.create(
            usuario=user,
            nombre='Casa Nueva',
            monto_objetivo=Decimal('50000')
        )

        assert str(goal) == 'Casa Nueva - $50000'
