from rest_framework import serializers
from .models import SavingGoal

class SavingGoalSerializer(serializers.ModelSerializer):
    porcentaje_completado = serializers.ReadOnlyField()
    monto_faltante = serializers.ReadOnlyField()
    dias_restantes = serializers.ReadOnlyField()
    ahorro_mensual_sugerido = serializers.ReadOnlyField()

    class Meta:
        model = SavingGoal
        fields = [
            'id', 'nombre', 'descripcion', 'monto_objetivo', 'monto_actual',
            'fecha_limite', 'completada', 'created_at', 'updated_at',
            'porcentaje_completado', 'monto_faltante', 'dias_restantes',
            'ahorro_mensual_sugerido'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['usuario'] = self.context['request'].user
        return super().create(validated_data)

    def validate(self, data):
        if data.get('monto_actual', 0) < 0:
            raise serializers.ValidationError("El monto actual no puede ser negativo")
        if data.get('monto_objetivo', 0) <= 0:
            raise serializers.ValidationError("El monto objetivo debe ser mayor a 0")
        return data