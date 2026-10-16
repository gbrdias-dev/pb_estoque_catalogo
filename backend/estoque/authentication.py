
from rest_framework.authentication import BaseAuthentication, SessionAuthentication

from .models import Usuario


class UsuarioSessionAuthentication(BaseAuthentication):
    def authenticate(self, request):
        usuario_id = request.session.get("usuario_id")

        if not usuario_id:
            return None

        try:
            usuario = Usuario.objects.get(pk=usuario_id)
        except Usuario.DoesNotExist:
            return None

        # Exige CSRF para requisições autenticadas.
        SessionAuthentication().enforce_csrf(request)

        return (usuario, None)
