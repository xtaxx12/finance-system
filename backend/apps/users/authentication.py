from rest_framework.authentication import SessionAuthentication

class CsrfExemptSessionAuthentication(SessionAuthentication):
    """
    Autenticación de sesión que no requiere CSRF token para APIs
    """
    def enforce_csrf(self, request):
        return  # No hacer nada, deshabilitar CSRF