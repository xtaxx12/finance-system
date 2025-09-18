from django.db import models
from django.contrib.auth.models import User
from apps.categories.models import Category
from decimal import Decimal
from django.utils import timezone
from datetime import datetime

class MonthlyBudget(models.Model):
    """Presupuesto mensual general del usuario"""
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='monthly_budgets')
    año = models.IntegerField()
    mes = models.IntegerField()  # 1-12
    presupuesto_total = models.DecimalField(max_digits=12, decimal_places=2)
    gastado_actual = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    activo = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Presupuesto Mensual'
        verbose_name_plural = 'Presupuestos Mensuales'
        unique_together = ['usuario', 'año', 'mes']
        ordering = ['-año', '-mes']
    
    def __str__(self):
        return f"Presupuesto {self.mes}/{self.año} - {self.usuario.username}"
    
    @property
    def porcentaje_gastado(self):
        if self.presupuesto_total > 0:
            return min((self.gastado_actual / self.presupuesto_total) * 100, 100)
        return 0
    
    @property
    def presupuesto_restante(self):
        return max(self.presupuesto_total - self.gastado_actual, 0)
    
    @property
    def esta_excedido(self):
        return self.gastado_actual > self.presupuesto_total
    
    @property
    def dias_restantes_mes(self):
        today = timezone.now().date()
        if today.year == self.año and today.month == self.mes:
            # Último día del mes actual
            if self.mes == 12:
                ultimo_dia = datetime(self.año + 1, 1, 1).date()
            else:
                ultimo_dia = datetime(self.año, self.mes + 1, 1).date()
            
            from datetime import timedelta
            ultimo_dia = ultimo_dia - timedelta(days=1)
            return (ultimo_dia - today).days + 1
        return 0
    
    @property
    def presupuesto_diario_sugerido(self):
        dias_restantes = self.dias_restantes_mes
        if dias_restantes > 0:
            return self.presupuesto_restante / dias_restantes
        return 0

class CategoryBudget(models.Model):
    """Presupuesto por categoría dentro de un presupuesto mensual"""
    presupuesto_mensual = models.ForeignKey(MonthlyBudget, on_delete=models.CASCADE, related_name='category_budgets')
    categoria = models.ForeignKey(Category, on_delete=models.CASCADE)
    limite_asignado = models.DecimalField(max_digits=12, decimal_places=2)
    gastado_actual = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    alerta_porcentaje = models.IntegerField(default=80)  # Alertar al 80% del límite
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Presupuesto por Categoría'
        verbose_name_plural = 'Presupuestos por Categoría'
        unique_together = ['presupuesto_mensual', 'categoria']
        ordering = ['categoria__nombre']
    
    def __str__(self):
        return f"{self.categoria.nombre} - {self.presupuesto_mensual}"
    
    @property
    def porcentaje_gastado(self):
        if self.limite_asignado > 0:
            return min((self.gastado_actual / self.limite_asignado) * 100, 100)
        return 0
    
    @property
    def limite_restante(self):
        return max(self.limite_asignado - self.gastado_actual, 0)
    
    @property
    def esta_excedido(self):
        return self.gastado_actual > self.limite_asignado
    
    @property
    def necesita_alerta(self):
        return self.porcentaje_gastado >= self.alerta_porcentaje
    
    @property
    def estado(self):
        porcentaje = self.porcentaje_gastado
        if porcentaje >= 100:
            return 'excedido'
        elif porcentaje >= self.alerta_porcentaje:
            return 'alerta'
        elif porcentaje >= 50:
            return 'moderado'
        else:
            return 'saludable'

class BudgetAlert(models.Model):
    """Alertas de presupuesto"""
    ALERT_TYPES = [
        ('category_warning', 'Advertencia de categoría'),
        ('category_exceeded', 'Categoría excedida'),
        ('monthly_warning', 'Advertencia mensual'),
        ('monthly_exceeded', 'Presupuesto mensual excedido'),
    ]
    
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='budget_alerts')
    tipo = models.CharField(max_length=20, choices=ALERT_TYPES)
    presupuesto_mensual = models.ForeignKey(MonthlyBudget, on_delete=models.CASCADE, null=True, blank=True)
    presupuesto_categoria = models.ForeignKey(CategoryBudget, on_delete=models.CASCADE, null=True, blank=True)
    mensaje = models.TextField()
    porcentaje_gastado = models.DecimalField(max_digits=5, decimal_places=2)
    monto_excedido = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    activa = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Alerta de Presupuesto'
        verbose_name_plural = 'Alertas de Presupuesto'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Alerta {self.tipo} - {self.usuario.username}"