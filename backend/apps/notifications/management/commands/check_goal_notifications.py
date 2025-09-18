from django.core.management.base import BaseCommand
from apps.notifications.services import NotificationService

class Command(BaseCommand):
    help = 'Verificar metas y crear notificaciones necesarias'
    
    def handle(self, *args, **options):
        self.stdout.write('Verificando metas y creando notificaciones...')
        
        try:
            NotificationService.check_and_create_goal_notifications()
            self.stdout.write(
                self.style.SUCCESS('✅ Notificaciones verificadas exitosamente')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Error al verificar notificaciones: {str(e)}')
            )