#!/usr/bin/env python3
"""
Script para configurar la app de préstamos
"""

import os
import sys
import subprocess

def run_command(command, cwd=None):
    """Ejecuta un comando y maneja errores"""
    try:
        result = subprocess.run(command, shell=True, cwd=cwd, check=True, 
                              capture_output=True, text=True)
        print(f"✅ {command}")
        if result.stdout:
            print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error ejecutando: {command}")
        print(f"Error: {e.stderr}")
        return False

def main():
    print("🏦 Configurando la app de préstamos...")
    
    # Cambiar al directorio del backend
    backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
    
    if not os.path.exists(backend_dir):
        print("❌ No se encontró el directorio backend")
        return
    
    print(f"📁 Trabajando en: {backend_dir}")
    
    # Instalar dependencias
    print("\n📦 Instalando dependencias...")
    if not run_command("pip install drf-nested-routers==0.93.4", backend_dir):
        print("⚠️  Error instalando dependencias, continuando...")
    
    # Crear migraciones
    print("\n🔄 Creando migraciones...")
    if not run_command("python manage.py makemigrations loans", backend_dir):
        print("❌ Error creando migraciones")
        return
    
    # Aplicar migraciones
    print("\n⬆️  Aplicando migraciones...")
    if not run_command("python manage.py migrate", backend_dir):
        print("❌ Error aplicando migraciones")
        return
    
    print("\n✅ ¡Configuración completada!")
    print("\n📋 Próximos pasos:")
    print("1. Reinicia el servidor backend: python manage.py runserver")
    print("2. Reinicia el servidor frontend: npm start")
    print("3. Ve a http://localhost:3000/loans para probar la funcionalidad")

if __name__ == "__main__":
    main()