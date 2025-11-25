import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from apps.categories.models import Category
from decimal import Decimal


@pytest.fixture
def api_client():
    """Fixture para cliente API"""
    return APIClient()


@pytest.fixture
def user(db):
    """Fixture para crear un usuario de prueba"""
    return User.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='testpass123'
    )


@pytest.fixture
def another_user(db):
    """Fixture para crear otro usuario de prueba"""
    return User.objects.create_user(
        username='anotheruser',
        email='another@example.com',
        password='testpass123'
    )


@pytest.fixture
def authenticated_client(api_client, user):
    """Fixture para cliente API autenticado"""
    api_client.force_authenticate(user=user)
    return api_client


@pytest.fixture
def category(db):
    """Fixture para crear una categoría de prueba"""
    return Category.objects.create(
        nombre='Alimentación',
        descripcion='Gastos en comida',
        color='#3498db',
        icono='🍔'
    )


@pytest.fixture
def categories(db):
    """Fixture para crear múltiples categorías"""
    return [
        Category.objects.create(
            nombre='Alimentación',
            descripcion='Gastos en comida',
            color='#3498db',
            icono='🍔'
        ),
        Category.objects.create(
            nombre='Transporte',
            descripcion='Gastos en transporte',
            color='#e74c3c',
            icono='🚗'
        ),
        Category.objects.create(
            nombre='Ocio',
            descripcion='Gastos en entretenimiento',
            color='#9b59b6',
            icono='🎮'
        )
    ]
