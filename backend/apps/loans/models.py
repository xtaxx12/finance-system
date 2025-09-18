from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator
from decimal import Decimal


class Loan(models.Model):
    """Modelo para representar un préstamo o deuda"""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='loans')
    name = models.CharField(max_length=200, verbose_name='Nombre del préstamo')
    description = models.TextField(blank=True, null=True, verbose_name='Descripción')
    amount = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        validators=[MinValueValidator(Decimal('0.01'))],
        verbose_name='Monto total'
    )
    installments = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        verbose_name='Número de cuotas'
    )
    date = models.DateField(verbose_name='Fecha del préstamo')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Préstamo'
        verbose_name_plural = 'Préstamos'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - ${self.amount}"
    
    @property
    def installment_amount(self):
        """Calcula el monto por cuota"""
        return self.amount / self.installments
    
    @property
    def total_paid(self):
        """Calcula el total pagado hasta ahora"""
        return sum(payment.amount for payment in self.payments.all())
    
    @property
    def remaining_amount(self):
        """Calcula el monto restante por pagar"""
        return max(Decimal('0'), self.amount - self.total_paid)
    
    @property
    def paid_installments(self):
        """Cuenta las cuotas pagadas"""
        return self.payments.count()
    
    @property
    def progress_percentage(self):
        """Calcula el porcentaje de progreso"""
        if self.installments == 0:
            return 0
        return (self.paid_installments / self.installments) * 100
    
    @property
    def is_completed(self):
        """Verifica si el préstamo está completamente pagado"""
        return self.paid_installments >= self.installments


class LoanPayment(models.Model):
    """Modelo para representar un pago de préstamo"""
    
    loan = models.ForeignKey(Loan, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        validators=[MinValueValidator(Decimal('0.01'))],
        verbose_name='Monto del pago'
    )
    date = models.DateField(verbose_name='Fecha del pago')
    notes = models.TextField(blank=True, null=True, verbose_name='Notas')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Pago de préstamo'
        verbose_name_plural = 'Pagos de préstamos'
        ordering = ['-date', '-created_at']
    
    def __str__(self):
        return f"Pago de ${self.amount} para {self.loan.name}"