import pytest
from decimal import Decimal
from datetime import date
from django.contrib.auth.models import User
from apps.transactions.models import Income, Expense
from apps.categories.models import Category


@pytest.mark.django_db
class TestIncomeModel:
    """Tests para el modelo Income"""

    def test_create_income(self, user):
        """Verifica que se puede crear un ingreso básico"""
        income = Income.objects.create(
            usuario=user,
            monto=Decimal('1500.50'),
            descripcion='Salario',
            fecha=date(2024, 1, 15)
        )

        assert income.id is not None
        assert income.usuario == user
        assert income.monto == Decimal('1500.50')
        assert income.descripcion == 'Salario'
        assert income.fecha == date(2024, 1, 15)
        assert income.es_recurrente is False
        assert income.frecuencia_dias is None

    def test_create_recurring_income(self, user):
        """Verifica que se puede crear un ingreso recurrente"""
        income = Income.objects.create(
            usuario=user,
            monto=Decimal('2000.00'),
            descripcion='Salario mensual',
            fecha=date(2024, 1, 1),
            es_recurrente=True,
            frecuencia_dias=30
        )

        assert income.es_recurrente is True
        assert income.frecuencia_dias == 30

    def test_income_string_representation(self, user):
        """Verifica la representación en string del ingreso"""
        income = Income.objects.create(
            usuario=user,
            monto=Decimal('100.50'),
            descripcion='Freelance',
            fecha=date(2024, 1, 1)
        )

        assert str(income) == 'Freelance - $100.50'

    def test_income_ordering(self, user):
        """Verifica que los ingresos se ordenan por fecha descendente"""
        income1 = Income.objects.create(
            usuario=user,
            monto=Decimal('100'),
            fecha=date(2024, 1, 1)
        )
        income2 = Income.objects.create(
            usuario=user,
            monto=Decimal('200'),
            fecha=date(2024, 1, 15)
        )
        income3 = Income.objects.create(
            usuario=user,
            monto=Decimal('300'),
            fecha=date(2024, 1, 10)
        )

        incomes = list(Income.objects.all())
        assert incomes[0] == income2  # Más reciente primero
        assert incomes[1] == income3
        assert incomes[2] == income1

    def test_income_user_isolation(self, user, another_user):
        """Verifica que los usuarios solo ven sus propios ingresos"""
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

        user_incomes = Income.objects.filter(usuario=user)
        assert user_incomes.count() == 1
        assert user_incomes.first().monto == Decimal('100')

    def test_income_created_updated_timestamps(self, user):
        """Verifica que se crean timestamps automáticamente"""
        income = Income.objects.create(
            usuario=user,
            monto=Decimal('100'),
            fecha=date(2024, 1, 1)
        )

        assert income.created_at is not None
        assert income.updated_at is not None
        assert income.created_at <= income.updated_at


@pytest.mark.django_db
class TestExpenseModel:
    """Tests para el modelo Expense"""

    def test_create_expense(self, user, category):
        """Verifica que se puede crear un gasto básico"""
        expense = Expense.objects.create(
            usuario=user,
            categoria=category,
            monto=Decimal('50.75'),
            descripcion='Almuerzo',
            fecha=date(2024, 1, 15)
        )

        assert expense.id is not None
        assert expense.usuario == user
        assert expense.categoria == category
        assert expense.monto == Decimal('50.75')
        assert expense.descripcion == 'Almuerzo'
        assert expense.fecha == date(2024, 1, 15)
        assert expense.es_recurrente is False
        assert expense.frecuencia_dias is None

    def test_create_expense_without_category(self, user):
        """Verifica que se puede crear un gasto sin categoría"""
        expense = Expense.objects.create(
            usuario=user,
            monto=Decimal('25.00'),
            descripcion='Varios',
            fecha=date(2024, 1, 1)
        )

        assert expense.categoria is None

    def test_create_recurring_expense(self, user, category):
        """Verifica que se puede crear un gasto recurrente"""
        expense = Expense.objects.create(
            usuario=user,
            categoria=category,
            monto=Decimal('500.00'),
            descripcion='Renta',
            fecha=date(2024, 1, 1),
            es_recurrente=True,
            frecuencia_dias=30
        )

        assert expense.es_recurrente is True
        assert expense.frecuencia_dias == 30

    def test_expense_string_representation(self, user, category):
        """Verifica la representación en string del gasto"""
        expense = Expense.objects.create(
            usuario=user,
            categoria=category,
            monto=Decimal('75.25'),
            descripcion='Supermercado',
            fecha=date(2024, 1, 1)
        )

        assert str(expense) == 'Supermercado - $75.25'

    def test_expense_ordering(self, user, category):
        """Verifica que los gastos se ordenan por fecha descendente"""
        expense1 = Expense.objects.create(
            usuario=user,
            categoria=category,
            monto=Decimal('100'),
            fecha=date(2024, 1, 1)
        )
        expense2 = Expense.objects.create(
            usuario=user,
            categoria=category,
            monto=Decimal('200'),
            fecha=date(2024, 1, 15)
        )
        expense3 = Expense.objects.create(
            usuario=user,
            categoria=category,
            monto=Decimal('300'),
            fecha=date(2024, 1, 10)
        )

        expenses = list(Expense.objects.all())
        assert expenses[0] == expense2
        assert expenses[1] == expense3
        assert expenses[2] == expense1

    def test_expense_user_isolation(self, user, another_user, category):
        """Verifica que los usuarios solo ven sus propios gastos"""
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

        user_expenses = Expense.objects.filter(usuario=user)
        assert user_expenses.count() == 1
        assert user_expenses.first().monto == Decimal('100')

    def test_expense_category_cascade(self, user, category):
        """Verifica que al eliminar categoría, el gasto mantiene referencia nula"""
        expense = Expense.objects.create(
            usuario=user,
            categoria=category,
            monto=Decimal('50'),
            fecha=date(2024, 1, 1)
        )

        category_id = category.id
        category.delete()

        expense.refresh_from_db()
        assert expense.categoria is None  # SET_NULL

    def test_expense_created_updated_timestamps(self, user, category):
        """Verifica que se crean timestamps automáticamente"""
        expense = Expense.objects.create(
            usuario=user,
            categoria=category,
            monto=Decimal('100'),
            fecha=date(2024, 1, 1)
        )

        assert expense.created_at is not None
        assert expense.updated_at is not None
        assert expense.created_at <= expense.updated_at

    def test_decimal_precision(self, user, category):
        """Verifica que se mantiene la precisión decimal para montos"""
        expense = Expense.objects.create(
            usuario=user,
            categoria=category,
            monto=Decimal('123.456'),  # 3 decimales
            fecha=date(2024, 1, 1)
        )

        expense.refresh_from_db()
        # El modelo define max_digits=12, decimal_places=2
        assert expense.monto == Decimal('123.46')  # Redondeado a 2 decimales
