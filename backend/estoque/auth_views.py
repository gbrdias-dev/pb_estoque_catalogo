import json

from django.contrib.auth.hashers import check_password
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_GET, require_POST

from .models import Usuario


@require_GET
@ensure_csrf_cookie
def csrf_token(request):
    return JsonResponse({"csrfToken": get_token(request)})


@require_POST
def login_view(request):
    try:
        data = json.loads(request.body or "{}")
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse(
            {"detail": "Dados inválidos."},
            status=400,
        )

    email = data.get("email", "").strip().lower()
    senha = data.get("password", "")

    if not isinstance(senha, str) or not email or not senha:
        return JsonResponse(
            {"detail": "Informe o e-mail e a senha."},
            status=400,
        )

    try:
        usuario = Usuario.objects.get(email__iexact=email)
    except Usuario.DoesNotExist:
        return JsonResponse(
            {"detail": "E-mail ou senha incorretos."},
            status=401,
        )

    if not check_password(senha, usuario.senha):
        return JsonResponse(
            {"detail": "E-mail ou senha incorretos."},
            status=401,
        )

    # Cria uma sessão nova para o administrador autenticado.
    request.session.flush()
    request.session["usuario_id"] = usuario.pk
    request.session["usuario_nome"] = usuario.nome
    request.session.set_expiry(60 * 60 * 8)  # 8 horas

    return JsonResponse({
        "authenticated": True,
        "user": {
            "id": usuario.pk,
            "nome": usuario.nome,
            "email": usuario.email,
        },
    })


@require_POST
def logout_view(request):
    request.session.flush()
    return JsonResponse({"authenticated": False})


@require_GET
def session_view(request):
    usuario_id = request.session.get("usuario_id")

    if not usuario_id:
        return JsonResponse({"authenticated": False})

    try:
        usuario = Usuario.objects.get(pk=usuario_id)
    except Usuario.DoesNotExist:
        request.session.flush()
        return JsonResponse({"authenticated": False})

    return JsonResponse({
        "authenticated": True,
        "user": {
            "id": usuario.pk,
            "nome": usuario.nome,
            "email": usuario.email,
        },
    })
