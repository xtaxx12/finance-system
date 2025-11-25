import pytest
from decimal import Decimal
from datetime import date
from rest_framework.test import APIRequestFactory
from apps.transactions.serializers import IncomeSerializer, ExpenseSerializer, DashboardSerializer
from apps.transactions.models import Income, Expense


@pytest.mark.django_db
class TestIncomeSerializer:
    """Tests para IncomeSerializer"""

    def test_serialize_income(self, user):
        """Verifica que se serializa correctamente un ingreso"""
        income = Income.objects.create(
            usuario=user,
            monto=Decimal('1500.00'),
            descripcion='Salario',
            fecha=date(2024, 1, 15),
            es_recurrente=False
        )

        serializer = IncomeSerializer(income)
        data = serializer.data

        assert data['id'] == income.id
        assert Decimal(data['monto']) == Decimal('1500.00')
        assert data['descripcion'] == 'Salario'
        assert data['fecha'] == '2024-01-15'
        assert data['es_recurrente'] is False
        assert data['frecuencia_dias'] is None

    def test_deserialize_income(self, user):
        """Verifica que se deserializa correctamente un ingreso"""
        factory = APIRequestFactory()
        request = factory.post('/')
        request.user = user

        data = {
            'monto': '2000.50',
            'descripcion': 'Freelance',
            'fecha': '2024-01-20',
            'es_recurrente': True,
            'frecuencia_dias': 7
        }

        serializer = IncomeSerializer(data=data, context={'request': request})
        assert serializer.is_valid(), serializer.errors

        income = serializer.save()
        assert income.usuario == user
        assert income.monto == Decimal('2000.50')
        assert income.descripcion == 'Freelance'
        assert income.es_recurrente is True
        assert income.frecuencia_dias == 7

    def test_validate_non_recurring_clears_frequency(self, user):
        """Verifica que frecuencia_dias se limpia si no es recurrente"""
        factory = APIRequestFactory()
        request = factory.post('/')
        request.user = user

        data = {
            'monto': '1000',
            'descripcion': 'Bonus',
            'fecha': '2024-01-15',
            'es_recurrente': False,
            'frecuencia_dias': 30  # Esto debería limpiarse
        }

        serializer = IncomeSerializer(data=data, context={'request': request})
        assert serializer.is_valid()

        income = serializer.save()
        assert income.frecuencia_dias is None

    def test_read_only_fields(self, user):
        """Verifica que campos read-only no se pueden modificar"""
        income = Income.objects.create(
            usuario=user,
            monto=Decimal('100'),
            fecha=date(2024, 1, 1)
        )

        factory = APIRequestFactory()
        request = factory.put('/')
        request.user = user

        data = {
            'id': 9999,  # Intentar cambiar ID
            'monto': '200',
            'fecha': '2024-01-02',
            'created_at': '2020-01-01T00:00:00Z',
            'updated_at': '2020-01-01T00:00:00Z'
        }

        serializer = IncomeSerializer(income, data=data, context={'request': request})
        assert serializer.is_valid()

        updated_income = serializer.save()
        assert updated_income.id == income.id  # ID no cambió
        assert updated_income.monto == Decimal('200')

    def test_invalid_amount(self, user):
        """Verifica validación de monto inválido"""
        factory = APIRequestFactory()
        request = factory.post('/')
        request.user = user

        data = {
            'monto': 'invalid',
            'fecha': '2024-01-15'
        }

        serializer = IncomeSerializer(data=data, context={'request': request})
        assert not serializer.is_valid()
        assert 'monto' in serializer.errors


