#!/usr/bin/env python
"""
Script de health check para Render
"""
import os
import sys
import django
from django.conf import settings
from django.core.management import execute_from_command_line

if __name__ == '__main__':
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'finance_api.settings')
    django.setup()
    
    try:
        # Verificar conexión a la base de datos
        from django.db import connection
        cursor = connection.cursor()
        cursor.execute("SELECT 1")
        print("✓ Base de datos conectada")
        
        # Verificar que las migraciones estén aplicadas
        from django.core.management.commands.migrate import Command
        print("✓ Verificando migraciones...")
        
        # Verificar que los modelos estén funcionando
        from apps.users.models import User
        user_count = User.objects.count()
        print(f"✓ Usuarios en la base de datos: {user_count}")
        
        print("✓ Health check exitoso")
        sys.exit(0)
        
    except Exception as e:
        print(f"✗ Health check falló: {e}")
        sys.exit(1)