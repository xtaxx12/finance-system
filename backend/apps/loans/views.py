from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Q
from decimal import Decimal
from .models import Loan, LoanPayment
from .serializers import LoanSerializer, LoanPaymentSerializer, LoanPaymentCreateSerializer


class LoanViewSet(viewsets.ModelViewSet):
    serializer_class = LoanSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Loan.objects.filter(user=self.request.user).prefetch_related('payments')
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Obtiene un resumen de todos los préstamos del usuario"""
        loans = self.get_queryset()
        
        total_debt = Decimal('0')
        total_paid = Decimal('0')
        active_loans = 0
        completed_loans = 0
        
        for loan in loans:
            total_debt += loan.amount
            total_paid += loan.total_paid
            if loan.is_completed:
                completed_loans += 1
            else:
                active_loans += 1
        
        remaining_debt = total_debt - total_paid
        
        return Response({
            'total_loans': loans.count(),
            'active_loans': active_loans,
            'completed_loans': completed_loans,
            'total_debt': total_debt,
            'total_paid': total_paid,
            'remaining_debt': remaining_debt,
            'completion_percentage': (total_paid / total_debt * 100) if total_debt > 0 else 0
        })
    
    @action(detail=True, methods=['post'])
    def add_payment(self, request, pk=None):
        """Agrega un pago a un préstamo específico"""
        loan = self.get_object()
        serializer = LoanPaymentCreateSerializer(
            data=request.data,
            context={'request': request, 'view': self}
        )
        
        if serializer.is_valid():
            payment = serializer.save()
            return Response(
                LoanPaymentSerializer(payment).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def payments(self, request, pk=None):
        """Obtiene todos los pagos de un préstamo específico"""
        loan = self.get_object()
        payments = loan.payments.all()
        serializer = LoanPaymentSerializer(payments, many=True)
        return Response(serializer.data)


class LoanPaymentViewSet(viewsets.ModelViewSet):
    serializer_class = LoanPaymentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return LoanPayment.objects.filter(
            loan__user=self.request.user
        ).select_related('loan')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return LoanPaymentCreateSerializer
        return LoanPaymentSerializer