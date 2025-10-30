import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'finance_api.settings')
django.setup()

from apps.loans.models import Loan, LoanPayment
from django.contrib.auth.models import User
from decimal import Decimal

# Get user Joel
user = User.objects.get(username='joel')

# Get all loans
loans = Loan.objects.filter(user=user).prefetch_related('payments')

print("=" * 60)
print("RESUMEN DE PRÉSTAMOS - USUARIO: joel")
print("=" * 60)

total_debt = Decimal('0')
total_paid = Decimal('0')
remaining_debt = Decimal('0')

for loan in loans:
    paid_amount = loan.total_paid
    remaining = loan.amount - paid_amount
    
    print(f"\nPréstamo: {loan.name}")
    print(f"  ID: {loan.id}")
    print(f"  Monto original: ${loan.amount}")
    print(f"  Total pagado: ${paid_amount}")
    print(f"  Restante: ${remaining}")
    print(f"  Cuotas: {loan.paid_installments}/{loan.installments}")
    print(f"  Completado: {'Sí' if loan.is_completed else 'No'}")
    
    # Mostrar pagos
    payments = loan.payments.all()
    if payments:
        print(f"  Pagos realizados:")
        for payment in payments:
            print(f"    - ${payment.amount} el {payment.date}")
    
    total_debt += loan.amount
    total_paid += paid_amount
    remaining_debt += remaining

print("\n" + "=" * 60)
print("TOTALES:")
print(f"  Deuda total: ${total_debt}")
print(f"  Total pagado: ${total_paid}")
print(f"  Deuda pendiente: ${remaining_debt}")
print("=" * 60)
