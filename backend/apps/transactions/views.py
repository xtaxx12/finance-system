from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Q
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Income, Expense
from .serializers import IncomeSerializer, ExpenseSerializer, DashboardSerializer
import calendar

class IncomeViewSet(viewsets.ModelViewSet):
    serializer_class = IncomeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Income.objects.filter(usuario=self.request.user)

class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Expense.objects.filter(usuario=self.request.user).select_related('categoria')

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Endpoint para obtener datos del dashboard"""
        user = request.user
        
        # Obtener mes y año actual o de parámetros
        mes = int(request.query_params.get('mes', timezone.now().month))
        año = int(request.query_params.get('año', timezone.now().year))
        
        # Filtros de fecha para el mes actual
        inicio_mes = datetime(año, mes, 1).date()
        if mes == 12:
            fin_mes = datetime(año + 1, 1, 1).date() - timedelta(days=1)
        else:
            fin_mes = datetime(año, mes + 1, 1).date() - timedelta(days=1)
        
        # Calcular totales del mes
        ingresos_mes = Income.objects.filter(
            usuario=user, 
            fecha__range=[inicio_mes, fin_mes]
        ).aggregate(total=Sum('monto'))['total'] or 0
        
        gastos_mes = Expense.objects.filter(
            usuario=user, 
            fecha__range=[inicio_mes, fin_mes]
        ).aggregate(total=Sum('monto'))['total'] or 0
        
        balance = ingresos_mes - gastos_mes
        
        # Gastos por categoría
        gastos_por_categoria = Expense.objects.filter(
            usuario=user, 
            fecha__range=[inicio_mes, fin_mes]
        ).values(
            'categoria__nombre', 
            'categoria__color'
        ).annotate(
            total=Sum('monto')
        ).order_by('-total')
        
        # Evolución de los últimos 6 meses
        evolucion_mensual = []
        for i in range(5, -1, -1):
            fecha_mes = timezone.now().date().replace(day=1) - timedelta(days=i*30)
            mes_num = fecha_mes.month
            año_num = fecha_mes.year
            
            inicio = datetime(año_num, mes_num, 1).date()
            if mes_num == 12:
                fin = datetime(año_num + 1, 1, 1).date() - timedelta(days=1)
            else:
                fin = datetime(año_num, mes_num + 1, 1).date() - timedelta(days=1)
            
            ingresos = Income.objects.filter(
                usuario=user, fecha__range=[inicio, fin]
            ).aggregate(total=Sum('monto'))['total'] or 0
            
            gastos = Expense.objects.filter(
                usuario=user, fecha__range=[inicio, fin]
            ).aggregate(total=Sum('monto'))['total'] or 0
            
            evolucion_mensual.append({
                'mes': calendar.month_name[mes_num],
                'año': año_num,
                'ingresos': float(ingresos),
                'gastos': float(gastos),
                'balance': float(ingresos - gastos)
            })
        
        data = {
            'total_ingresos': ingresos_mes,
            'total_gastos': gastos_mes,
            'balance': balance,
            'gastos_por_categoria': [
                {
                    'categoria': item['categoria__nombre'] or 'Sin categoría',
                    'total': float(item['total']),
                    'color': item['categoria__color'] or '#95a5a6'
                }
                for item in gastos_por_categoria
            ],
            'evolucion_mensual': evolucion_mensual
        }
        
        serializer = DashboardSerializer(data)
        return Response(serializer.data)