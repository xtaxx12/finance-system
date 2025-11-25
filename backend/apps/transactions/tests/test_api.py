import pytest
from decimal import Decimal
from datetime import date, timedelta
from django.utils import timezone
from django.urls import reverse
from rest_framework import status
from apps.transactions.models import Income, Expense


@pytest.mark.django_db
class TestIncomeAPI:
    """Tests de integración para API de ingresos"""

    def test_list_incomes_authenticated(self, authenticated_client, user):
        """Verifica que usuario autenticado puede listar sus ingresos"""
        Income.objects.create(
            usuario=user,
            monto=Decimal('1000'),
            descripcion='Salario',
            fecha=date(2024, 1, 1)
        )
        Income.objects.create(
            usuario=user,
            monto=Decimal('500'),
            descripcion='Freelance',
            fecha=date(2024, 1, 15)
        )

        response = authenticated_client.get('/api/transactions/ingresos/')

        assert response.status_code == status.HTTP_200_OK
        results = response.data.get('results', response.data)
        assert len(results) == 2

    def test_list_incomes_unauthenticated(self, api_client):
        """Verifica que usuario no autenticado no puede listar ingresos"""
        response = api_client.get('/api/transactions/ingresos/')
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_create_income(self, authenticated_client, user):
        """Verifica que se puede crear un ingreso"""
        data = {
            'monto': '2500.50',
            'descripcion': 'Salario enero',
            'fecha': '2024-01-31',
            'es_recurrente': True,
            'frecuencia_dias': 30
        }

        response = authenticated_client.post(
            '/api/transactions/ingresos/',
            data,
            format='json'
        )

        assert response.status_code == status.HTTP_201_CREATED
        assert Income.objects.filter(usuario=user).count() == 1

        income = Income.objects.get(usuario=user)
        assert income.monto == Decimal('2500.50')
        assert income.descripcion == 'Salario enero'
        assert income.es_recurrente is True
        assert income.frecuencia_dias == 30

    def test_create_income_minimal_data(self, authenticated_client, user):
        """Verifica que se puede crear ingreso con datos mínimos"""
        data = {
            'monto': '100',
            'fecha': '2024-01-15'
        }

        response = authenticated_client.post(
            '/api/transactions/ingresos/',
            data,
            format='json'
        )

        assert response.status_code == status.HTTP_201_CREATED
        assert Income.objects.filter(usuario=user).count() == 1

    def test_retrieve_income(self, authenticated_client, user):
        """Verifica que se puede obtener detalle de un ingreso"""
        income = Income.objects.create(
            usuario=user,
            monto=Decimal('1500'),
            descripcion='Bonus',
            fecha=date(2024, 1, 15)
        )

        response = authenticated_client.get(f'/api/transactions/ingresos/{income.id}/')

        assert response.status_code == status.HTTP_200_OK
        assert Decimal(response.data['monto']) == Decimal('1500')
        assert response.data['descripcion'] == 'Bonus'

    def test_update_income(self, authenticated_client, user):
        """Verifica que se puede actualizar un ingreso"""
        income = Income.objects.create(
            usuario=user,
            monto=Decimal('1000'),
            descripcion='Original',
            fecha=date(2024, 1, 1)
        )

        data = {
            'monto': '1500',
            'descripcion': 'Actualizado',
            'fecha': '2024-01-02'
        }

        response = authenticated_client.put(
            f'/api/transactions/ingresos/{income.id}/',
            data,
            format='json'
        )

        assert response.status_code == status.HTTP_200_OK

        income.refresh_from_db()
        assert income.monto == Decimal('1500')
        assert income.descripcion == 'Actualizado'

    def test_delete_income(self, authenticated_client, user):
        """Verifica que se puede eliminar un ingreso"""
        income = Income.objects.create(
            usuario=user,
            monto=Decimal('1000'),
            fecha=date(2024, 1, 1)
        )

        response = authenticated_client.delete(f'/api/transactions/ingresos/{income.id}/')

        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert Income.objects.filter(usuario=user).count() == 0

    def test_user_cannot_access_other_user_income(self, authenticated_client, another_user):
        """Verifica que un usuario no puede acceder a ingresos de otro usuario"""
        income = Income.objects.create(
            usuario=another_user,
            monto=Decimal('1000'),
            fecha=date(2024, 1, 1)
        )

        response = authenticated_client.get(f'/api/transactions/ingresos/{income.id}/')
        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
