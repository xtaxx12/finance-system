from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import IncomeViewSet, ExpenseViewSet

router = DefaultRouter()
router.register(r'ingresos', IncomeViewSet, basename='ingresos')
router.register(r'gastos', ExpenseViewSet, basename='gastos')

urlpatterns = [
    path('', include(router.urls)),
]