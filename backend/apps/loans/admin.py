from django.contrib import admin
from .models import Loan, LoanPayment


@admin.register(Loan)
class LoanAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'amount', 'installments', 'date', 'created_at']
    list_filter = ['date', 'created_at']
    search_fields = ['name', 'user__username', 'user__email']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Información básica', {
            'fields': ('user', 'name', 'description')
        }),
        ('Detalles financieros', {
            'fields': ('amount', 'installments', 'date')
        }),

        ('Metadatos', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(LoanPayment)
class LoanPaymentAdmin(admin.ModelAdmin):
    list_display = ['loan', 'amount', 'date', 'created_at']
    list_filter = ['date', 'created_at', 'loan__user']
    search_fields = ['loan__name', 'loan__user__username', 'notes']
    readonly_fields = ['created_at']
    
    fieldsets = (
        ('Información del pago', {
            'fields': ('loan', 'amount', 'date', 'notes')
        }),
        ('Metadatos', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        })
    )