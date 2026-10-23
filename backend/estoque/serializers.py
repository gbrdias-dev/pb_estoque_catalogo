
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
        ]

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
    class Meta:
        model = Colecao
        fields = ["id", "nome"]


class FornecedoraSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fornecedora
        fields = ["id", "nome", "site_fornecedor"]


class UsuarioSerializer(serializers.ModelSerializer):
    senha = serializers.CharField(
        write_only=True,
        required=True,
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

        if Usuario.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "Já existe um usuário com esse e-mail."
            )

        return value

    def create(self, validated_data):
        validated_data["senha"] = make_password(
            validated_data["senha"]
        )
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
