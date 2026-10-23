
from datetime import date
from decimal import Decimal, InvalidOperation

from django.db import transaction
from django.db.models import F

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import (
    Usuario,
    Produto,
    Categoria,
    Colecao,
    Fornecedora,
    Reposicao,
)

from .serializers import (
    UsuarioSerializer,
    ProdutoSerializer,
    CategoriaSerializer,
    ColecaoSerializer,
    FornecedoraSerializer,
    ReposicaoSerializer,
)

from .permissions import (
    IsAuthenticatedAdminSession,
    IsUsuarioAdminOrReadOnly,
)


class ProdutoViewSet(viewsets.ModelViewSet):
    queryset = Produto.objects.select_related(
        "id_categoria",
        "id_colecao",
        "id_fornecedora",
    ).all()

    serializer_class = ProdutoSerializer
    permission_classes = [IsUsuarioAdminOrReadOnly]

    @action(
        detail=True,
        methods=["post"],
        url_path="repor-estoque",
        permission_classes=[IsAuthenticatedAdminSession],
    )
    def repor_estoque(self, request, pk=None):
        quantidade_raw = request.data.get("quantidade")
        valor_raw = request.data.get("valor_compra")

        # Validar a quantidade recebida.
        try:
            if isinstance(quantidade_raw, bool):
                raise ValueError

            quantidade = int(quantidade_raw)

            # Evita aceitar valores como "2.5" ou "2abc".
            if str(quantidade_raw).strip() != str(quantidade):
                raise ValueError
        except (TypeError, ValueError):
            return Response(
                {"quantidade": "Informe uma quantidade inteira válida."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if quantidade <= 0:
            return Response(
                {"quantidade": "A quantidade deve ser maior que zero."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validar o valor monetário sem usar float.
        try:
            valor_compra = Decimal(str(valor_raw))

            if not valor_compra.is_finite():
                raise InvalidOperation

            if valor_compra < 0:
                raise ValueError

            if valor_compra.as_tuple().exponent < -2:
                raise ValueError

            if valor_compra > Decimal("99999999.99"):
                raise ValueError
        except (InvalidOperation, TypeError, ValueError):
            return Response(
                {
                    "valor_compra": (
                        "Informe um valor válido, não negativo, "
                        "com no máximo duas casas decimais."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        usuario_id = request.session.get("usuario_id")

        if not usuario_id:
            return Response(
                {"detail": "Sessão administrativa não encontrada."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        with transaction.atomic():
            # Bloqueia o produto durante a atualização do estoque.
            produto = self.get_object()
            produto = Produto.objects.select_for_update().get(
                pk=produto.pk
            )

            # Incrementa a quantidade diretamente no banco.
            Produto.objects.filter(pk=produto.pk).update(
                quantidade=F("quantidade") + quantidade
            )

            # Registra o histórico da reposição.
            reposicao = Reposicao.objects.create(
                id_produto=produto,
                quantidade=quantidade,
                valor_compra=valor_compra,
                id_usuario_id=usuario_id,
                data_compra=date.today(),
            )

            produto.refresh_from_db()

        return Response(
            {
                "detail": "Reposição registrada com sucesso.",
                "produto_id": produto.pk,
                "quantidade": produto.quantidade,
                "reposicao": ReposicaoSerializer(reposicao).data,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(
        detail=True,
        methods=["post"],
        url_path="registrar-saida",
        permission_classes=[IsAuthenticatedAdminSession],
    )
    def registrar_saida(self, request, pk=None):
        quantidade_raw = request.data.get("quantidade")

        # Validar quantidade inteira e positiva.
        try:
            if isinstance(quantidade_raw, bool):
                raise ValueError

            quantidade = int(quantidade_raw)

            # Evita aceitar valores como "2.5" ou "2abc".
            if str(quantidade_raw).strip() != str(quantidade):
                raise ValueError

        except (TypeError, ValueError):
            return Response(
                {"quantidade": "Informe uma quantidade inteira válida."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if quantidade <= 0:
            return Response(
                {"quantidade": "A quantidade deve ser maior que zero."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        usuario_id = request.session.get("usuario_id")

        if not usuario_id:
            return Response(
                {"detail": "Sessão administrativa não encontrada."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        with transaction.atomic():
            # Obtém o produto e bloqueia sua linha para atualização.
            produto = self.get_object()
            produto = Produto.objects.select_for_update().get(
                pk=produto.pk
            )

            # Impede que a quantidade fique negativa.
            if produto.quantidade < quantidade:
                return Response(
                    {
                        "detail": (
                            "Estoque insuficiente. "
                            f"Quantidade disponível: {produto.quantidade}."
                        ),
                        "quantidade_disponivel": produto.quantidade,
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Subtrai a quantidade diretamente no banco.
            Produto.objects.filter(pk=produto.pk).update(
                quantidade=F("quantidade") - quantidade
            )

            produto.refresh_from_db()

        return Response(
            {
                "detail": "Baixa de estoque registrada com sucesso.",
                "produto_id": produto.pk,
                "quantidade": produto.quantidade,
            },
            status=status.HTTP_200_OK,
        )


class CategoriaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Categoria.objects.all().order_by("nome")
    serializer_class = CategoriaSerializer


class ColecaoViewSet(viewsets.ModelViewSet):
    queryset = Colecao.objects.all().order_by("nome")
    serializer_class = ColecaoSerializer
    permission_classes = [IsUsuarioAdminOrReadOnly]


class FornecedoraViewSet(viewsets.ModelViewSet):
    queryset = Fornecedora.objects.all().order_by("nome")
    serializer_class = FornecedoraSerializer
    permission_classes = [IsUsuarioAdminOrReadOnly]


class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all().order_by("nome")
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticatedAdminSession]

    http_method_names = ["get", "post", "head", "options"]
