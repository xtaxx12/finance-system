from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MonthlyBudgetViewSet, CategoryBudgetViewSet, BudgetAlertViewSet

router = DefaultRouter()
router.register(r'monthly', MonthlyBudgetViewSet, basename='monthly-budgets')
router.register(r'categories', CategoryBudgetViewSet, basename='category-budgets')
router.register(r'alerts', BudgetAlertViewSet, basename='budget-alerts')

urlpatterns = [
    path('', include(router.urls)),
]