class TestExpenseAPI:
    """Tests de integración para API de gastos"""

    def test_list_expenses_authenticated(self, authenticated_client, user, category):
        """Verifica que usuario autenticado puede listar sus gastos"""
        Expense.objects.create(
            usuario=user,
            categoria=category,
            monto=Decimal('50'),
            descripcion='Almuerzo',
            fecha=date(2024, 1, 1)
        )
        Expense.objects.create(
            usuario=user,
            categoria=category,
            monto=Decimal('100'),
            descripcion='Supermercado',
            fecha=date(2024, 1, 15)
        )

        response = authenticated_client.get('/api/transactions/gastos/')

        assert response.status_code == status.HTTP_200_OK
        results = response.data.get('results', response.data)
        assert len(results) == 2

    def test_create_expense(self, authenticated_client, user, category):
        """Verifica que se puede crear un gasto"""
        data = {
            'categoria': category.id,
            'monto': '75.50',
            'descripcion': 'Restaurante',
            'fecha': '2024-01-20',
            'es_recurrente': False
        }

        response = authenticated_client.post(
            '/api/transactions/gastos/',
            data,
            format='json'
        )

        assert response.status_code == status.HTTP_201_CREATED
        assert Expense.objects.filter(usuario=user).count() == 1

        expense = Expense.objects.get(usuario=user)
        assert expense.monto == Decimal('75.50')
        assert expense.categoria == category
        assert expense.descripcion == 'Restaurante'

    def test_create_expense_without_category(self, authenticated_client, user):
        """Verifica que se puede crear gasto sin categoría"""
        data = {
            'monto': '50',
            'descripcion': 'Varios',
            'fecha': '2024-01-15'
        }

        response = authenticated_client.post(
            '/api/transactions/gastos/',
            data,
            format='json'
        )

        assert response.status_code == status.HTTP_201_CREATED
        expense = Expense.objects.get(usuario=user)
        assert expense.categoria is None

    def test_expense_response_includes_category_info(self, authenticated_client, user, category):
        """Verifica que la respuesta incluye información de la categoría"""
        expense = Expense.objects.create(
            usuario=user,
            categoria=category,
            monto=Decimal('100'),
            fecha=date(2024, 1, 1)
        )

        response = authenticated_client.get(f'/api/transactions/gastos/{expense.id}/')

        assert response.status_code == status.HTTP_200_OK
        assert 'categoria_info' in response.data
        assert response.data['categoria_info']['nombre'] == category.nombre
        assert response.data['categoria_info']['color'] == category.color

    def test_update_expense(self, authenticated_client, user, category):
        """Verifica que se puede actualizar un gasto"""
        expense = Expense.objects.create(
            usuario=user,
            categoria=category,
            monto=Decimal('50'),
            descripcion='Original',
            fecha=date(2024, 1, 1)
        )

        data = {
            'categoria': category.id,
            'monto': '75',
            'descripcion': 'Actualizado',
            'fecha': '2024-01-02'
        }

        response = authenticated_client.put(
            f'/api/transactions/gastos/{expense.id}/',
            data,
            format='json'
        )

        assert response.status_code == status.HTTP_200_OK

        expense.refresh_from_db()
        assert expense.monto == Decimal('75')
        assert expense.descripcion == 'Actualizado'

    def test_delete_expense(self, authenticated_client, user, category):
        """Verifica que se puede eliminar un gasto"""
        expense = Expense.objects.create(
            usuario=user,
            categoria=category,
            monto=Decimal('100'),
            fecha=date(2024, 1, 1)
        )

        response = authenticated_client.delete(f'/api/transactions/gastos/{expense.id}/')

        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert Expense.objects.filter(usuario=user).count() == 0


