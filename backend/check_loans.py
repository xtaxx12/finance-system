#!/usr/bin/env python
"""Script para verificar los préstamos en la base de datos"""
import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'finance_api.settings')
django.setup()

from apps.loans.models import Loan, LoanPayment
from django.contrib.auth.models import User

# Obtener todos los usuarios
users = User.objects.all()

print("=" * 80)
print("VERIFICACIÓN DE PRÉSTAMOS EN LA BASE DE DATOS")
print("=" * 80)

for user in users:
    print(f"\n👤 Usuario: {user.username} (ID: {user.id})")
    print("-" * 80)
    
    loans = Loan.objects.filter(user=user).prefetch_related('payments')
    
    if not loans.exists():
        print("   ❌ No tiene préstamos")
        continue
    
    total_debt = 0
    total_paid = 0
    
    for loan in loans:
        payments = loan.payments.all()
        paid_amount = sum(p.amount for p in payments)
        remaining = loan.amount - paid_amount
        
        print(f"\n   📋 Préstamo: {loan.name}")
        print(f"      ID: {loan.id}")
        print(f"      Monto total: ${loan.amount}")
        print(f"      Cuotas: {loan.installments}")
        print(f"      Monto por cuota: ${loan.installment_amount}")
        print(f"      Fecha: {loan.date}")
        print(f"      Pagos realizados: {payments.count()}")
        print(f"      Total pagado: ${paid_amount}")
        print(f"      Restante: ${remaining}")
        print(f"      Progreso: {loan.progress_percentage:.1f}%")
        
        if payments.exists():
            print(f"\n      💰 Historial de pagos:")
            for payment in payments:
                print(f"         - {payment.date}: ${payment.amount}")
        
        total_debt += loan.amount
        total_paid += paid_amount
    
    remaining_debt = total_debt - total_paid
    
    print(f"\n   📊 RESUMEN DEL USUARIO:")
    print(f"      Total préstamos: {loans.count()}")
    print(f"      Deuda total: ${total_debt}")
    print(f"      Total pagado: ${total_paid}")
    print(f"      Deuda restante: ${remaining_debt}")
    print("=" * 80)
