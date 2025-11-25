import pytest
from decimal import Decimal
from datetime import date, timedelta
from rest_framework import status
from apps.goals.models import SavingGoal
from apps.transactions.models import Expense


@pytest.mark.django_db
class TestGoalsAPI:
    """Tests de integración para API de metas"""

    def test_list_goals(self, authenticated_client, user):
        """Verifica listado de metas"""
        SavingGoal.objects.create(
            usuario=user,
            nombre='Meta 1',
            monto_objetivo=Decimal('1000')
        )
        SavingGoal.objects.create(
            usuario=user,
            nombre='Meta 2',
            monto_objetivo=Decimal('2000')
        )

        response = authenticated_client.get('/api/goals/')

        assert response.status_code == status.HTTP_200_OK
        results = response.data.get('results', response.data)
        assert len(results) == 2

    def test_create_goal(self, authenticated_client, user):
        """Verifica creación de meta"""
        data = {
            'nombre': 'Nueva Meta',
            'descripcion': 'Descripción de prueba',
            'monto_objetivo': '5000',
            'fecha_limite': '2024-12-31'
        }

        response = authenticated_client.post('/api/goals/', data, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        assert SavingGoal.objects.filter(usuario=user).count() == 1

        goal = SavingGoal.objects.get(usuario=user)
        assert goal.nombre == 'Nueva Meta'
        assert goal.monto_objetivo == Decimal('5000')

    def test_add_savings(self, authenticated_client, user):
        """Verifica agregar ahorro a meta"""
        goal = SavingGoal.objects.create(
            usuario=user,
            nombre='Test Goal',
            monto_objetivo=Decimal('1000'),
            monto_actual=Decimal('200')
        )

        response = authenticated_client.post(
            f'/api/goals/{goal.id}/add_savings/',
            {'amount': '300'},
            format='json'
        )

        assert response.status_code == status.HTTP_200_OK

        goal.refresh_from_db()
        assert goal.monto_actual == Decimal('500')

        # Verificar que se creó el gasto de ahorro
        expense = Expense.objects.filter(
            usuario=user,
            descripcion__contains=goal.nombre
        ).first()
        assert expense is not None
        assert expense.monto == Decimal('300')

    def test_add_savings_completes_goal(self, authenticated_client, user):
        """Verifica que completar meta marca como completada"""
        goal = SavingGoal.objects.create(
            usuario=user,
            nombre='Test Goal',
            monto_objetivo=Decimal('1000'),
            monto_actual=Decimal('900')
        )

        response = authenticated_client.post(
            f'/api/goals/{goal.id}/add_savings/',
            {'amount': '200'},
            format='json'
        )

        assert response.status_code == status.HTTP_200_OK

        goal.refresh_from_db()
        assert goal.completada is True
        assert goal.monto_actual == Decimal('1100')

    def test_add_savings_invalid_amount(self, authenticated_client, user):
        """Verifica validación de monto inválido"""
        goal = SavingGoal.objects.create(
            usuario=user,
            nombre='Test Goal',
            monto_objetivo=Decimal('1000')
        )

        response = authenticated_client.post(
            f'/api/goals/{goal.id}/add_savings/',
            {'amount': '-50'},
            format='json'
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_mark_completed(self, authenticated_client, user):
        """Verifica marcar meta como completada"""
        goal = SavingGoal.objects.create(
            usuario=user,
            nombre='Test Goal',
            monto_objetivo=Decimal('1000')
        )

        response = authenticated_client.post(
            f'/api/goals/{goal.id}/mark_completed/',
            format='json'
        )

        assert response.status_code == status.HTTP_200_OK

        goal.refresh_from_db()
        assert goal.completada is True

    def test_user_isolation(self, authenticated_client, another_user):
        """Verifica que usuario no puede acceder metas de otros"""
        goal = SavingGoal.objects.create(
            usuario=another_user,
            nombre='Meta de otro',
            monto_objetivo=Decimal('1000')
        )

        response = authenticated_client.get(f'/api/goals/{goal.id}/')
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_serializer_includes_calculated_fields(self, authenticated_client, user):
        """Verifica que respuesta incluye campos calculados"""
        goal = SavingGoal.objects.create(
            usuario=user,
            nombre='Test',
            monto_objetivo=Decimal('1000'),
            monto_actual=Decimal('250'),
            fecha_limite=date.today() + timedelta(days=30)
        )

        response = authenticated_client.get(f'/api/goals/{goal.id}/')

        assert response.status_code == status.HTTP_200_OK
        assert 'porcentaje_completado' in response.data
        assert 'monto_faltante' in response.data
        assert 'dias_restantes' in response.data
        assert 'ahorro_mensual_sugerido' in response.data
