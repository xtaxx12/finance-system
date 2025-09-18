from rest_framework import serializers
from .models import Notification, NotificationPreference

class NotificationSerializer(serializers.ModelSerializer):
    tiempo_transcurrido = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id', 'tipo', 'titulo', 'mensaje', 'prioridad', 'leida', 
            'meta_relacionada', 'data_extra', 'created_at', 'read_at',
            'tiempo_transcurrido'
        ]
        read_only_fields = ['id', 'created_at', 'read_at', 'tiempo_transcurrido']
    
    def get_tiempo_transcurrido(self, obj):
        from django.utils import timezone
        from datetime import timedelta
        
        now = timezone.now()
        diff = now - obj.created_at
        
        if diff.days > 0:
            return f"hace {diff.days} día{'s' if diff.days > 1 else ''}"
        elif diff.seconds > 3600:
            hours = diff.seconds // 3600
            return f"hace {hours} hora{'s' if hours > 1 else ''}"
        elif diff.seconds > 60:
            minutes = diff.seconds // 60
            return f"hace {minutes} minuto{'s' if minutes > 1 else ''}"
        else:
            return "hace un momento"

class NotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreference
        fields = [
            'goal_deadline_enabled', 'goal_completed_enabled', 'goal_overdue_enabled',
            'savings_reminder_enabled', 'milestone_reached_enabled',
            'deadline_days_before', 'reminder_frequency_days',
            'web_notifications', 'email_notifications'
        ]