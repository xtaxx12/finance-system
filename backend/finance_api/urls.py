from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

def health_check(request):
    """Health check endpoint para Render"""
    return JsonResponse({
        'status': 'ok',
        'message': 'Finance API is running'
    })

def cors_preflight(request):
    """Handle CORS preflight requests"""
    response = JsonResponse({'status': 'ok'})
    response['Access-Control-Allow-Origin'] = '*'
    response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-CSRFToken'
    response['Access-Control-Allow-Credentials'] = 'true'
    return response

urlpatterns = [
    path('', health_check, name='health_check'),
    path('health/', health_check, name='health_check_alt'),
    path('api/health/', health_check, name='api_health_check'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.urls')),
    path('api/transactions/', include('apps.transactions.urls')),
    path('api/categories/', include('apps.categories.urls')),
    path('api/goals/', include('apps.goals.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/budgets/', include('apps.budgets.urls')),
    path('api/', include('apps.loans.urls')),
]