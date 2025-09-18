from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import SavingGoal
from .serializers import SavingGoalSerializer

class SavingGoalViewSet(viewsets.ModelViewSet):
    serializer_class = SavingGoalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SavingGoal.objects.filter(usuario=self.request.user)

    @action(detail=True, methods=['post'])
    def add_savings(self, request, pk=None):
        """Agregar dinero a una meta de ahorro"""
        goal = self.get_object()
        amount = request.data.get('amount')
        
        if not amount or float(amount) <= 0:
            return Response(
                {'error': 'Debe proporcionar un monto válido mayor a 0'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        goal.monto_actual += float(amount)
        
        # Marcar como completada si se alcanzó el objetivo
        if goal.monto_actual >= goal.monto_objetivo:
            goal.completada = True
            
        goal.save()
        
        serializer = self.get_serializer(goal)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def mark_completed(self, request, pk=None):
        """Marcar meta como completada"""
        goal = self.get_object()
        goal.completada = True
        goal.save()
        
        serializer = self.get_serializer(goal)
        return Response(serializer.data)