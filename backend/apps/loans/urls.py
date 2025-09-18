from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers
from .views import LoanViewSet, LoanPaymentViewSet

# Router principal
router = DefaultRouter()
router.register(r'loans', LoanViewSet, basename='loan')

# Router anidado para pagos de préstamos
loans_router = routers.NestedDefaultRouter(router, r'loans', lookup='loan')
loans_router.register(r'payments', LoanPaymentViewSet, basename='loan-payments')

# Router independiente para todos los pagos
router.register(r'loan-payments', LoanPaymentViewSet, basename='loanpayment')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(loans_router.urls)),
]