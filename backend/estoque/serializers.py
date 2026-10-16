from rest_framework import serializers

from .models import (
    Produto,
    Categoria,
    Colecao,
    Fornecedora,
)


class ProdutoSerializer(serializers.ModelSerializer):
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
        ]


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
