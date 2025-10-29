from django.db import models
from django.contrib.auth.models import User

class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('goal_deadline', 'Meta próxima a vencer'),
        ('goal_completed', 'Meta completada'),
        ('goal_overdue', 'Meta vencida'),
        ('savings_reminder', 'Recordatorio de ahorro'),
        ('milestone_reached', 'Hito alcanzado'),
    ]
    
    PRIORITY_LEVELS = [
        ('low', 'Baja'),
        ('medium', 'Media'),
        ('high', 'Alta'),
        ('urgent', 'Urgente'),
    ]
    
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    tipo = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    titulo = models.CharField(max_length=200)
    mensaje = models.TextField()
    prioridad = models.CharField(max_length=10, choices=PRIORITY_LEVELS, default='medium')
    leida = models.BooleanField(default=False)
    meta_relacionada = models.ForeignKey(
        'goals.SavingGoal', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='notifications'
    )
    data_extra = models.JSONField(default=dict, blank=True)  # Para datos adicionales
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = 'Notificación'
        verbose_name_plural = 'Notificaciones'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['usuario', 'leida', '-created_at']),
            models.Index(fields=['usuario', '-created_at']),
            models.Index(fields=['usuario', 'tipo', 'leida']),
        ]
    
    def __str__(self):
        return f"{self.titulo} - {self.usuario.username}"
    
    def mark_as_read(self):
        from django.utils import timezone
        self.leida = True
        self.read_at = timezone.now()
        self.save()

class NotificationPreference(models.Model):
    """Preferencias de notificaciones del usuario"""
    usuario = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_preferences')
    
    # Tipos de notificaciones habilitadas
    goal_deadline_enabled = models.BooleanField(default=True)
    goal_completed_enabled = models.BooleanField(default=True)
    goal_overdue_enabled = models.BooleanField(default=True)
    savings_reminder_enabled = models.BooleanField(default=True)
    milestone_reached_enabled = models.BooleanField(default=True)
    
    # Configuraciones de tiempo
    deadline_days_before = models.IntegerField(default=7)  # Días antes de la fecha límite
    reminder_frequency_days = models.IntegerField(default=30)  # Frecuencia de recordatorios
    
    # Canales de notificación
    web_notifications = models.BooleanField(default=True)
    email_notifications = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Preferencia de Notificación'
        verbose_name_plural = 'Preferencias de Notificaciones'
    
    def __str__(self):
        return f"Preferencias de {self.usuario.username}"