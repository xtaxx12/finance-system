import pytest
from decimal import Decimal
from datetime import date
from apps.loans.models import Loan, LoanPayment


@pytest.mark.django_db
class TestLoanModel:
    """Tests para modelo Loan"""

    def test_create_loan(self, user):
        """Verifica creación de préstamo"""
        loan = Loan.objects.create(
            user=user,
            name='Préstamo Personal',
            amount=Decimal('10000'),
            installments=12,
            date=date.today()
        )

        assert loan.id is not None
        assert loan.amount == Decimal('10000')
        assert loan.installments == 12

    def test_string_representation(self, user):
        """Verifica representación en string"""
        loan = Loan.objects.create(
            user=user,
            name='Préstamo Auto',
            amount=Decimal('20000'),
            installments=24,
            date=date.today()
        )

        assert str(loan) == 'Préstamo Auto - $20000'


@pytest.mark.django_db
class TestLoanPaymentModel:
    """Tests para modelo LoanPayment"""

    def test_create_payment(self, user):
        """Verifica creación de pago"""
        loan = Loan.objects.create(
            user=user,
            name='Préstamo',
            amount=Decimal('10000'),
            installments=12,
            date=date.today()
        )

        payment = LoanPayment.objects.create(
            loan=loan,
            amount=Decimal('1000'),
            date=date(2024, 1, 15),
            notes='Primer pago'
        )

        assert payment.id is not None
        assert payment.amount == Decimal('1000')
        assert payment.loan == loan

    def test_string_representation(self, user):
        """Verifica representación en string"""
        loan = Loan.objects.create(
            user=user,
            name='Préstamo',
            amount=Decimal('10000'),
            installments=12,
            date=date.today()
        )

        payment = LoanPayment.objects.create(
            loan=loan,
            amount=Decimal('500'),
            date=date(2024, 1, 15)
        )

        assert str(payment) == 'Pago de $500 para Préstamo'
