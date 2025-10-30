from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import login, logout
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from django.utils.decorators import method_decorator
from .serializers import UserSerializer, RegisterSerializer, LoginSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """Registro de nuevos usuarios"""
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        login(request, user)
        user_serializer = UserSerializer(user)
        return Response({
            'user': user_serializer.data,
            'message': 'Usuario registrado exitosamente'
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """Login de usuarios"""
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        login(request, user)
        user_serializer = UserSerializer(user)
        return Response({
            'user': user_serializer.data,
            'message': 'Login exitoso'
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Logout de usuarios"""
    logout(request)
    return Response({'message': 'Logout exitoso'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    """Obtener perfil del usuario actual"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile_view(request):
    """Actualizar perfil del usuario"""
    serializer = UserSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({
            'user': serializer.data,
            'message': 'Perfil actualizado exitosamente'
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password_view(request):
    """Cambiar contraseña del usuario"""
    user = request.user
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    
    if not old_password or not new_password:
        return Response({
            'error': 'Se requieren la contraseña actual y la nueva contraseña'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Verificar contraseña actual
    if not user.check_password(old_password):
        return Response({
            'error': 'La contraseña actual es incorrecta'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validar nueva contraseña
    if len(new_password) < 8:
        return Response({
            'error': 'La nueva contraseña debe tener al menos 8 caracteres'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Cambiar contraseña
    user.set_password(new_password)
    user.save()
    
    return Response({
        'message': 'Contraseña cambiada exitosamente'
    })

@api_view(['GET'])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def csrf_token_view(request):
    """Obtener token CSRF"""
    return Response({
        'csrfToken': get_token(request)
    })