from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly

from .models import (
    Produto,
    Categoria,
    Colecao,
    Fornecedora,
)

from .serializers import (
    ProdutoSerializer,
    CategoriaSerializer,
    ColecaoSerializer,
    FornecedoraSerializer,
)

from .permissions import IsUsuarioAdminOrReadOnly

class ProdutoViewSet(viewsets.ModelViewSet):
    queryset = Produto.objects.select_related(
        "id_categoria",
        "id_colecao",
        "id_fornecedora",
    ).all()
    serializer_class = ProdutoSerializer
    permission_classes = [IsUsuarioAdminOrReadOnly]



class CategoriaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Categoria.objects.all().order_by("nome")
    serializer_class = CategoriaSerializer


class ColecaoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Colecao.objects.all().order_by("nome")
    serializer_class = ColecaoSerializer



class FornecedoraViewSet(viewsets.ModelViewSet):
    queryset = Fornecedora.objects.all().order_by("nome")
    serializer_class = FornecedoraSerializer
    permission_classes = [IsUsuarioAdminOrReadOnly]

