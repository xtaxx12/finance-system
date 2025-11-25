import pytest
from decimal import Decimal
from datetime import date
from rest_framework import status
from apps.loans.models import Loan, LoanPayment


@pytest.mark.django_db
class TestLoansAPI:
    """Tests de integración para API de préstamos"""

    def test_list_loans(self, authenticated_client, user):
        """Verifica listado de préstamos"""
        Loan.objects.create(
            user=user,
            name='Préstamo 1',
            amount=Decimal('5000'),
            installments=6,
            date=date.today()
        )
        Loan.objects.create(
            user=user,
            name='Préstamo 2',
            amount=Decimal('10000'),
            installments=12,
            date=date.today()
        )

        response = authenticated_client.get('/api/loans/')

        assert response.status_code == status.HTTP_200_OK
        results = response.data.get('results', response.data)
        assert len(results) == 2

    def test_create_loan(self, authenticated_client, user):
        """Verifica creación de préstamo"""
        data = {
            'name': 'Nuevo Préstamo',
            'description': 'Descripción de prueba',
            'amount': '15000',
            'installments': 18,
            'date': '2024-01-01'
        }

        response = authenticated_client.post('/api/loans/', data, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        assert Loan.objects.filter(user=user).count() == 1

        loan = Loan.objects.get(user=user)
        assert loan.name == 'Nuevo Préstamo'
        assert loan.amount == Decimal('15000')

    def test_add_payment(self, authenticated_client, user):
        """Verifica agregar pago a préstamo"""
        loan = Loan.objects.create(
            user=user,
            name='Préstamo',
            amount=Decimal('10000'),
            installments=10,
            date=date.today()
        )

        data = {
            'amount': '1000',
            'date': '2024-01-15',
            'notes': 'Primer pago'
        }

        response = authenticated_client.post(
            f'/api/loans/{loan.id}/add_payment/',
            data,
            format='json'
        )

        assert response.status_code == status.HTTP_201_CREATED
        assert LoanPayment.objects.filter(loan=loan).count() == 1

        payment = LoanPayment.objects.get(loan=loan)
        assert payment.amount == Decimal('1000')

    def test_loan_summary(self, authenticated_client, user):
        """Verifica endpoint de resumen de préstamos"""
        loan1 = Loan.objects.create(
            user=user,
            name='Préstamo 1',
            amount=Decimal('10000'),
            installments=10,
            date=date.today()
        )

        LoanPayment.objects.create(
            loan=loan1,
            amount=Decimal('2000'),
            date=date(2024, 1, 15)
        )

        response = authenticated_client.get('/api/loans/summary/')

        assert response.status_code == status.HTTP_200_OK
        assert 'total_debt' in response.data
        assert 'total_paid' in response.data
        assert 'remaining_debt' in response.data

    def test_user_isolation(self, authenticated_client, another_user):
        """Verifica que usuario no puede acceder préstamos de otros"""
        loan = Loan.objects.create(
            user=another_user,
            name='Préstamo de otro',
            amount=Decimal('5000'),
            installments=6,
            date=date.today()
        )

        response = authenticated_client.get(f'/api/loans/{loan.id}/')
        assert response.status_code == status.HTTP_404_NOT_FOUND
