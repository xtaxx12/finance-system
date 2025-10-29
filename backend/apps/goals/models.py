from django.db import models
from django.contrib.auth.models import User
from datetime import date
from decimal import Decimal

class SavingGoal(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='metas_ahorro')
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True)
    monto_objetivo = models.DecimalField(max_digits=12, decimal_places=2)
    monto_actual = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    fecha_limite = models.DateField(null=True, blank=True)
    completada = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Meta de Ahorro'
        verbose_name_plural = 'Metas de Ahorro'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['usuario', 'completada', '-created_at']),
            models.Index(fields=['usuario', '-created_at']),
            models.Index(fields=['usuario', 'fecha_limite']),
        ]

    def __str__(self):
        return f"{self.nombre} - ${self.monto_objetivo}"

    @property
    def porcentaje_completado(self):
        if self.monto_objetivo > 0:
            return min(float((self.monto_actual / self.monto_objetivo) * 100), 100)
        return 0

    @property
    def monto_faltante(self):
        return max(self.monto_objetivo - self.monto_actual, 0)

    @property
    def dias_restantes(self):
        if self.fecha_limite:
            delta = self.fecha_limite - date.today()
            return max(delta.days, 0)
        return None

    @property
    def ahorro_mensual_sugerido(self):
        if self.fecha_limite and self.dias_restantes > 0:
            meses_restantes = max(Decimal(str(self.dias_restantes)) / Decimal('30'), Decimal('1'))
            return self.monto_faltante / meses_restantes
        return None