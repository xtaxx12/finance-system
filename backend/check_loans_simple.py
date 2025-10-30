import os
import sys
import django

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'finance_api.settings')
django.setup()

from apps.loans.models import Loan, LoanPayment
from django.contrib.auth.models import User
from django.db.models import Sum

users = User.objects.all()

for u in users:
    print(f'\n👤 Usuario: {u.username}')
    loans = Loan.objects.filter(user=u)
    
    for l in loans:
        print(f'  📋 {l.name}:')
        print(f'     Total: ${l.amount}')
        print(f'     Pagado: ${l.total_paid}')
        print(f'     Restante: ${l.remaining_amount}')
        print(f'     Cuotas: {l.paid_installments}/{l.installments}')
    
    total_debt = Loan.objects.filter(user=u).aggregate(t=Sum("amount"))["t"] or 0
    total_paid = LoanPayment.objects.filter(loan__user=u).aggregate(t=Sum("amount"))["t"] or 0
    
    print(f'  📊 Resumen:')
    print(f'     Total deuda: ${total_debt}')
    print(f'     Total pagado: ${total_paid}')
    print(f'     Restante: ${total_debt - total_paid}')
