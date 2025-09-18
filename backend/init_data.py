#!/usr/bin/env python
"""
Script para inicializar datos por defecto en la base de datos
"""
import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'finance_api.settings')
django.setup()

from apps.categories.models import Category
from apps.notifications.services import NotificationService

def create_default_categories():
    """Crear categorías por defecto"""
    categories_data = [
        {'nombre': 'Comida', 'descripcion': 'Gastos en alimentación y restaurantes', 'color': '#e74c3c', 'icono': 'utensils'},
        {'nombre': 'Transporte', 'descripcion': 'Gastos en transporte público, gasolina, etc.', 'color': '#f39c12', 'icono': 'car'},
        {'nombre': 'Vivienda', 'descripcion': 'Renta, servicios, mantenimiento del hogar', 'color': '#2ecc71', 'icono': 'home'},
        {'nombre': 'Ocio', 'descripcion': 'Entretenimiento, cine, deportes', 'color': '#9b59b6', 'icono': 'gamepad'},
        {'nombre': 'Salud', 'descripcion': 'Gastos médicos, medicamentos', 'color': '#1abc9c', 'icono': 'heartbeat'},
        {'nombre': 'Educación', 'descripcion': 'Cursos, libros, material educativo', 'color': '#34495e', 'icono': 'graduation-cap'},
        {'nombre': 'Ropa', 'descripcion': 'Vestimenta y accesorios', 'color': '#e67e22', 'icono': 'tshirt'},
        {'nombre': 'Otros', 'descripcion': 'Gastos varios no categorizados', 'color': '#95a5a6', 'icono': 'ellipsis-h'},
    ]
    
    for cat_data in categories_data:
        category, created = Category.objects.get_or_create(
            nombre=cat_data['nombre'],
            defaults=cat_data
        )
        if created:
            print(f"Categoría creada: {category.nombre}")
        else:
            print(f"Categoría ya existe: {category.nombre}")

def check_notifications():
    """Verificar y crear notificaciones para metas existentes"""
    try:
        NotificationService.check_and_create_goal_notifications()
        print("Notificaciones verificadas")
    except Exception as e:
        print(f"Error al verificar notificaciones: {e}")

if __name__ == '__main__':
    print("Inicializando datos por defecto...")
    create_default_categories()
    check_notifications()
    print("¡Datos inicializados correctamente!")