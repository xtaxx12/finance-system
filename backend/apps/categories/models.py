from django.db import models

class Category(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)
    color = models.CharField(max_length=7, default='#3498db')  # Color hex
    icono = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Categoría'
        verbose_name_plural = 'Categorías'
        ordering = ['nombre']

    def __str__(self):
        return self.nombre