from rest_framework import serializers
from .models import Income, Expense
from apps.categories.serializers import CategorySerializer

class IncomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Income
        fields = ['id', 'monto', 'descripcion', 'fecha', 'es_recurrente', 
                 'frecuencia_dias', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, data):
        # Si no es recurrente, limpiar frecuencia_dias
        if not data.get('es_recurrente', False):
            data['frecuencia_dias'] = None
        return data

    def create(self, validated_data):
        validated_data['usuario'] = self.context['request'].user
        return super().create(validated_data)

class ExpenseSerializer(serializers.ModelSerializer):
    categoria_info = CategorySerializer(source='categoria', read_only=True)
    
    class Meta:
        model = Expense
        fields = ['id', 'categoria', 'categoria_info', 'monto', 'descripcion', 
                 'fecha', 'es_recurrente', 'frecuencia_dias', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'categoria_info']

    def validate(self, data):
        # Si no es recurrente, limpiar frecuencia_dias
        if not data.get('es_recurrente', False):
            data['frecuencia_dias'] = None
        return data

    def create(self, validated_data):
        validated_data['usuario'] = self.context['request'].user
        return super().create(validated_data)

class DashboardSerializer(serializers.Serializer):
    """Serializer para datos del dashboard"""
    total_ingresos = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_gastos = serializers.DecimalField(max_digits=12, decimal_places=2)
    balance = serializers.DecimalField(max_digits=12, decimal_places=2)
    gastos_por_categoria = serializers.ListField()
    evolucion_mensual = serializers.ListField()