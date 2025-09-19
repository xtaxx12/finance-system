from django.urls import path
from .views import register_view, login_view, logout_view, profile_view, update_profile_view, csrf_token_view

urlpatterns = [
    path('register/', register_view, name='register'),
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('profile/', profile_view, name='profile'),
    path('profile/update/', update_profile_view, name='update_profile'),
    path('csrf/', csrf_token_view, name='csrf_token'),
]