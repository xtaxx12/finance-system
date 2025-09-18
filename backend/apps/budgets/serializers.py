from rest_framework import serializers
from .models import MonthlyBudget, CategoryBudget, BudgetAlert
from apps.categories.serializers import CategorySerializer

class CategoryBudgetSerializer(serializers.ModelSerializer):
    categoria_info = CategorySerializer(source='categoria', read_only=True)
    porcentaje_gastado = serializers.ReadOnlyField()
    limite_restante = serializers.ReadOnlyField()
    esta_excedido = serializers.ReadOnlyField()
    necesita_alerta = serializers.ReadOnlyField()
    estado = serializers.ReadOnlyField()
    
    class Meta:
        model = CategoryBudget
        fields = [
            'id', 'categoria', 'categoria_info', 'limite_asignado', 'gastado_actual',
            'alerta_porcentaje', 'porcentaje_gastado', 'limite_restante', 
            'esta_excedido', 'necesita_alerta', 'estado', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'gastado_actual', 'created_at', 'updated_at']

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