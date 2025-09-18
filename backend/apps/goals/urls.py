from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SavingGoalViewSet

router = DefaultRouter()
router.register(r'', SavingGoalViewSet, basename='metas')

urlpatterns = [
    path('', include(router.urls)),
]