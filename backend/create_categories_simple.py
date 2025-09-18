#!/usr/bin/env python
"""
Script simple para crear categorías predefinidas
"""
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'finance_api.settings')
django.setup()

from apps.categories.models import Category

def create_categories():
    print("🚀 Creando categorías predefinidas...")
    
    categories = [
        {'nombre': 'Comida', 'color': '#FF6B6B', 'icono': '🍔', 'descripcion': 'Gastos en alimentación'},
        {'nombre': 'Transporte', 'color': '#4ECDC4', 'icono': '🚗', 'descripcion': 'Gastos en transporte'},
        {'nombre': 'Vivienda', 'color': '#45B7D1', 'icono': '🏠', 'descripcion': 'Gastos del hogar'},
        {'nombre': 'Ocio', 'color': '#96CEB4', 'icono': '🎮', 'descripcion': 'Entretenimiento y diversión'},
        {'nombre': 'Salud', 'color': '#FFEAA7', 'icono': '💊', 'descripcion': 'Gastos médicos y salud'},
        {'nombre': 'Educación', 'color': '#DDA0DD', 'icono': '📚', 'descripcion': 'Gastos educativos'},
        {'nombre': 'Ropa', 'color': '#98D8C8', 'icono': '👕', 'descripcion': 'Vestimenta y accesorios'},
        {'nombre': 'Otros', 'color': '#F7DC6F', 'icono': '📦', 'descripcion': 'Otros gastos varios'},
    ]
    
    # Verificar si ya existen categorías
    existing_count = Category.objects.count()
    if existing_count > 0:
        print(f"ℹ️ Ya existen {existing_count} categorías. Saltando creación.")
        return
    
    created_count = 0
    try:
        for cat_data in categories:
            category, created = Category.objects.get_or_create(
                nombre=cat_data['nombre'],
                defaults={
                    'color': cat_data['color'],
                    'icono': cat_data['icono'],
                    'descripcion': cat_data['descripcion']
                }
            )
            if created:
                print(f"✅ Categoría '{category.nombre}' creada")
                created_count += 1
            else:
                print(f"ℹ️ Categoría '{category.nombre}' ya existe")
        
        print(f"\n🎉 Proceso completado: {created_count} categorías creadas")
        print(f"📊 Total de categorías: {Category.objects.count()}")
        
    except Exception as e:
        print(f"❌ Error al crear categorías: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    create_categories()