@pytest.mark.django_db
class TestDashboardAPI:
    """Tests de integración para API del dashboard"""

    def test_dashboard_endpoint(self, authenticated_client, user, category):
        """Verifica que el endpoint del dashboard funciona"""
        # Crear ingresos
        Income.objects.create(
            usuario=user,
            monto=Decimal('3000'),
            fecha=date(2024, 1, 15)
        )

        # Crear gastos
        Expense.objects.create(
            usuario=user,
            categoria=category,
            monto=Decimal('500'),
            fecha=date(2024, 1, 10)
        )
        Expense.objects.create(
            usuario=user,
            categoria=category,
            monto=Decimal('300'),
            fecha=date(2024, 1, 20)
        )

        response = authenticated_client.get('/api/transactions/gastos/dashboard/?mes=1&año=2024')

        assert response.status_code == status.HTTP_200_OK
        assert 'total_ingresos' in response.data
        assert 'total_gastos' in response.data
        assert 'balance' in response.data
        assert 'gastos_por_categoria' in response.data
        assert 'evolucion_mensual' in response.data

        # Verificar cálculos
        assert Decimal(response.data['total_ingresos']) == Decimal('3000')
        assert Decimal(response.data['total_gastos']) == Decimal('800')
        assert Decimal(response.data['balance']) == Decimal('2200')

    def test_dashboard_gastos_por_categoria(self, authenticated_client, user, categories):
        """Verifica que los gastos se agrupan correctamente por categoría"""
        # Crear gastos en diferentes categorías
        Expense.objects.create(
            usuario=user,
            categoria=categories[0],  # Alimentación
            monto=Decimal('500'),
            fecha=date(2024, 1, 10)
        )
        Expense.objects.create(
            usuario=user,
            categoria=categories[0],  # Alimentación
            monto=Decimal('300'),
            fecha=date(2024, 1, 15)
        )
        Expense.objects.create(
            usuario=user,
            categoria=categories[1],  # Transporte
            monto=Decimal('200'),
            fecha=date(2024, 1, 20)
        )

        response = authenticated_client.get('/api/transactions/gastos/dashboard/?mes=1&año=2024')

        assert response.status_code == status.HTTP_200_OK
        gastos_por_categoria = response.data['gastos_por_categoria']

        assert len(gastos_por_categoria) == 2

        # Ordenado por total descendente
        assert gastos_por_categoria[0]['categoria'] == categories[0].nombre
        assert gastos_por_categoria[0]['total'] == 800.0
        assert gastos_por_categoria[1]['categoria'] == categories[1].nombre
        assert gastos_por_categoria[1]['total'] == 200.0

    def test_dashboard_evolucion_mensual(self, authenticated_client, user):
        """Verifica que la evolución mensual se calcula correctamente"""
        # Crear datos de varios meses
        today = timezone.now().date()

        # Mes actual
        Income.objects.create(usuario=user, monto=Decimal('3000'), fecha=today)
        Expense.objects.create(usuario=user, monto=Decimal('2000'), fecha=today)

        # Mes anterior
        last_month = today - timedelta(days=30)
        Income.objects.create(usuario=user, monto=Decimal('2500'), fecha=last_month)
        Expense.objects.create(usuario=user, monto=Decimal('1500'), fecha=last_month)

        response = authenticated_client.get('/api/transactions/gastos/dashboard/')

        assert response.status_code == status.HTTP_200_OK
        evolucion = response.data['evolucion_mensual']

        assert len(evolucion) == 6  # Últimos 6 meses
        assert all('mes' in item for item in evolucion)
        assert all('ingresos' in item for item in evolucion)
        assert all('gastos' in item for item in evolucion)
        assert all('balance' in item for item in evolucion)

    def test_dashboard_default_current_month(self, authenticated_client, user):
        """Verifica que sin parámetros usa el mes actual"""
        today = timezone.now().date()

        Income.objects.create(usuario=user, monto=Decimal('1000'), fecha=today)

        response = authenticated_client.get('/api/transactions/gastos/dashboard/')

        assert response.status_code == status.HTTP_200_OK
        assert Decimal(response.data['total_ingresos']) == Decimal('1000')

    def test_dashboard_user_isolation(self, authenticated_client, user, another_user, category):
        """Verifica que dashboard solo muestra datos del usuario autenticado"""
        # Datos del usuario autenticado
        Income.objects.create(usuario=user, monto=Decimal('1000'), fecha=date(2024, 1, 15))
        Expense.objects.create(usuario=user, categoria=category, monto=Decimal('500'), fecha=date(2024, 1, 15))

        # Datos de otro usuario
        Income.objects.create(usuario=another_user, monto=Decimal('5000'), fecha=date(2024, 1, 15))
        Expense.objects.create(usuario=another_user, categoria=category, monto=Decimal('3000'), fecha=date(2024, 1, 15))

        response = authenticated_client.get('/api/transactions/gastos/dashboard/?mes=1&año=2024')

        assert response.status_code == status.HTTP_200_OK
        # Solo debe mostrar datos del usuario autenticado
        assert Decimal(response.data['total_ingresos']) == Decimal('1000')
        assert Decimal(response.data['total_gastos']) == Decimal('500')
        assert Decimal(response.data['balance']) == Decimal('500')
