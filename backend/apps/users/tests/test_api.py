import pytest
from rest_framework import status
from django.contrib.auth.models import User


@pytest.mark.django_db
class TestAuthAPI:
    """Tests de integración para API de autenticación"""

    def test_register_user(self, api_client):
        """Verifica registro de nuevo usuario"""
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'securepass123',
            'password2': 'securepass123'
        }

        response = api_client.post('/api/auth/register/', data, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        assert User.objects.filter(username='newuser').exists()

    def test_register_password_mismatch(self, api_client):
        """Verifica validación de contraseñas no coincidentes"""
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'securepass123',
            'password2': 'differentpass'
        }

        response = api_client.post('/api/auth/register/', data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_login(self, api_client, user):
        """Verifica login de usuario"""
        data = {
            'username': 'testuser',
            'password': 'testpass123'
        }

        response = api_client.post('/api/auth/login/', data, format='json')

        assert response.status_code == status.HTTP_200_OK
        assert 'user' in response.data

    def test_login_invalid_credentials(self, api_client):
        """Verifica login con credenciales inválidas"""
        data = {
            'username': 'nonexistent',
            'password': 'wrongpass'
        }

        response = api_client.post('/api/auth/login/', data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_get_profile(self, authenticated_client, user):
        """Verifica obtener perfil de usuario"""
        response = authenticated_client.get('/api/auth/profile/')

        assert response.status_code == status.HTTP_200_OK
        assert response.data['username'] == user.username
        assert response.data['email'] == user.email

    def test_update_profile(self, authenticated_client, user):
        """Verifica actualizar perfil de usuario"""
        data = {
            'email': 'updated@example.com',
            'first_name': 'Updated',
            'last_name': 'Name'
        }

        response = authenticated_client.put(
            '/api/auth/profile/',
            data,
            format='json'
        )

        assert response.status_code == status.HTTP_200_OK

        user.refresh_from_db()
        assert user.email == 'updated@example.com'
        assert user.first_name == 'Updated'

    def test_change_password(self, authenticated_client, user):
        """Verifica cambio de contraseña"""
        data = {
            'old_password': 'testpass123',
            'new_password': 'newsecurepass123',
            'new_password2': 'newsecurepass123'
        }

        response = authenticated_client.post(
            '/api/auth/change_password/',
            data,
            format='json'
        )

        assert response.status_code == status.HTTP_200_OK

        user.refresh_from_db()
        assert user.check_password('newsecurepass123')

    def test_change_password_wrong_old(self, authenticated_client, user):
        """Verifica validación de contraseña anterior incorrecta"""
        data = {
            'old_password': 'wrongoldpass',
            'new_password': 'newsecurepass123',
            'new_password2': 'newsecurepass123'
        }

        response = authenticated_client.post(
            '/api/auth/change_password/',
            data,
            format='json'
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_logout(self, authenticated_client):
        """Verifica logout de usuario"""
        response = authenticated_client.post('/api/auth/logout/')

        assert response.status_code == status.HTTP_200_OK
