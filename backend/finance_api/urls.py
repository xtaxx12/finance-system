from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.urls')),
    path('api/transactions/', include('apps.transactions.urls')),
    path('api/categories/', include('apps.categories.urls')),
    path('api/goals/', include('apps.goals.urls')),
]