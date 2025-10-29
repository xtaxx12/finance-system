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
    
    def perform_create(self, serializer):
        """Actualizar presupuestos cuando se crea un gasto"""
        expense = serializer.save()
        self.update_budgets_after_expense(expense)
    
    def perform_update(self, serializer):
        """Actualizar presupuestos cuando se modifica un gasto"""
        expense = serializer.save()
        self.update_budgets_after_expense(expense)
    
    def perform_destroy(self, instance):
        """Actualizar presupuestos cuando se elimina un gasto"""
        # Guardar datos antes de eliminar
        usuario = instance.usuario
        fecha = instance.fecha
        categoria = instance.categoria
        
        super().perform_destroy(instance)
        
        # Actualizar presupuestos después de eliminar
        self.update_budgets_after_deletion(usuario, fecha, categoria)
    
    def update_budgets_after_expense(self, expense):
        """Actualizar presupuestos relacionados después de crear/modificar un gasto"""
        try:
            from apps.budgets.models import MonthlyBudget, CategoryBudget
            
            # Buscar presupuesto mensual correspondiente
            monthly_budget = MonthlyBudget.objects.filter(
                usuario=expense.usuario,
                año=expense.fecha.year,
                mes=expense.fecha.month,
                activo=True
            ).first()
            
            if monthly_budget:
                # Actualizar gastos del presupuesto mensual
                self.recalculate_monthly_budget(monthly_budget)
                
                # Actualizar presupuesto de categoría si existe
                if expense.categoria:
                    category_budget = CategoryBudget.objects.filter(
                        presupuesto_mensual=monthly_budget,
                        categoria=expense.categoria
                    ).first()
                    
                    if category_budget:
                        self.recalculate_category_budget(category_budget)
        except Exception as e:
            # Log error but don't fail the transaction
            print(f"Error updating budgets: {e}")
    
    def update_budgets_after_deletion(self, usuario, fecha, categoria):
        """Actualizar presupuestos después de eliminar un gasto"""
        try:
            from apps.budgets.models import MonthlyBudget, CategoryBudget
            
            monthly_budget = MonthlyBudget.objects.filter(
                usuario=usuario,
                año=fecha.year,
                mes=fecha.month,
                activo=True
            ).first()
            
            if monthly_budget:
                self.recalculate_monthly_budget(monthly_budget)
                
                if categoria:
                    category_budget = CategoryBudget.objects.filter(
                        presupuesto_mensual=monthly_budget,
                        categoria=categoria
                    ).first()
                    
                    if category_budget:
                        self.recalculate_category_budget(category_budget)
        except Exception as e:
            print(f"Error updating budgets after deletion: {e}")
    
    def recalculate_monthly_budget(self, monthly_budget):
        """Recalcular gastos totales del presupuesto mensual"""
        inicio_mes = datetime(monthly_budget.año, monthly_budget.mes, 1).date()
        if monthly_budget.mes == 12:
            fin_mes = datetime(monthly_budget.año + 1, 1, 1).date() - timedelta(days=1)
        else:
            fin_mes = datetime(monthly_budget.año, monthly_budget.mes + 1, 1).date() - timedelta(days=1)
        
        total_gastado = Expense.objects.filter(
            usuario=monthly_budget.usuario,
            fecha__range=[inicio_mes, fin_mes]
        ).aggregate(total=Sum('monto'))['total'] or 0
        
        monthly_budget.gastado_actual = total_gastado
        monthly_budget.save()
    
    def recalculate_category_budget(self, category_budget):
        """Recalcular gastos de una categoría específica"""
        monthly_budget = category_budget.presupuesto_mensual
        inicio_mes = datetime(monthly_budget.año, monthly_budget.mes, 1).date()
        if monthly_budget.mes == 12:
            fin_mes = datetime(monthly_budget.año + 1, 1, 1).date() - timedelta(days=1)
        else:
            fin_mes = datetime(monthly_budget.año, monthly_budget.mes + 1, 1).date() - timedelta(days=1)
        
        gasto_categoria = Expense.objects.filter(
            usuario=monthly_budget.usuario,
            categoria=category_budget.categoria,
            fecha__range=[inicio_mes, fin_mes]
        ).aggregate(total=Sum('monto'))['total'] or 0
        
        category_budget.gastado_actual = gasto_categoria
        category_budget.save()
        
        # Verificar alertas
        self.check_budget_alerts(category_budget)
    
    def check_budget_alerts(self, category_budget):
        """Verificar y crear alertas de presupuesto"""
        try:
            from apps.budgets.models import BudgetAlert
            
            if category_budget.necesita_alerta:
                # Verificar si ya existe una alerta reciente
                existing_alert = BudgetAlert.objects.filter(
                    usuario=category_budget.presupuesto_mensual.usuario,
                    presupuesto_categoria=category_budget,
                    activa=True,
                    created_at__date=timezone.now().date()
                ).exists()
                
                if not existing_alert:
                    alert_type = 'category_exceeded' if category_budget.esta_excedido else 'category_warning'
                    mensaje = f"Has gastado {category_budget.porcentaje_gastado:.1f}% de tu presupuesto en {category_budget.categoria.nombre}"
                    
                    BudgetAlert.objects.create(
                        usuario=category_budget.presupuesto_mensual.usuario,
                        tipo=alert_type,
                        presupuesto_categoria=category_budget,
                        mensaje=mensaje,
                        porcentaje_gastado=category_budget.porcentaje_gastado,
                        monto_excedido=max(category_budget.gastado_actual - category_budget.limite_asignado, 0)
                    )
        except Exception as e:
            print(f"Error checking budget alerts: {e}")

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
        
        # Evolución de los últimos 6 meses - optimized with single query
        evolucion_mensual = []
        
        # Calculate date range for last 6 months
        end_date = timezone.now().date()
        start_date = end_date.replace(day=1)
        for i in range(5, -1, -1):
            # Calculate start of month going backwards
            month_offset = i
            year_offset = month_offset // 12
            month_num = start_date.month - (month_offset % 12)
            year_num = start_date.year - year_offset
            
            if month_num <= 0:
                month_num += 12
                year_num -= 1
        
        # Get all transactions for the last 6 months in two queries
        six_months_ago = datetime(year_num, month_num, 1).date()
        
        ingresos_data = Income.objects.filter(
            usuario=user,
            fecha__gte=six_months_ago,
            fecha__lte=end_date
        ).values(
            'fecha__year', 'fecha__month'
        ).annotate(
            total=Sum('monto')
        ).order_by('fecha__year', 'fecha__month')
        
        gastos_data = Expense.objects.filter(
            usuario=user,
            fecha__gte=six_months_ago,
            fecha__lte=end_date
        ).values(
            'fecha__year', 'fecha__month'
        ).annotate(
            total=Sum('monto')
        ).order_by('fecha__year', 'fecha__month')
        
        # Convert to dictionaries for fast lookup
        ingresos_dict = {(item['fecha__year'], item['fecha__month']): item['total'] for item in ingresos_data}
        gastos_dict = {(item['fecha__year'], item['fecha__month']): item['total'] for item in gastos_data}
        
        # Build the evolution list
        for i in range(5, -1, -1):
            fecha_mes = timezone.now().date().replace(day=1) - timedelta(days=i*30)
            mes_num = fecha_mes.month
            año_num = fecha_mes.year
            
            ingresos = ingresos_dict.get((año_num, mes_num), 0)
            gastos = gastos_dict.get((año_num, mes_num), 0)
            
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