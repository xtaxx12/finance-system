from django.db import models
from django.contrib.auth.models import User
from apps.categories.models import Category

class Income(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ingresos')
    monto = models.DecimalField(max_digits=12, decimal_places=2)
    descripcion = models.CharField(max_length=255, blank=True)
    fecha = models.DateField()
    es_recurrente = models.BooleanField(default=False)
    frecuencia_dias = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Ingreso'
        verbose_name_plural = 'Ingresos'
        ordering = ['-fecha']
        indexes = [
            models.Index(fields=['usuario', '-fecha']),
            models.Index(fields=['usuario', 'fecha']),
            models.Index(fields=['fecha']),
        ]

    def __str__(self):
        return f"{self.descripcion} - ${self.monto}"

class Expense(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='gastos')
    categoria = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    monto = models.DecimalField(max_digits=12, decimal_places=2)
    descripcion = models.CharField(max_length=255, blank=True)
    fecha = models.DateField()
    es_recurrente = models.BooleanField(default=False)
    frecuencia_dias = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Gasto'
        verbose_name_plural = 'Gastos'
        ordering = ['-fecha']
        indexes = [
            models.Index(fields=['usuario', '-fecha']),
            models.Index(fields=['usuario', 'fecha']),
            models.Index(fields=['usuario', 'categoria', 'fecha']),
            models.Index(fields=['fecha']),
        ]

    def __str__(self):
        return f"{self.descripcion} - ${self.monto}"