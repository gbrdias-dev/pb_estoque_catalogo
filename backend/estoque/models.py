
from django.db import models


class Usuario(models.Model):
    nome = models.CharField(max_length=100)
    email = models.CharField(max_length=255, unique=True)
    senha = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = "usuario"

    def __str__(self):
        return self.nome


class Fornecedora(models.Model):
    nome = models.CharField(max_length=100)
    site_fornecedor = models.CharField(max_length=255)
    ativo = models.BooleanField(default=True)
    class Meta:
        managed = False
        db_table = "fornecedora"

    def __str__(self):
        return self.nome


class Categoria(models.Model):
    nome = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = "categoria"

    def __str__(self):
        return self.nome


class Colecao(models.Model):
    nome = models.CharField(max_length=255)
    ativo = models.BooleanField(default=True)

    class Meta:
        managed = False
        db_table = "colecao"

    def __str__(self):
        return self.nome

class Produto(models.Model):
    descricao = models.CharField(max_length=500)

    id_categoria = models.ForeignKey(
        Categoria,
        models.DO_NOTHING,
        db_column="id_categoria",
    )

    id_colecao = models.ForeignKey(
        Colecao,
        models.DO_NOTHING,
        db_column="id_colecao",
    )

    id_fornecedora = models.ForeignKey(
        Fornecedora,
        models.DO_NOTHING,
        db_column="id_fornecedora",
    )

    preco = models.DecimalField(max_digits=10, decimal_places=2)
    quantidade = models.IntegerField()

    ativo = models.BooleanField(default=True)

    url_fornecedor = models.CharField(
        max_length=255,
        blank=True,
        null=True,
    )

    imagem = models.ImageField(
        upload_to="produtos/",
        blank=True,
        null=True,
        db_column="imagem_produto",
    )

    class Meta:
        managed = False
        db_table = "produto"

    def __str__(self):
        return self.descricao

    class Meta:
        managed = False
        db_table = "produto"

    def __str__(self):
        return self.descricao


class Reposicao(models.Model):
    id_produto = models.ForeignKey(
        Produto,
        models.DO_NOTHING,
        db_column="id_produto",
    )
    quantidade = models.IntegerField()
    valor_compra = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )
    id_usuario = models.ForeignKey(
        Usuario,
        models.DO_NOTHING,
        db_column="id_usuario",
    )
    data_compra = models.DateField()

    class Meta:
        managed = False
        db_table = "reposicao"

    def __str__(self):
        return f"Reposição do produto {self.id_produto_id}"