@pytest.mark.django_db
class TestExpenseSerializer:
    """Tests para ExpenseSerializer"""

    def test_serialize_expense(self, user, category):
        """Verifica que se serializa correctamente un gasto"""
        expense = Expense.objects.create(
            usuario=user,
            categoria=category,
            monto=Decimal('75.50'),
            descripcion='Almuerzo',
            fecha=date(2024, 1, 15)
        )

        serializer = ExpenseSerializer(expense)
        data = serializer.data

        assert data['id'] == expense.id
        assert Decimal(data['monto']) == Decimal('75.50')
        assert data['descripcion'] == 'Almuerzo'
        assert data['fecha'] == '2024-01-15'
        assert data['categoria'] == category.id
        assert data['categoria_info']['nombre'] == category.nombre
        assert data['categoria_info']['color'] == category.color

    def test_deserialize_expense(self, user, category):
        """Verifica que se deserializa correctamente un gasto"""
        factory = APIRequestFactory()
        request = factory.post('/')
        request.user = user

        data = {
            'categoria': category.id,
            'monto': '150.75',
            'descripcion': 'Supermercado',
            'fecha': '2024-01-20',
            'es_recurrente': True,
            'frecuencia_dias': 7
        }

        serializer = ExpenseSerializer(data=data, context={'request': request})
        assert serializer.is_valid(), serializer.errors

        expense = serializer.save()
        assert expense.usuario == user
        assert expense.categoria == category
        assert expense.monto == Decimal('150.75')
        assert expense.es_recurrente is True
        assert expense.frecuencia_dias == 7

    def test_validate_non_recurring_clears_frequency(self, user, category):
        """Verifica que frecuencia_dias se limpia si no es recurrente"""
        factory = APIRequestFactory()
        request = factory.post('/')
        request.user = user

        data = {
            'categoria': category.id,
            'monto': '100',
            'descripcion': 'Compra única',
            'fecha': '2024-01-15',
            'es_recurrente': False,
            'frecuencia_dias': 30
        }

        serializer = ExpenseSerializer(data=data, context={'request': request})
        assert serializer.is_valid()

        expense = serializer.save()
        assert expense.frecuencia_dias is None

    def test_expense_without_category(self, user):
        """Verifica que se puede crear gasto sin categoría"""
        factory = APIRequestFactory()
        request = factory.post('/')
        request.user = user

        data = {
            'monto': '50',
            'descripcion': 'Varios',
            'fecha': '2024-01-15'
        }

        serializer = ExpenseSerializer(data=data, context={'request': request})
        assert serializer.is_valid()

        expense = serializer.save()
        assert expense.categoria is None

    def test_categoria_info_read_only(self, user, category):
        """Verifica que categoria_info es read-only"""
        factory = APIRequestFactory()
        request = factory.post('/')
        request.user = user

        data = {
            'categoria': category.id,
            'categoria_info': {'nombre': 'Fake', 'color': '#000000'},
            'monto': '100',
            'fecha': '2024-01-15'
        }

        serializer = ExpenseSerializer(data=data, context={'request': request})
        assert serializer.is_valid()

        expense = serializer.save()
        # categoria_info debería reflejar la categoría real, no la fake
        assert expense.categoria.nombre == category.nombre
        assert expense.categoria.color == category.color


@pytest.mark.django_db
class TestDashboardSerializer:
    """Tests para DashboardSerializer"""

    def test_serialize_dashboard_data(self):
        """Verifica que se serializa correctamente datos del dashboard"""
        data = {
            'total_ingresos': Decimal('5000.00'),
            'total_gastos': Decimal('3500.50'),
            'balance': Decimal('1499.50'),
            'gastos_por_categoria': [
                {'categoria': 'Alimentación', 'total': 1000.00, 'color': '#3498db'},
                {'categoria': 'Transporte', 'total': 500.50, 'color': '#e74c3c'}
            ],
            'evolucion_mensual': [
                {
                    'mes': 'January',
                    'año': 2024,
                    'ingresos': 5000.00,
                    'gastos': 3500.50,
                    'balance': 1499.50
                }
            ]
        }

        serializer = DashboardSerializer(data)
        serialized_data = serializer.data

        assert Decimal(serialized_data['total_ingresos']) == Decimal('5000.00')
        assert Decimal(serialized_data['total_gastos']) == Decimal('3500.50')
        assert Decimal(serialized_data['balance']) == Decimal('1499.50')
        assert len(serialized_data['gastos_por_categoria']) == 2
        assert len(serialized_data['evolucion_mensual']) == 1

    def test_dashboard_with_empty_lists(self):
        """Verifica serialización con listas vacías"""
        data = {
            'total_ingresos': Decimal('0.00'),
            'total_gastos': Decimal('0.00'),
            'balance': Decimal('0.00'),
            'gastos_por_categoria': [],
            'evolucion_mensual': []
        }

        serializer = DashboardSerializer(data)
        serialized_data = serializer.data

        assert Decimal(serialized_data['total_ingresos']) == Decimal('0.00')
        assert serialized_data['gastos_por_categoria'] == []
        assert serialized_data['evolucion_mensual'] == []
