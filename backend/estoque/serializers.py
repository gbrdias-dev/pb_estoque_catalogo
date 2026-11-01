
from django.contrib.auth.hashers import make_password
from django.db.models import Max
from rest_framework import serializers

from .models import (
    Produto,
    Categoria,
    Colecao,
    Fornecedora,
    Usuario,
    Reposicao,
)


class ProdutoSerializer(serializers.ModelSerializer):
    ultima_compra = serializers.DateField(read_only=True)
    quantidade = serializers.IntegerField(
        required=False,
        default=0,
        min_value=0,
    )

    class Meta:
        model = Produto
        fields = [
            "id",
            "descricao",
            "id_categoria",
            "id_colecao",
            "id_fornecedora",
            "preco",
            "quantidade",
            "url_fornecedor",
            "imagem",
            "ultima_compra",
            "ativo",
        ]

    def validate_id_colecao(self, value):
        if value and not value.ativo:
            raise serializers.ValidationError(
                "Não é possível vincular um produto "
                "a uma coleção inativa."
            )

        return value

    def to_representation(self, instance):
        data = super().to_representation(instance)

        ultima_compra = (
            Reposicao.objects
            .filter(id_produto_id=instance.pk)
            .aggregate(data=Max("data_compra"))["data"]
        )

        data["ultima_compra"] = (
            ultima_compra.isoformat() if ultima_compra else None
        )

        return data


class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ["id", "nome"]


class ColecaoSerializer(serializers.ModelSerializer):
    total_produtos = serializers.IntegerField(read_only=True)

    class Meta:
        model = Colecao
        fields = [
            "id",
            "nome",
            "total_produtos",
            "ativo",
        ]
        read_only_fields = ["id", "total_produtos"]

    def validate_nome(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Informe o nome da coleção."
            )

        return value


class FornecedoraSerializer(serializers.ModelSerializer):
    total_produtos = serializers.IntegerField(read_only=True)

    class Meta:
        model = Fornecedora
        fields = [
            "id",
            "nome",
            "site_fornecedor",
            "total_produtos",
            "ativo",
        ]


class UsuarioSerializer(serializers.ModelSerializer):
    senha = serializers.CharField(
        write_only=True,
        required=False,
        min_length=8,
        trim_whitespace=False,
    )

    class Meta:
        model = Usuario
        fields = ["id", "nome", "email", "senha"]
        read_only_fields = ["id"]

    def validate_nome(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Informe o nome do usuário."
            )

        return value

    def validate_email(self, value):
        value = value.strip().lower()

        usuarios_existentes = Usuario.objects.filter(
            email__iexact=value
        )

        # Na edição, desconsidera o próprio usuário.
        if self.instance:
            usuarios_existentes = usuarios_existentes.exclude(
                pk=self.instance.pk
            )

        if usuarios_existentes.exists():
            raise serializers.ValidationError(
                "Já existe um usuário com esse e-mail."
            )

        return value

    def validate(self, attrs):
        # A senha é obrigatória somente no cadastro.
        if self.instance is None and not attrs.get("senha"):
            raise serializers.ValidationError({
                "senha": "Informe uma senha para o novo usuário."
            })

        return attrs

    def create(self, validated_data):
        senha = validated_data.pop("senha")

        validated_data["senha"] = make_password(senha)

        return Usuario.objects.create(**validated_data)


class ReposicaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reposicao
        fields = [
            "id",
            "id_produto",
            "quantidade",
            "valor_compra",
            "id_usuario",
            "data_compra",
        ]
        read_only_fields = ["id", "id_usuario", "data_compra"]

    def validate_quantidade(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "A quantidade da reposição deve ser maior que zero."
            )

        return value

    def validate_valor_compra(self, value):
        if value < 0:
            raise serializers.ValidationError(
                "O valor da compra não pode ser negativo."
            )

        return value
