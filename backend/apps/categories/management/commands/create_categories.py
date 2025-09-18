from django.core.management.base import BaseCommand
from apps.categories.models import Category


class Command(BaseCommand):
    help = 'Create default categories'

    def handle(self, *args, **options):
        categories = [
            {'name': 'Comida', 'color': '#FF6B6B', 'icon': '🍔'},
            {'name': 'Transporte', 'color': '#4ECDC4', 'icon': '🚗'},
            {'name': 'Vivienda', 'color': '#45B7D1', 'icon': '🏠'},
            {'name': 'Ocio', 'color': '#96CEB4', 'icon': '🎮'},
            {'name': 'Salud', 'color': '#FFEAA7', 'icon': '💊'},
            {'name': 'Educación', 'color': '#DDA0DD', 'icon': '📚'},
            {'name': 'Ropa', 'color': '#98D8C8', 'icon': '👕'},
            {'name': 'Otros', 'color': '#F7DC6F', 'icon': '📦'},
        ]

        created_count = 0
        for cat_data in categories:
            category, created = Category.objects.get_or_create(
                name=cat_data['name'],
                defaults={
                    'color': cat_data['color'],
                    'icon': cat_data['icon']
                }
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f"✅ Categoría '{category.name}' creada")
                )
                created_count += 1
            else:
                self.stdout.write(
                    self.style.WARNING(f"ℹ️ Categoría '{category.name}' ya existe")
                )

        self.stdout.write(
            self.style.SUCCESS(f"\n🎉 Proceso completado: {created_count} categorías creadas")
        )
        self.stdout.write(f"📊 Total de categorías: {Category.objects.count()}")