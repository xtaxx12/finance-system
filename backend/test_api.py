#!/usr/bin/env python
"""
Script para probar la API del backend
"""
import requests
import json

def test_backend(base_url):
    """Prueba las funciones básicas del backend"""
    print(f"Probando backend en: {base_url}")
    
    # Test 1: Health check
    try:
        response = requests.get(f"{base_url}/health/", timeout=10)
        if response.status_code == 200:
            print("✓ Health check exitoso")
        else:
            print(f"✗ Health check falló: {response.status_code}")
    except Exception as e:
        print(f"✗ Error en health check: {e}")
    
    # Test 2: CORS preflight
    try:
        response = requests.options(f"{base_url}/api/auth/login/", 
                                  headers={
                                      'Origin': 'https://finance-frontend-tawny.vercel.app',
                                      'Access-Control-Request-Method': 'POST',
                                      'Access-Control-Request-Headers': 'Content-Type'
                                  }, timeout=10)
        if response.status_code in [200, 204]:
            print("✓ CORS preflight exitoso")
        else:
            print(f"✗ CORS preflight falló: {response.status_code}")
    except Exception as e:
        print(f"✗ Error en CORS preflight: {e}")
    
    # Test 3: API endpoints
    endpoints = [
        '/api/auth/csrf/',
        '/api/categories/',
        '/admin/',
    ]
    
    for endpoint in endpoints:
        try:
            response = requests.get(f"{base_url}{endpoint}", timeout=10)
            if response.status_code in [200, 302, 403]:  # 403 es normal para endpoints protegidos
                print(f"✓ {endpoint} responde correctamente")
            else:
                print(f"✗ {endpoint} falló: {response.status_code}")
        except Exception as e:
            print(f"✗ Error en {endpoint}: {e}")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        base_url = sys.argv[1]
    else:
        base_url = "https://finance-backend-k12z.onrender.com"
    
    test_backend(base_url)