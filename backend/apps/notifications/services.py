from django.utils import timezone
from datetime import timedelta
from .models import Notification, NotificationPreference
from apps.goals.models import SavingGoal

class NotificationService:
    """Servicio para crear y gestionar notificaciones"""
    
    @staticmethod
    def create_notification(usuario, tipo, titulo, mensaje, meta_relacionada=None, prioridad='medium', data_extra=None):
        """Crear una nueva notificación"""
        return Notification.objects.create(
            usuario=usuario,
            tipo=tipo,
            titulo=titulo,
            mensaje=mensaje,
            meta_relacionada=meta_relacionada,
            prioridad=prioridad,
            data_extra=data_extra or {}
        )
    
    @staticmethod
    def notify_goal_completed(goal):
        """Notificar cuando se completa una meta"""
        preferences = NotificationPreference.objects.filter(
            usuario=goal.usuario,
            goal_completed_enabled=True
        ).first()
        
        if preferences:
            return NotificationService.create_notification(
                usuario=goal.usuario,
                tipo='goal_completed',
                titulo='🎉 ¡Meta Completada!',
                mensaje=f'¡Felicidades! Has completado tu meta "{goal.nombre}" de {goal.monto_objetivo}.',
                meta_relacionada=goal,
                prioridad='high',
                data_extra={
                    'monto_objetivo': float(goal.monto_objetivo),
                    'monto_actual': float(goal.monto_actual)
                }
            )
    
    @staticmethod
    def notify_goal_deadline_approaching(goal, days_remaining):
        """Notificar cuando se acerca la fecha límite de una meta"""
        preferences = NotificationPreference.objects.filter(
            usuario=goal.usuario,
            goal_deadline_enabled=True
        ).first()
        
        if preferences and days_remaining <= preferences.deadline_days_before:
            prioridad = 'urgent' if days_remaining <= 3 else 'high'
            
            return NotificationService.create_notification(
                usuario=goal.usuario,
                tipo='goal_deadline',
                titulo='⏰ Meta próxima a vencer',
                mensaje=f'Tu meta "{goal.nombre}" vence en {days_remaining} día{"s" if days_remaining > 1 else ""}. Te faltan {goal.monto_faltante} para completarla.',
                meta_relacionada=goal,
                prioridad=prioridad,
                data_extra={
                    'days_remaining': days_remaining,
                    'monto_faltante': float(goal.monto_faltante),
                    'porcentaje_completado': goal.porcentaje_completado
                }
            )
    
    @staticmethod
    def notify_goal_overdue(goal):
        """Notificar cuando una meta está vencida"""
        preferences = NotificationPreference.objects.filter(
            usuario=goal.usuario,
            goal_overdue_enabled=True
        ).first()
        
        if preferences:
            days_overdue = (timezone.now().date() - goal.fecha_limite).days
            
            return NotificationService.create_notification(
                usuario=goal.usuario,
                tipo='goal_overdue',
                titulo='📅 Meta vencida',
                mensaje=f'Tu meta "{goal.nombre}" venció hace {days_overdue} día{"s" if days_overdue > 1 else ""}. ¿Quieres extender la fecha límite?',
                meta_relacionada=goal,
                prioridad='medium',
                data_extra={
                    'days_overdue': days_overdue,
                    'monto_faltante': float(goal.monto_faltante)
                }
            )
    
    @staticmethod
    def notify_savings_reminder(goal):
        """Recordatorio para ahorrar según la meta"""
        preferences = NotificationPreference.objects.filter(
            usuario=goal.usuario,
            savings_reminder_enabled=True
        ).first()
        
        if preferences and goal.ahorro_mensual_sugerido:
            return NotificationService.create_notification(
                usuario=goal.usuario,
                tipo='savings_reminder',
                titulo='💰 Recordatorio de ahorro',
                mensaje=f'Para cumplir tu meta "{goal.nombre}", deberías ahorrar {goal.ahorro_mensual_sugerido} este mes.',
                meta_relacionada=goal,
                prioridad='low',
                data_extra={
                    'ahorro_sugerido': float(goal.ahorro_mensual_sugerido),
                    'porcentaje_completado': goal.porcentaje_completado
                }
            )
    
    @staticmethod
    def notify_milestone_reached(goal, milestone_percentage):
        """Notificar cuando se alcanza un hito (25%, 50%, 75%)"""
        preferences = NotificationPreference.objects.filter(
            usuario=goal.usuario,
            milestone_reached_enabled=True
        ).first()
        
        if preferences:
            return NotificationService.create_notification(
                usuario=goal.usuario,
                tipo='milestone_reached',
                titulo=f'🎯 ¡{milestone_percentage}% completado!',
                mensaje=f'¡Excelente progreso! Has completado el {milestone_percentage}% de tu meta "{goal.nombre}". ¡Sigue así!',
                meta_relacionada=goal,
                prioridad='medium',
                data_extra={
                    'milestone_percentage': milestone_percentage,
                    'monto_actual': float(goal.monto_actual),
                    'monto_objetivo': float(goal.monto_objetivo)
                }
            )
    
    @staticmethod
    def check_and_create_goal_notifications():
        """Verificar todas las metas y crear notificaciones necesarias"""
        today = timezone.now().date()
        
        # Obtener todas las metas activas
        active_goals = SavingGoal.objects.filter(completada=False)
        
        for goal in active_goals:
            if goal.fecha_limite:
                days_remaining = (goal.fecha_limite - today).days
                
                # Verificar si está próxima a vencer
                if days_remaining > 0:
                    # Verificar si ya existe una notificación reciente del mismo tipo
                    recent_deadline_notification = Notification.objects.filter(
                        usuario=goal.usuario,
                        meta_relacionada=goal,
                        tipo='goal_deadline',
                        created_at__gte=today - timedelta(days=1)
                    ).exists()
                    
                    if not recent_deadline_notification:
                        NotificationService.notify_goal_deadline_approaching(goal, days_remaining)
                
                # Verificar si está vencida
                elif days_remaining < 0:
                    recent_overdue_notification = Notification.objects.filter(
                        usuario=goal.usuario,
                        meta_relacionada=goal,
                        tipo='goal_overdue',
                        created_at__gte=today - timedelta(days=7)  # Una vez por semana
                    ).exists()
                    
                    if not recent_overdue_notification:
                        NotificationService.notify_goal_overdue(goal)
            
            # Verificar hitos alcanzados
            percentage = goal.porcentaje_completado
            milestones = [25, 50, 75]
            
            for milestone in milestones:
                if percentage >= milestone:
                    # Verificar si ya se notificó este hito
                    milestone_notification = Notification.objects.filter(
                        usuario=goal.usuario,
                        meta_relacionada=goal,
                        tipo='milestone_reached',
                        data_extra__milestone_percentage=milestone
                    ).exists()
                    
                    if not milestone_notification:
                        NotificationService.notify_milestone_reached(goal, milestone)