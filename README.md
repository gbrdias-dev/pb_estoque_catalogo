# P&B Bijuterias — Estoque e Catálogo

Sistema web em desenvolvimento como projeto acadêmico de Ciência da Computação para a **P&B Bijuterias**. A aplicação pretende combinar um catálogo público de produtos com uma área administrativa para gerenciamento do estoque.

> **Frontend:** React  
> **Backend planejado:** Django + Django REST Framework  
> **Banco de dados:** PostgreSQL  
> **Status:** Em desenvolvimento

## Objetivos

- Apresentar os produtos da marca em um catálogo público;
- Desenvolver uma interface web com React;
- Criar uma API REST utilizando Django REST Framework;
- Armazenar e gerenciar dados com PostgreSQL;
- Implementar operações CRUD para produtos;
- Gerenciar estoque, fornecedores e reposições;
- Separar a experiência pública da área administrativa.

## Tecnologias

| Camada | Tecnologias |
|---|---|
| Frontend | React, JavaScript, HTML5, CSS3 |
| Backend | Python, Django, Django REST Framework |
| Banco de dados | PostgreSQL |
| Ferramentas | Git, GitHub, Visual Studio Code, DB Designer |

## Arquitetura planejada

```text
React (Frontend)
      │ HTTP / JSON
      ▼
Django REST Framework (API)
      │ Django ORM
      ▼
PostgreSQL
```

O React não se conectará diretamente ao PostgreSQL. As requisições serão enviadas à API Django, que validará as operações e acessará o banco de dados.

## Funcionalidades previstas

### Área pública
- Página inicial institucional;
- Apresentação da marca;
- Página “Sobre nós”;
- Catálogo, pesquisa e filtros de produtos;
- Página de detalhes do produto;
- Links de contato e redes sociais.

### Área administrativa
- Login e autenticação;
- Dashboard;
- Cadastro, edição, consulta e exclusão de produtos;
- Controle de quantidades em estoque;
- Gerenciamento de fornecedores;
- Registro de reposições.

## Estrutura de pastas prevista

```text
PB-ESTOQUE/
├── frontend/
│   ├── public/
│   └── src/
│       ├── assets/
│       │   ├── imagens/
│       │   └── icons/
│       ├── components/
│       │   ├── Header/
│       │   ├── Hero/
│       │   ├── About/
│       │   ├── Benefits/
│       │   ├── Testimonials/
│       │   ├── Social/
│       │   ├── Footer/
│       │   ├── Catalog/
│       │   └── Admin/
│       ├── pages/
│       │   ├── Home/
│       │   ├── About/
│       │   ├── Catalog/
│       │   ├── Product/
│       │   ├── Login/
│       │   └── Admin/
│       ├── services/
│       │   └── api.js
│       └── App.js
├── backend/
│   ├── manage.py
│   ├── config/
│   ├── products/
│   ├── stock/
│   ├── suppliers/
│   └── users/
└── README.md
```

A estrutura poderá ser ajustada durante o desenvolvimento.

## Rotas planejadas

Públicas:

```text
/
/sobre
/catalogo
/produto/:id
```

Administrativas:

```text
/login
/admin
/admin/produtos
/admin/estoque
/admin/fornecedores
```

## Banco de dados

O banco definido para o projeto é **PostgreSQL**. A modelagem considera informações de produtos, fornecedores e reposições. Os campos, relacionamentos, chaves e índices definitivos devem seguir o modelo de dados do projeto acadêmico.

## Endpoints de API planejados

| Método | Finalidade | Endpoint |
|---|---|---|
| GET | Listar produtos | `/api/produtos/` |
| GET | Consultar produto | `/api/produtos/:id/` |
| POST | Cadastrar produto | `/api/produtos/` |
| PUT | Atualizar produto | `/api/produtos/:id/` |
| DELETE | Excluir produto | `/api/produtos/:id/` |

Esses endpoints são exemplos previstos, não necessariamente já implementados.

## Executar o frontend

Pré-requisitos: Node.js, npm e Git.

Dentro da pasta do frontend:

```bash
npm install
npm start
```

Em projetos configurados com Create React App, a aplicação normalmente estará disponível em `http://localhost:3000`. Confira o `package.json` se o projeto usar outro comando de inicialização.

## Backend Django (quando configurado)

Crie e ative um ambiente virtual na pasta do backend:

```bash
python -m venv venv
```

Linux:

```bash
source venv/bin/activate
```

Windows:

```powershell
venv\Scripts\activate
```

Depois de configurar as dependências, o PostgreSQL e as variáveis de ambiente:

```bash
python manage.py migrate
python manage.py runserver
```

O servidor Django normalmente ficará disponível em `http://127.0.0.1:8000`. Esses comandos são orientativos e dependem da configuração efetiva do backend.

## Variáveis de ambiente

Exemplo para configuração da conexão com o banco:

```env
DB_NAME=pb_estoque
DB_USER=postgres
DB_PASSWORD=sua_senha
DB_HOST=localhost
DB_PORT=5432
```

Adapte os nomes à configuração do Django. Não coloque senhas reais no repositório. Inclua no `.gitignore` os arquivos e diretórios locais, por exemplo:

```gitignore
.env
venv/
__pycache__/
node_modules/
```

## Segurança

A autenticação e as permissões da área administrativa devem ser validadas no backend. Proteger páginas no React, isoladamente, não protege os endpoints da API. Credenciais e segredos não devem ser expostos no frontend nem enviados ao GitHub.

## Roadmap

### Frontend
- [x] Estrutura inicial em React
- [x] Header
- [x] Hero
- [x] Seção Sobre nós
- [x] Seção de benefícios
- [x] Seção de depoimentos
- [x] Seção de redes sociais
- [x] Footer
- [ ] Configurar React Router
- [ ] Criar página dedicada Sobre nós
- [ ] Desenvolver catálogo e detalhes dos produtos
- [ ] Desenvolver login e área administrativa
- [ ] Validar responsividade

### Backend e banco de dados
- [ ] Criar projeto Django
- [ ] Configurar Django REST Framework e PostgreSQL
- [ ] Criar models e migrations
- [ ] Criar serializers e endpoints
- [ ] Implementar autenticação e permissões
- [ ] Integrar API com React
- [ ] Revisar relacionamentos e índices

### Melhorias futuras
- [ ] Upload de imagens de produtos
- [ ] Busca e filtros no catálogo
- [ ] Alertas de estoque baixo
- [ ] Dashboard administrativo
- [ ] Integração com Instagram, mantendo credenciais no backend

## Autor

**Gabriel Dias**  
Projeto acadêmico — P&B Bijuterias

## Licença

Desenvolvido para fins acadêmicos e de demonstração. A utilização de imagens, logotipo e outros materiais da marca deve respeitar os direitos de seus respectivos titulares.