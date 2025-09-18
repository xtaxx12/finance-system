from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from decimal import Decimal
from django.utils import timezone
from .models import SavingGoal
from .serializers import SavingGoalSerializer
from apps.transactions.models import Expense
from apps.categories.models import Category

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
        
        if not amount:
            return Response(
                {'error': 'Debe proporcionar un monto'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Convertir a Decimal para mantener precisión
            amount_decimal = Decimal(str(amount))
            if amount_decimal <= 0:
                return Response(
                    {'error': 'El monto debe ser mayor a 0'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        except (ValueError, TypeError):
            return Response(
                {'error': 'Monto inválido'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Crear un gasto automáticamente para reflejar el ahorro en el balance
        try:
            # Buscar o crear una categoría "Ahorro" 
            ahorro_categoria, created = Category.objects.get_or_create(
                nombre='Ahorro',
                defaults={
                    'descripcion': 'Dinero destinado a metas de ahorro',
                    'color': '#17a2b8',
                    'icono': 'piggy-bank'
                }
            )
            
            # Crear el gasto de ahorro
            Expense.objects.create(
                usuario=request.user,
                categoria=ahorro_categoria,
                monto=amount_decimal,
                descripcion=f'Ahorro para: {goal.nombre}',
                fecha=timezone.now().date(),
                es_recurrente=False
            )
            
        except Exception as e:
            return Response(
                {'error': f'Error al registrar el gasto de ahorro: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Actualizar la meta
        goal.monto_actual += amount_decimal
        
        # Marcar como completada si se alcanzó el objetivo
        if goal.monto_actual >= goal.monto_objetivo:
            goal.completada = True
            
        goal.save()
        
        serializer = self.get_serializer(goal)
        return Response({
            **serializer.data,
            'message': f'Se agregaron {amount_decimal} a tu meta y se registró como gasto de ahorro'
        })

    @action(detail=True, methods=['post'])
    def mark_completed(self, request, pk=None):
        """Marcar meta como completada"""
        goal = self.get_object()
        goal.completada = True
        goal.save()
        
        serializer = self.get_serializer(goal)
        return Response(serializer.data)