-- Usuários do sistema.
CREATE TABLE IF NOT EXISTS "usuario" (
	"id" serial NOT NULL,
	"nome" varchar(150) NOT NULL,
	"email" varchar(200) NOT NULL UNIQUE,
	"senha" varchar(255) NOT NULL,
	PRIMARY KEY ("id")
);
-- Fornecedores de produtos.
CREATE TABLE IF NOT EXISTS "fornecedora" (
	"id" serial NOT NULL,
	"nome" varchar(200) NOT NULL,
	PRIMARY KEY ("id")
);
-- Categorias de produtos (pulseira, brinco, colar, etc).
CREATE TABLE IF NOT EXISTS "categoria" (
	"id" serial NOT NULL,
	"nome" varchar(120) NOT NULL,
	PRIMARY KEY ("id")
);
-- Coleções de produtos.
CREATE TABLE IF NOT EXISTS "colecao" (
	"id" serial NOT NULL,
	"nome" varchar(150) NOT NULL,
	PRIMARY KEY ("id")
);
-- Produtos cadastrados no estoque.
CREATE TABLE IF NOT EXISTS "produto" (
	"id" serial NOT NULL,
	"descricao" text NOT NULL,
	"id_categoria" integer NOT NULL,
	"id_colecao" integer NOT NULL,
	"id_fornecedora" integer NOT NULL,
	"preco" numeric(10,2) NOT NULL,
	"quantidade" integer NOT NULL,
	"estoque" integer NOT NULL,
	PRIMARY KEY ("id")
);
-- Registros de reposição/compra para um produto.
CREATE TABLE IF NOT EXISTS "reposicao" (
	"id" serial NOT NULL,
	"id_produto" integer NOT NULL,
	"valor_compra" numeric(10,2) NOT NULL,
	"id_usuario" integer NOT NULL,
	PRIMARY KEY ("id")
);
ALTER TABLE "produto" ADD CONSTRAINT "produto_fk2" FOREIGN KEY ("id_categoria") REFERENCES "categoria"("id");
ALTER TABLE "produto" ADD CONSTRAINT "produto_fk3" FOREIGN KEY ("id_colecao") REFERENCES "colecao"("id");
ALTER TABLE "produto" ADD CONSTRAINT "produto_fk4" FOREIGN KEY ("id_fornecedora") REFERENCES "fornecedora"("id");
ALTER TABLE "reposicao" ADD CONSTRAINT "reposicao_fk1" FOREIGN KEY ("id_produto") REFERENCES "produto"("id");
ALTER TABLE "reposicao" ADD CONSTRAINT "reposicao_fk3" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id");
CREATE INDEX "idx_produto_categoria" ON "produto" USING btree ("id_categoria");
CREATE INDEX "idx_produto_colecao" ON "produto" USING btree ("id_colecao");
CREATE INDEX "idx_produto_fornecedora" ON "produto" USING btree ("id_fornecedora");
CREATE INDEX "idx_reposicao_produto" ON "reposicao" USING btree ("id_produto");
COMMENT ON TABLE "usuario" IS 'Usuários do sistema.';
COMMENT ON COLUMN "usuario"."id" IS 'Identificador do usuário.';
COMMENT ON COLUMN "usuario"."nome" IS 'Nome do usuário.';
COMMENT ON COLUMN "usuario"."email" IS 'E-mail do usuário (único).';
COMMENT ON COLUMN "usuario"."senha" IS 'Senha (idealmente hash).';
COMMENT ON TABLE "fornecedora" IS 'Fornecedores de produtos.';
COMMENT ON COLUMN "fornecedora"."id" IS 'Identificador da fornecedora.';
COMMENT ON COLUMN "fornecedora"."nome" IS 'Nome da fornecedora.';
COMMENT ON TABLE "categoria" IS 'Categorias de produtos (pulseira, brinco, colar, etc).';
COMMENT ON COLUMN "categoria"."id" IS 'Identificador da categoria.';
COMMENT ON COLUMN "categoria"."nome" IS 'Nome da categoria.';
COMMENT ON TABLE "colecao" IS 'Coleções de produtos.';
COMMENT ON COLUMN "colecao"."id" IS 'Identificador da coleção.';
COMMENT ON COLUMN "colecao"."nome" IS 'Nome da coleção.';
COMMENT ON TABLE "produto" IS 'Produtos cadastrados no estoque.';
COMMENT ON COLUMN "produto"."id" IS 'Identificador do produto.';
COMMENT ON COLUMN "produto"."id_categoria" IS 'Categoria do produto.';
COMMENT ON COLUMN "produto"."id_colecao" IS 'Coleção do produto.';
COMMENT ON COLUMN "produto"."id_fornecedora" IS 'Fornecedor do produto.';
COMMENT ON COLUMN "produto"."preco" IS 'Preço de venda do produto.';
COMMENT ON COLUMN "produto"."quantidade" IS 'Quantidade (conforme regra do seu sistema).';
COMMENT ON COLUMN "produto"."estoque" IS 'Quantidade em estoque.';
COMMENT ON TABLE "reposicao" IS 'Registros de reposição/compra para um produto.';
COMMENT ON COLUMN "reposicao"."id" IS 'Identificador da reposição.';
COMMENT ON COLUMN "reposicao"."id_produto" IS 'Produto reposto.';
COMMENT ON COLUMN "reposicao"."valor_compra" IS 'Valor de compra da reposição.';