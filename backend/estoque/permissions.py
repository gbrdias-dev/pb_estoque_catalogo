
from rest_framework.permissions import BasePermission
from .models import Usuario


class IsUsuarioAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return True

        usuario_id = request.session.get("usuario_id")
        return bool(
            usuario_id
            and Usuario.objects.filter(pk=usuario_id).exists()
        )


class IsAuthenticatedAdminSession(BasePermission):
    def has_permission(self, request, view):
        usuario_id = request.session.get("usuario_id")

        return bool(
            usuario_id
            and Usuario.objects.filter(pk=usuario_id).exists()
        )
