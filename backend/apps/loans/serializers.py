from rest_framework import serializers
from .models import Loan, LoanPayment


class LoanPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoanPayment
        fields = ['id', 'amount', 'date', 'notes', 'created_at']
        read_only_fields = ['id', 'created_at']


class LoanSerializer(serializers.ModelSerializer):
    payments = LoanPaymentSerializer(many=True, read_only=True)
    installment_amount = serializers.ReadOnlyField()
    total_paid = serializers.ReadOnlyField()
    remaining_amount = serializers.ReadOnlyField()
    paid_installments = serializers.ReadOnlyField()
    progress_percentage = serializers.ReadOnlyField()
    is_completed = serializers.ReadOnlyField()
    
    class Meta:
        model = Loan
        fields = [
            'id', 'name', 'description', 'amount', 'installments', 'date',
            'created_at', 'updated_at', 'payments', 'installment_amount',
            'total_paid', 'remaining_amount', 'paid_installments',
            'progress_percentage', 'is_completed'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class LoanPaymentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoanPayment
        fields = ['amount', 'date', 'notes']
    
    def create(self, validated_data):
        loan_id = self.context['view'].kwargs['loan_pk']
        loan = Loan.objects.get(id=loan_id, user=self.context['request'].user)
        validated_data['loan'] = loan
        return super().create(validated_data)