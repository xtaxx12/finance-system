from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from decimal import Decimal
from .models import Loan, LoanPayment


class LoanModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.loan = Loan.objects.create(
            user=self.user,
            name='Préstamo de prueba',
            amount=Decimal('10000.00'),
            installments=12,
            date='2024-01-01'
        )

    def test_loan_creation(self):
        """Test que se puede crear un préstamo correctamente"""
        self.assertEqual(self.loan.name, 'Préstamo de prueba')
        self.assertEqual(self.loan.amount, Decimal('10000.00'))
        self.assertEqual(self.loan.installments, 12)
        self.assertEqual(str(self.loan), 'Préstamo de prueba - $10000.00')

    def test_installment_amount_calculation(self):
        """Test del cálculo del monto por cuota"""
        expected_amount = Decimal('10000.00') / 12
        self.assertEqual(self.loan.installment_amount, expected_amount)

    def test_initial_values(self):
        """Test de valores iniciales del préstamo"""
        self.assertEqual(self.loan.total_paid, Decimal('0'))
        self.assertEqual(self.loan.remaining_amount, Decimal('10000.00'))
        self.assertEqual(self.loan.paid_installments, 0)
        self.assertEqual(self.loan.progress_percentage, 0)
        self.assertFalse(self.loan.is_completed)

    def test_payment_calculations(self):
        """Test de cálculos después de agregar pagos"""
        # Agregar un pago
        payment1 = LoanPayment.objects.create(
            loan=self.loan,
            amount=Decimal('1000.00'),
            date='2024-01-15'
        )
        
        # Verificar cálculos
        self.assertEqual(self.loan.total_paid, Decimal('1000.00'))
        self.assertEqual(self.loan.remaining_amount, Decimal('9000.00'))
        self.assertEqual(self.loan.paid_installments, 1)
        self.assertAlmostEqual(self.loan.progress_percentage, 8.33, places=2)
        self.assertFalse(self.loan.is_completed)

        # Agregar más pagos hasta completar
        for i in range(11):
            LoanPayment.objects.create(
                loan=self.loan,
                amount=Decimal('1000.00'),
                date=f'2024-{i+2:02d}-15'
            )
        
        # Verificar préstamo completado
        self.assertEqual(self.loan.total_paid, Decimal('12000.00'))
        self.assertEqual(self.loan.paid_installments, 12)
        self.assertEqual(self.loan.progress_percentage, 100)
        self.assertTrue(self.loan.is_completed)


class LoanAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)

    def test_create_loan(self):
        """Test de creación de préstamo via API"""
        url = reverse('loan-list')
        data = {
            'name': 'Préstamo API',
            'description': 'Préstamo creado via API',
            'amount': '5000.00',
            'installments': 6,
            'date': '2024-01-01'
        }
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Loan.objects.count(), 1)
        loan = Loan.objects.first()
        self.assertEqual(loan.name, 'Préstamo API')
        self.assertEqual(loan.user, self.user)

    def test_list_loans(self):
        """Test de listado de préstamos"""
        # Crear algunos préstamos
        Loan.objects.create(
            user=self.user,
            name='Préstamo 1',
            amount=Decimal('1000.00'),
            installments=5,
            date='2024-01-01'
        )
        Loan.objects.create(
            user=self.user,
            name='Préstamo 2',
            amount=Decimal('2000.00'),
            installments=10,
            date='2024-01-02'
        )
        
        url = reverse('loan-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)

    def test_loan_summary(self):
        """Test del endpoint de resumen"""
        # Crear préstamo con pagos
        loan = Loan.objects.create(
            user=self.user,
            name='Préstamo con pagos',
            amount=Decimal('1000.00'),
            installments=4,
            date='2024-01-01'
        )
        LoanPayment.objects.create(
            loan=loan,
            amount=Decimal('250.00'),
            date='2024-01-15'
        )
        
        url = reverse('loan-summary')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        self.assertEqual(data['total_loans'], 1)
        self.assertEqual(data['active_loans'], 1)
        self.assertEqual(data['completed_loans'], 0)
        self.assertEqual(float(data['total_debt']), 1000.00)
        self.assertEqual(float(data['total_paid']), 250.00)
        self.assertEqual(float(data['remaining_debt']), 750.00)

    def test_add_payment(self):
        """Test de agregar pago a préstamo"""
        loan = Loan.objects.create(
            user=self.user,
            name='Préstamo para pago',
            amount=Decimal('1000.00'),
            installments=4,
            date='2024-01-01'
        )
        
        url = reverse('loan-add-payment', kwargs={'pk': loan.id})
        data = {
            'amount': '250.00',
            'date': '2024-01-15',
            'notes': 'Primer pago'
        }
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(LoanPayment.objects.count(), 1)
        payment = LoanPayment.objects.first()
        self.assertEqual(payment.amount, Decimal('250.00'))
        self.assertEqual(payment.loan, loan)

    def test_unauthorized_access(self):
        """Test que usuarios no autenticados no pueden acceder"""
        self.client.force_authenticate(user=None)
        url = reverse('loan-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_isolation(self):
        """Test que los usuarios solo ven sus propios préstamos"""
        # Crear otro usuario con préstamos
        other_user = User.objects.create_user(
            username='otheruser',
            email='other@example.com',
            password='otherpass123'
        )
        Loan.objects.create(
            user=other_user,
            name='Préstamo de otro usuario',
            amount=Decimal('5000.00'),
            installments=10,
            date='2024-01-01'
        )
        
        # Crear préstamo para el usuario actual
        Loan.objects.create(
            user=self.user,
            name='Mi préstamo',
            amount=Decimal('1000.00'),
            installments=5,
            date='2024-01-01'
        )
        
        url = reverse('loan-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['name'], 'Mi préstamo')