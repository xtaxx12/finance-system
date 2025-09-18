from django.core.management.base import BaseCommand
from apps.categories.models import Category


class Command(BaseCommand):
    help = 'Create default categories'

    def handle(self, *args, **options):
        self.stdout.write("🚀 Iniciando creación de categorías...")
        
        # Verificar si ya existen categorías
        existing_count = Category.objects.count()
        if existing_count > 0:
            self.stdout.write(
                self.style.WARNING(f"ℹ️ Ya existen {existing_count} categorías. Saltando creación.")
            )
            return
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
                    self.stdout.write(
                        self.style.SUCCESS(f"✅ Categoría '{category.nombre}' creada")
                    )
                    created_count += 1
                else:
                    self.stdout.write(
                        self.style.WARNING(f"ℹ️ Categoría '{category.nombre}' ya existe")
                    )

            self.stdout.write(
                self.style.SUCCESS(f"\n🎉 Proceso completado: {created_count} categorías creadas")
            )
            self.stdout.write(f"📊 Total de categorías: {Category.objects.count()}")
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"❌ Error al crear categorías: {str(e)}")
            )
            # No fallar el deploy por esto
            self.stdout.write(
                self.style.WARNING("⚠️ Continuando con el deploy...")
            )