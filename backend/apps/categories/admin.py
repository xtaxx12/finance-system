from django.contrib import admin
from .models import Category

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'descripcion', 'color', 'icono', 'created_at']
    list_filter = ['created_at']
    search_fields = ['nombre', 'descripcion']