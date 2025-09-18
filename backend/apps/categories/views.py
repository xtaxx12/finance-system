from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Category
from .serializers import CategorySerializer

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para categorías - solo lectura ya que son predefinidas
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]