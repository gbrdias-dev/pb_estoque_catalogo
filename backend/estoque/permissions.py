
from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsUsuarioAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        return bool(
            request.session.get("usuario_id")
            and request.user is not None
        )
