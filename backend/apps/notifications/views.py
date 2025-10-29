from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import Notification, NotificationPreference
from .serializers import NotificationSerializer, NotificationPreferenceSerializer

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Optimize queryset with proper ordering"""
        return Notification.objects.filter(
            usuario=self.request.user
        ).order_by('-created_at')
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Obtener cantidad de notificaciones no leídas"""
        count = self.get_queryset().filter(leida=False).count()
        return Response({'unread_count': count})
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Marcar todas las notificaciones como leídas"""
        updated = self.get_queryset().filter(leida=False).update(
            leida=True,
            read_at=timezone.now()
        )
        return Response({'marked_read': updated})
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Marcar una notificación específica como leída"""
        notification = self.get_object()
        notification.mark_as_read()
        return Response({'status': 'marked_read'})
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Obtener notificaciones recientes (últimas 10)"""
        notifications = self.get_queryset()[:10]
        serializer = self.get_serializer(notifications, many=True)
        return Response(serializer.data)

class NotificationPreferenceViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationPreferenceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return NotificationPreference.objects.filter(usuario=self.request.user)
    
    def get_object(self):
        """Obtener o crear preferencias del usuario"""
        obj, created = NotificationPreference.objects.get_or_create(
            usuario=self.request.user
        )
        return obj
    
    @action(detail=False, methods=['get'])
    def my_preferences(self, request):
        """Obtener preferencias del usuario actual"""
        preferences = self.get_object()
        serializer = self.get_serializer(preferences)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def update_preferences(self, request):
        """Actualizar preferencias del usuario"""
        preferences = self.get_object()
        serializer = self.get_serializer(preferences, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)