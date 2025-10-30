from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Sum, Q, F
from django.db import models
from decimal import Decimal
from .models import MonthlyBudget, CategoryBudget, BudgetAlert
from .serializers import (
    MonthlyBudgetSerializer, CategoryBudgetSerializer, 
    BudgetAlertSerializer, BudgetSummarySerializer
)
from apps.transactions.models import Expense
from apps.categories.models import Category
from apps.common.date_utils import get_month_date_range
from apps.common.budget_utils import calculate_budget_spending, check_budget_alert_needed

class MonthlyBudgetViewSet(viewsets.ModelViewSet):
    serializer_class = MonthlyBudgetSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Optimize queryset with prefetch_related to avoid N+1 queries"""
        return MonthlyBudget.objects.filter(
            usuario=self.request.user
        ).prefetch_related(
            'category_budgets__categoria'
        )
    
    @action(detail=False, methods=['get'])
    def current_month(self, request):
        """Obtener presupuesto del mes actual"""
        today = timezone.now().date()
        try:
            budget = MonthlyBudget.objects.get(
                usuario=request.user,
                año=today.year,
                mes=today.month
            )
            serializer = self.get_serializer(budget)
            return Response(serializer.data)
        except MonthlyBudget.DoesNotExist:
            return Response({'message': 'No hay presupuesto para este mes'}, 
                          status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['post'])
    def create_current_month(self, request):
        """Crear presupuesto para el mes actual"""
        today = timezone.now().date()
        
        # Verificar si ya existe
        existing = MonthlyBudget.objects.filter(
            usuario=request.user,
            año=today.year,
            mes=today.month
        ).first()
        
        if existing:
            return Response({'error': 'Ya existe un presupuesto para este mes'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        data = request.data.copy()
        data['año'] = today.year
        data['mes'] = today.month
        
        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            budget = serializer.save()
            self.update_budget_spending(budget)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def add_category_budget(self, request, pk=None):
        """Agregar presupuesto para una categoría"""
        budget = self.get_object()
        categoria_id = request.data.get('categoria')
        limite_asignado = request.data.get('limite_asignado')
        alerta_porcentaje = request.data.get('alerta_porcentaje', 80)
        
        if not categoria_id or not limite_asignado:
            return Response({'error': 'Categoria y limite_asignado son requeridos'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        try:
            categoria = Category.objects.get(id=categoria_id)
        except Category.DoesNotExist:
            return Response({'error': 'Categoría no encontrada'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        # Verificar si ya existe
        existing = CategoryBudget.objects.filter(
            presupuesto_mensual=budget,
            categoria=categoria
        ).first()
        
        if existing:
            return Response({'error': 'Ya existe presupuesto para esta categoría'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        category_budget = CategoryBudget.objects.create(
            presupuesto_mensual=budget,
            categoria=categoria,
            limite_asignado=Decimal(str(limite_asignado)),
            alerta_porcentaje=alerta_porcentaje
        )
        
        # Actualizar gastos actuales
        self.update_category_spending(category_budget)
        
        serializer = CategoryBudgetSerializer(category_budget)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Obtener resumen completo de presupuestos"""
        try:
            today = timezone.now().date()
            
            try:
                budget = MonthlyBudget.objects.get(
                    usuario=request.user,
                    año=today.year,
                    mes=today.month
                )
            except MonthlyBudget.DoesNotExist:
                return Response({'message': 'No hay presupuesto para este mes'}, 
                              status=status.HTTP_404_NOT_FOUND)
            
            # Actualizar gastos antes de mostrar resumen
            self.update_budget_spending(budget)
            
            # Obtener alertas activas
            alertas = BudgetAlert.objects.filter(
                usuario=request.user,
                activa=True,
                created_at__month=today.month,
                created_at__year=today.year
            )
            
            # Estadísticas
            category_budgets = budget.category_budgets.all()
            categorias_excedidas = category_budgets.filter(gastado_actual__gt=F('limite_asignado')).count()
            categorias_en_alerta = category_budgets.filter(
                gastado_actual__gte=F('limite_asignado') * F('alerta_porcentaje') / 100
            ).count()
            
            # Categoría más gastada
            categoria_mas_gastada = category_budgets.order_by('-gastado_actual').first()
            categoria_mas_gastada_data = {}
            if categoria_mas_gastada:
                try:
                    categoria_mas_gastada_data = {
                        'nombre': categoria_mas_gastada.categoria.nombre,
                        'gastado': float(categoria_mas_gastada.gastado_actual),
                        'limite': float(categoria_mas_gastada.limite_asignado),
                        'porcentaje': categoria_mas_gastada.porcentaje_gastado
                    }
                except Exception:
                    categoria_mas_gastada_data = {}
            
            # Recomendaciones
            try:
                recomendaciones = self.generate_recommendations(budget)
            except Exception:
                recomendaciones = []
            
            data = {
                'presupuesto_mensual': MonthlyBudgetSerializer(budget).data,
                'alertas_activas': BudgetAlertSerializer(alertas, many=True).data,
                'categorias_excedidas': categorias_excedidas,
                'categorias_en_alerta': categorias_en_alerta,
                'categoria_mas_gastada': categoria_mas_gastada_data,
                'recomendaciones': recomendaciones
            }
            
            serializer = BudgetSummarySerializer(data)
            return Response(serializer.data)
            
        except Exception as e:
            return Response(
                {'error': f'Error interno del servidor: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def update_budget_spending(self, budget):
        """Actualizar gastos del presupuesto mensual"""
        # Calcular gasto total del mes
        total_gastado = calculate_budget_spending(
            budget.usuario,
            budget.año,
            budget.mes
        )
        
        budget.gastado_actual = total_gastado
        budget.save()
        
        # Actualizar gastos por categoría - optimized with single query
        category_budgets = budget.category_budgets.select_related('categoria').all()
        
        # Get all expenses grouped by category in one query
        start_date, end_date = get_month_date_range(budget.año, budget.mes)
        gastos_por_categoria = Expense.objects.filter(
            usuario=budget.usuario,
            fecha__range=[start_date, end_date]
        ).values('categoria').annotate(
            total=Sum('monto')
        )
        
        # Create a dictionary for fast lookup
        gastos_dict = {item['categoria']: item['total'] for item in gastos_por_categoria}
        
        # Update all category budgets
        for category_budget in category_budgets:
            gasto_categoria = gastos_dict.get(category_budget.categoria.id, Decimal('0'))
            category_budget.gastado_actual = gasto_categoria
            category_budget.save()
            
            # Verificar alertas
            self.check_category_alerts(category_budget)
    
    def update_category_spending(self, category_budget):
        """Actualizar gastos de una categoría específica"""
        budget = category_budget.presupuesto_mensual
        
        # Calcular gasto de la categoría
        gasto_categoria = calculate_budget_spending(
            budget.usuario,
            budget.año,
            budget.mes,
            categoria=category_budget.categoria
        )
        
        category_budget.gastado_actual = gasto_categoria
        category_budget.save()
        
        # Verificar si necesita alerta
        self.check_category_alerts(category_budget)
    
    def check_category_alerts(self, category_budget):
        """Verificar y crear alertas para categoría"""
        needs_alert = check_budget_alert_needed(
            category_budget.gastado_actual,
            category_budget.limite_asignado,
            category_budget.alerta_porcentaje
        )
        
        if needs_alert:
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
                    porcentaje_gastado=Decimal(str(category_budget.porcentaje_gastado)),
                    monto_excedido=max(category_budget.gastado_actual - category_budget.limite_asignado, 0)
                )
    
    def generate_recommendations(self, budget):
        """Generar recomendaciones basadas en el presupuesto"""
        recomendaciones = []
        
        try:
            # Recomendación general
            if hasattr(budget, 'esta_excedido') and budget.esta_excedido:
                exceso = budget.gastado_actual - budget.presupuesto_total
                recomendaciones.append({
                    'tipo': 'warning',
                    'titulo': 'Presupuesto mensual excedido',
                    'mensaje': f'Has excedido tu presupuesto mensual por ${exceso:.2f}. Considera revisar tus gastos.'
                })
            elif hasattr(budget, 'porcentaje_gastado') and budget.porcentaje_gastado > 80:
                dias_restantes = getattr(budget, 'dias_restantes_mes', 0)
                recomendaciones.append({
                    'tipo': 'caution',
                    'titulo': 'Presupuesto casi agotado',
                    'mensaje': f'Has gastado {budget.porcentaje_gastado:.1f}% de tu presupuesto. Te quedan {dias_restantes} días del mes.'
                })
            
            # Recomendaciones por categoría - optimized query
            try:
                category_budgets = budget.category_budgets.select_related('categoria').filter(
                    gastado_actual__gt=0
                ).order_by('-porcentaje_gastado')[:3]
                for cat_budget in category_budgets:
                    try:
                        if hasattr(cat_budget, 'esta_excedido') and cat_budget.esta_excedido:
                            exceso = cat_budget.gastado_actual - cat_budget.limite_asignado
                            categoria_nombre = getattr(cat_budget.categoria, 'nombre', 'Categoría')
                            recomendaciones.append({
                                'tipo': 'category_exceeded',
                                'titulo': f'{categoria_nombre} excedida',
                                'mensaje': f'Has excedido el presupuesto de {categoria_nombre} por ${exceso:.2f}'
                            })
                        elif hasattr(cat_budget, 'necesita_alerta') and cat_budget.necesita_alerta:
                            categoria_nombre = getattr(cat_budget.categoria, 'nombre', 'Categoría')
                            porcentaje = getattr(cat_budget, 'porcentaje_gastado', 0)
                            recomendaciones.append({
                                'tipo': 'category_warning',
                                'titulo': f'Cuidado con {categoria_nombre}',
                                'mensaje': f'Has gastado {porcentaje:.1f}% del presupuesto en {categoria_nombre}'
                            })
                    except Exception:
                        continue
            except Exception:
                pass
                
        except Exception:
            pass
        
        return recomendaciones

class CategoryBudgetViewSet(viewsets.ModelViewSet):
    serializer_class = CategoryBudgetSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Optimize queryset with select_related to avoid N+1 queries"""
        return CategoryBudget.objects.filter(
            presupuesto_mensual__usuario=self.request.user
        ).select_related('categoria', 'presupuesto_mensual')

class BudgetAlertViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = BudgetAlertSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return BudgetAlert.objects.filter(usuario=self.request.user)
    
    @action(detail=True, methods=['post'])
    def dismiss(self, request, pk=None):
        """Descartar una alerta"""
        alert = self.get_object()
        alert.activa = False
        alert.save()
        return Response({'status': 'dismissed'})