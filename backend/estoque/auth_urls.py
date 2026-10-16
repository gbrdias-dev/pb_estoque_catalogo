
from django.urls import path

from .auth_views import (
    csrf_token,
    login_view,
    logout_view,
    session_view,
)

urlpatterns = [
    path("csrf/", csrf_token, name="csrf-token"),
    path("login/", login_view, name="login"),
    path("logout/", logout_view, name="logout"),
    path("session/", session_view, name="session"),
]
