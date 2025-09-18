from django.contrib import admin
from .models import Income, Expense

@admin.register(Income)
class IncomeAdmin(admin.ModelAdmin):
    list_display = ['descripcion', 'monto', 'fecha', 'usuario', 'es_recurrente']
    list_filter = ['es_recurrente', 'fecha', 'created_at']
    search_fields = ['descripcion', 'usuario__username']
    date_hierarchy = 'fecha'

@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ['descripcion', 'monto', 'fecha', 'categoria', 'usuario', 'es_recurrente']
    list_filter = ['categoria', 'es_recurrente', 'fecha', 'created_at']
    search_fields = ['descripcion', 'usuario__username']
    date_hierarchy = 'fecha'