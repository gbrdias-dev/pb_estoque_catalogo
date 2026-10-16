from rest_framework.routers import DefaultRouter

from .views import (
    ProdutoViewSet,
    CategoriaViewSet,
    ColecaoViewSet,
    FornecedoraViewSet,
)

router = DefaultRouter()

router.register("produtos", ProdutoViewSet, basename="produto")
router.register("categorias", CategoriaViewSet, basename="categoria")
router.register("colecoes", ColecaoViewSet, basename="colecao")
router.register("fornecedoras", FornecedoraViewSet, basename="fornecedora")

urlpatterns = router.urls
