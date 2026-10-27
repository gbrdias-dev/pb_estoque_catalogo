from datetime import date
from decimal import Decimal, InvalidOperation

from django.db import transaction
from django.db.models import Count, F, Q

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

    def get_queryset(self):
        queryset = Produto.objects.select_related(
            "id_categoria",
            "id_colecao",
            "id_fornecedora",
        )

        usuario_id = self.request.session.get("usuario_id")
        is_admin = (
            usuario_id
            and Usuario.objects.filter(pk=usuario_id).exists()
        )

        # Administradores podem consultar produtos ativos e inativos.
        if is_admin:
            return queryset.all()

        # Catálogo público: produtos ativos de fornecedores ativos.
        # Não filtramos quantidade, para exibir também itens esgotados.
        return queryset.filter(
            ativo=True,
            id_fornecedora__ativo=True,
        )

    @action(
        detail=True,
        methods=["post"],
        url_path="desativar",
        permission_classes=[IsAuthenticatedAdminSession],
    )
    def desativar(self, request, pk=None):
        with transaction.atomic():
            produto = self.get_object()
            produto = Produto.objects.select_for_update().get(pk=produto.pk)

            if not produto.ativo:
                return Response(
                    {"detail": "Este produto já está inativo."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if produto.quantidade > 0:
                return Response(
                    {
                        "detail": (
                            "Não é possível desativar um produto "
                            "com estoque disponível. Registre a saída "
                            "das unidades restantes primeiro."
                        ),
                        "quantidade_disponivel": produto.quantidade,
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            Produto.objects.filter(pk=produto.pk).update(ativo=False)

        return Response(
            {"detail": "Produto desativado com sucesso."},
            status=status.HTTP_200_OK,
        )

    @action(
        detail=True,
        methods=["post"],
        url_path="reativar",
        permission_classes=[IsAuthenticatedAdminSession],
    )
    def reativar(self, request, pk=None):
        with transaction.atomic():
            produto = self.get_object()
            produto = Produto.objects.select_for_update().get(pk=produto.pk)

            if produto.ativo:
                return Response(
                    {"detail": "Este produto já está ativo."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            Produto.objects.filter(pk=produto.pk).update(ativo=True)

        return Response(
            {"detail": "Produto reativado com sucesso."},
            status=status.HTTP_200_OK,
        )

    @action(
        detail=True,
        methods=["post"],
        url_path="repor-estoque",
        permission_classes=[IsAuthenticatedAdminSession],
    )
    def repor_estoque(self, request, pk=None):
        quantidade_raw = request.data.get("quantidade")
        valor_raw = request.data.get("valor_compra")

        try:
            if isinstance(quantidade_raw, bool):
                raise ValueError
            quantidade = int(quantidade_raw)
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
            produto = Produto.objects.select_for_update().get(pk=pk)

            if not produto.ativo:
                return Response(
                    {
                        "detail": (
                            "Não é possível repor estoque "
                            "de um produto inativo."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            Produto.objects.filter(pk=produto.pk).update(
                quantidade=F("quantidade") + quantidade
            )

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

        try:
            if isinstance(quantidade_raw, bool):
                raise ValueError
            quantidade = int(quantidade_raw)
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
            produto = Produto.objects.select_for_update().get(pk=pk)

            if not produto.ativo:
                return Response(
                    {
                        "detail": (
                            "Não é possível registrar saída "
                            "de um produto inativo."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

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
    serializer_class = ColecaoSerializer
    permission_classes = [IsUsuarioAdminOrReadOnly]

    def get_queryset(self):
        queryset = Colecao.objects.annotate(
            total_produtos=Count(
                "produto",
                filter=Q(
                    produto__ativo=True,
                    produto__id_colecao__ativo=True,
                ),
            )
        ).order_by("nome")

        usuario_id = self.request.session.get("usuario_id")
        is_admin = (
            usuario_id
            and Usuario.objects.filter(pk=usuario_id).exists()
        )

        if is_admin:
            return queryset

        return queryset.filter(ativo=True)

    @action(
        detail=True,
        methods=["post"],
        url_path="desativar",
        permission_classes=[IsAuthenticatedAdminSession],
    )
    def desativar(self, request, pk=None):
        with transaction.atomic():
            colecao = self.get_object()
            colecao = Colecao.objects.select_for_update().get(pk=colecao.pk)

            if not colecao.ativo:
                return Response(
                    {"detail": "Esta coleção já está inativa."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            Colecao.objects.filter(pk=colecao.pk).update(ativo=False)

        return Response(
            {"detail": "Coleção inativada com sucesso."},
            status=status.HTTP_200_OK,
        )

    @action(
        detail=True,
        methods=["post"],
        url_path="reativar",
        permission_classes=[IsAuthenticatedAdminSession],
    )
    def reativar(self, request, pk=None):
        with transaction.atomic():
            colecao = self.get_object()
            colecao = Colecao.objects.select_for_update().get(pk=colecao.pk)

            if colecao.ativo:
                return Response(
                    {"detail": "Esta coleção já está ativa."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            Colecao.objects.filter(pk=colecao.pk).update(ativo=True)

        return Response(
            {"detail": "Coleção reativada com sucesso."},
            status=status.HTTP_200_OK,
        )

    def destroy(self, request, *args, **kwargs):
        return Response(
            {
                "detail": (
                    "A exclusão de coleções foi desabilitada. "
                    "Utilize a opção de inativar para preservar "
                    "o histórico dos produtos."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )


class FornecedoraViewSet(viewsets.ModelViewSet):
    serializer_class = FornecedoraSerializer
    permission_classes = [IsUsuarioAdminOrReadOnly]

    def get_queryset(self):
        queryset = Fornecedora.objects.annotate(
            total_produtos=Count(
                "produto",
                filter=Q(produto__ativo=True),
            )
        ).order_by("nome")

        usuario_id = self.request.session.get("usuario_id")
        is_admin = (
            usuario_id
            and Usuario.objects.filter(pk=usuario_id).exists()
        )

        if is_admin:
            return queryset

        return queryset.filter(ativo=True)

    @action(
        detail=True,
        methods=["post"],
        url_path="desativar",
        permission_classes=[IsAuthenticatedAdminSession],
    )
    def desativar(self, request, pk=None):
        with transaction.atomic():
            fornecedora = self.get_object()
            fornecedora = Fornecedora.objects.select_for_update().get(
                pk=fornecedora.pk
            )

            if not fornecedora.ativo:
                return Response(
                    {"detail": "Este fornecedor já está inativo."},
                    status=status.HTTP_200_OK,
                )

            Fornecedora.objects.filter(pk=fornecedora.pk).update(ativo=False)

        return Response(
            {"detail": "Fornecedor inativado com sucesso."},
            status=status.HTTP_200_OK,
        )

    @action(
        detail=True,
        methods=["post"],
        url_path="reativar",
        permission_classes=[IsAuthenticatedAdminSession],
    )
    def reativar(self, request, pk=None):
        with transaction.atomic():
            fornecedora = self.get_object()
            fornecedora = Fornecedora.objects.select_for_update().get(
                pk=fornecedora.pk
            )

            if fornecedora.ativo:
                return Response(
                    {"detail": "Este fornecedor já está ativo."},
                    status=status.HTTP_200_OK,
                )

            Fornecedora.objects.filter(pk=fornecedora.pk).update(ativo=True)

        return Response(
            {"detail": "Fornecedor reativado com sucesso."},
            status=status.HTTP_200_OK,
        )

    def destroy(self, request, *args, **kwargs):
        return Response(
            {
                "detail": (
                    "A exclusão de fornecedores foi desabilitada. "
                    "Utilize a opção de inativar para preservar "
                    "o histórico dos produtos."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )


class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all().order_by("nome")
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticatedAdminSession]

    http_method_names = ["get", "post", "head", "options"]