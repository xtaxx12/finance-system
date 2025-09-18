from django.contrib import admin
from .models import SavingGoal

@admin.register(SavingGoal)
class SavingGoalAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'monto_objetivo', 'monto_actual', 'porcentaje_completado', 
                   'fecha_limite', 'completada', 'usuario']
    list_filter = ['completada', 'fecha_limite', 'created_at']
    search_fields = ['nombre', 'descripcion', 'usuario__username']
    readonly_fields = ['porcentaje_completado', 'monto_faltante']