from rest_framework import serializers
from .models import MonthlyBudget, CategoryBudget, BudgetAlert
from apps.categories.serializers import CategorySerializer

class CategoryBudgetSerializer(serializers.ModelSerializer):
    categoria_info = CategorySerializer(source='categoria', read_only=True)
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)
    porcentaje_gastado = serializers.ReadOnlyField()
    limite_restante = serializers.ReadOnlyField()
    esta_excedido = serializers.ReadOnlyField()
    necesita_alerta = serializers.ReadOnlyField()
    estado = serializers.ReadOnlyField()
    
    class Meta:
        model = CategoryBudget
        fields = [
            'id', 'categoria', 'categoria_info', 'categoria_nombre', 'limite_asignado', 'gastado_actual',
            'alerta_porcentaje', 'porcentaje_gastado', 'limite_restante', 
            'esta_excedido', 'necesita_alerta', 'estado', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'gastado_actual', 'created_at', 'updated_at']
    
    def to_representation(self, instance):
        """Personalizar la representación para manejar errores"""
        try:
            return super().to_representation(instance)
        except Exception as e:
            # Si hay error, devolver representación básica
            return {
                'id': instance.id if hasattr(instance, 'id') else None,
                'categoria': instance.categoria.id if hasattr(instance, 'categoria') and hasattr(instance.categoria, 'id') else instance.categoria,
                'categoria_nombre': getattr(instance.categoria, 'nombre', 'Categoría') if hasattr(instance, 'categoria') else 'Categoría',
                'limite_asignado': float(instance.limite_asignado) if hasattr(instance, 'limite_asignado') else 0,
                'gastado_actual': float(instance.gastado_actual) if hasattr(instance, 'gastado_actual') else 0,
                'alerta_porcentaje': instance.alerta_porcentaje if hasattr(instance, 'alerta_porcentaje') else 80,
                'porcentaje_gastado': getattr(instance, 'porcentaje_gastado', 0),
                'limite_restante': getattr(instance, 'limite_restante', 0),
                'esta_excedido': getattr(instance, 'esta_excedido', False),
                'necesita_alerta': getattr(instance, 'necesita_alerta', False),
                'estado': getattr(instance, 'estado', 'normal'),
            }

class MonthlyBudgetSerializer(serializers.ModelSerializer):
    category_budgets = CategoryBudgetSerializer(many=True, read_only=True)
    porcentaje_gastado = serializers.ReadOnlyField()
    presupuesto_restante = serializers.ReadOnlyField()
    esta_excedido = serializers.ReadOnlyField()
    dias_restantes_mes = serializers.ReadOnlyField()
    presupuesto_diario_sugerido = serializers.ReadOnlyField()
    
    class Meta:
        model = MonthlyBudget
        fields = [
            'id', 'año', 'mes', 'presupuesto_total', 'gastado_actual', 'activo',
            'category_budgets', 'porcentaje_gastado', 'presupuesto_restante',
            'esta_excedido', 'dias_restantes_mes', 'presupuesto_diario_sugerido',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'gastado_actual', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        validated_data['usuario'] = self.context['request'].user
        return super().create(validated_data)
    
    def to_representation(self, instance):
        """Personalizar la representación para manejar errores"""
        try:
            return super().to_representation(instance)
        except Exception as e:
            # Si hay error, devolver representación básica
            return {
                'id': instance.id if hasattr(instance, 'id') else None,
                'año': instance.año if hasattr(instance, 'año') else 0,
                'mes': instance.mes if hasattr(instance, 'mes') else 0,
                'presupuesto_total': float(instance.presupuesto_total) if hasattr(instance, 'presupuesto_total') else 0,
                'gastado_actual': float(instance.gastado_actual) if hasattr(instance, 'gastado_actual') else 0,
                'activo': instance.activo if hasattr(instance, 'activo') else True,
                'category_budgets': [],
                'porcentaje_gastado': getattr(instance, 'porcentaje_gastado', 0),
                'presupuesto_restante': getattr(instance, 'presupuesto_restante', 0),
                'esta_excedido': getattr(instance, 'esta_excedido', False),
                'dias_restantes_mes': getattr(instance, 'dias_restantes_mes', 0),
                'presupuesto_diario_sugerido': getattr(instance, 'presupuesto_diario_sugerido', 0),
            }

class BudgetAlertSerializer(serializers.ModelSerializer):
    presupuesto_categoria_info = CategoryBudgetSerializer(source='presupuesto_categoria', read_only=True)
    
    class Meta:
        model = BudgetAlert
        fields = [
            'id', 'tipo', 'mensaje', 'porcentaje_gastado', 'monto_excedido',
            'activa', 'presupuesto_categoria_info', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class BudgetSummarySerializer(serializers.Serializer):
    """Serializer para resumen de presupuestos"""
    presupuesto_mensual = MonthlyBudgetSerializer()
    alertas_activas = BudgetAlertSerializer(many=True)
    categorias_excedidas = serializers.IntegerField()
    categorias_en_alerta = serializers.IntegerField()
    categoria_mas_gastada = serializers.DictField()
    recomendaciones = serializers.ListField()
    
    def to_representation(self, instance):
        """Personalizar la representación para manejar errores"""
        try:
            return super().to_representation(instance)
        except Exception as e:
            # Si hay error, devolver representación básica
            return {
                'presupuesto_mensual': {},
                'alertas_activas': [],
                'categorias_excedidas': 0,
                'categorias_en_alerta': 0,
                'categoria_mas_gastada': {},
                'recomendaciones': []
            }