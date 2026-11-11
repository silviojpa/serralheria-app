# Serralheria App — Sistema de Gestão ERP

Sistema web completo de gestão operacional e comercial para serralheria, desenvolvido em **Python (Django)**, **PostgreSQL** (containerizado com Docker) e **JavaScript SPA** para alta responsividade na interface.

---

## 🏗️ Arquitetura e Stack Tecnológica

- **Backend:** Python 3.12+ / Django 4.2+ (App `portal`)
- **Banco de Dados:** PostgreSQL 15
- **Containerização:** Docker & Docker Compose (Ambiente 100% conteinerizado - `serralheria_db` e `serralheria_web`)
- **Frontend:** HTML5, CSS3, JavaScript (ES6+ assíncrono com API Fetch e manipulação dinâmica de DOM)
- **Autenticação:** Django Authentication System (com controle de sessão via RBAC)
- **Ambiente de Desenvolvimento:** WSL2 (Windows Subsystem for Linux)

---

## 📁 Estrutura de Diretórios do Projeto

```text
serralheria-app/
├── docker-compose.yml           # Orquestração do PostgreSQL e do Django
├── .env                         # Variáveis de ambiente e credenciais do banco
├── .gitignore                   # Ignora cache e dados sensíveis para o git
├── README.md                    # Documentação técnica e guia de continuidade
└── web/                         # Código da aplicação Python/Django
    ├── Dockerfile               # Imagem da aplicação Python/Django
    ├── .dockerignore            # Evita cópia da venv e cache para o container
    ├── manage.py                # Utilitário de comandos do Django
    ├── requirements.txt         # Dependências (Django, psycopg2-binary, etc.)
    ├── venv/                    # Ambiente virtual local (apenas para autocomplete no VS Code)
    ├── core/                    # Configurações globais (settings, urls, wsgi, asgi)
    │   ├── settings.py          # Conexão com o banco via variáveis de ambiente
    │   └── urls.py              # Mapeamento de rotas globais e endpoints da API
    └── portal/                  # App core da Serralheria
        ├── admin.py             # Registro de modelos no Django Admin
        ├── models.py            # Definição das tabelas do banco de dados (Cliente, etc.)
        ├── views.py             # Lógica de negócio, autenticação e rotas JSON (API REST)
        ├── migrations/          # Histórico de schema do banco de dados
        └── templates/portal/
            ├── index.html       # Interface SPA integrada dinamicamente ao backend
            └── login.html       # Interface de login com formulário e tratamento de acesso
```

---

## 📌 Histórico do Projeto e Progresso Atual (v0.3)

### 1. Infraestrutura & Ambiente
- [x] Criação do `docker-compose.yml` unificando a web e o banco de dados.
- [x] Implementação de reinicialização automática (`restart: always`) para os containers.
- [x] Configuração de variáveis de ambiente seguras via arquivo `.env`.
- [x] Implementação de `healthcheck` no Docker Compose para sincronia entre banco e aplicação web.
- [x] Configuração do `Dockerfile` e `.dockerignore` otimizados para Python 3.10-slim.

### 2. Autenticação e Segurança
- [x] Fluxo completo de login protegido e logout via Django Auth.
- [x] Integração da variável global `request.user` para exibição dinâmica de avatar, nome e cargo no frontend.
- [x] Implementação da captura e envio automático do token CSRF nas requisições HTTP assíncronas do frontend.

### 3. Módulo de Clientes (Integração Backend + Frontend)
- [x] Modelagem abrangente da tabela `Cliente` no PostgreSQL (incluindo campos de endereço e anotações).
- [x] Refatoração da interface SPA (`index.html`) substituindo pop-ups nativos por um painel de formulário estruturado e esteticamente integrado à paleta de cores.
- [x] Criação da rota `/api/clientes/` permitindo requisições GET (listagem) e POST (cadastro em JSON).
- [x] Criação de layout em grelha fluida (grid CSS) para acomodação de morada completa (CEP, Bairro, etc.) e preferências operacionais.

---

## 🚀 Como Executar o Projeto Localmente

O ambiente de execução da Serralheria foi modernizado. A aplicação web e o banco de dados agora rodam **inteiramente via Docker Compose**. 

### Pré-requisitos
- Docker & Docker Compose instalados e ativos.
- WSL (Ubuntu) em execução no Windows.

### Passo a Passo da Inicialização

1. **Subir os containers (Banco de Dados e Aplicação Web):**
   ```bash
   cd ~/silvio/python/serralheria-app
   docker compose up -d --build
   ```
   *(Com a política `restart: always` ativada, os containers iniciarão automaticamente sempre que a máquina ou o Docker forem reiniciados, tornando este comando necessário apenas para reconstruções ou após um `down`).*

2. **Acessar o Sistema:**
   Abra o seu navegador e acesse a interface web em:
   👉 `http://127.0.0.1:8000/`
   *(Como o mapeamento de volume `./web:/app` está ativo no `docker-compose.yml`, as alterações de frontend no `index.html` refletem instantaneamente no navegador).*

3. **Monitorizar os Logs da Aplicação em tempo real (Opcional):**
   ```bash
   docker logs -f serralheria_web
   ```

---
## 🛠️ Como Criar e Ativar o Ambiente Virtual (`venv`)

Caso precise recriar o ambiente virtual do Python no projeto, siga estes passos no terminal dentro da pasta `web`:

```bash

# 1. Entrar na pasta web do projeto

cd ~/serralheria-app/web

# 2. Criar o ambiente virtual chamado 'venv'

python3 -m venv venv

# 3. Ativar o ambiente virtual

source venv/bin/activate

# 4. Instalar as dependências do projeto

pip install -r requirements.txt

```

## 🛠️ Manutenção e Operações de Banco de Dados

### 1. Aplicar Migrações do Django
Se alterar o `models.py`, é necessário aplicar as migrações correndo os comandos diretamente dentro do container web:
```bash
docker compose exec web python manage.py makemigrations
docker compose exec web python manage.py migrate
```

### 2. Criar um Administrador (Superuser)
Para criar credenciais de acesso ao sistema e ao painel `/admin`:
```bash
docker compose exec web python manage.py createsuperuser
```
*Siga as instruções no terminal para definir o Username, E-mail e Password.*

### 3. Consultar o PostgreSQL via Terminal (`psql`)
Para explorar os dados diretamente no banco:
```bash
docker exec -it serralheria_db psql -U postgres -d serralheria_db
```
*Dicas úteis no `psql`:*
- `\dt` : Lista todas as tabelas.
- `\x` : Ativa o modo de exibição expandido (vertical) para melhorar a leitura de tabelas largas (ex: `auth_user`).
- `\q` : Sai do banco.

---

## 📋 Próximos Passos para Continuidade do Desenvolvimento

### Etapa 1: Arquivos e Anexos de Clientes (Fotos e Vídeos)
1. **Infraestrutura:**
   - Configurar variáveis `MEDIA_ROOT` e `MEDIA_URL` no `core/settings.py`.
   - Adicionar o mapeamento de rotas de ficheiros estáticos ao `urls.py`.
2. **Modelagem (`portal/models.py`):**
   - Criar uma nova tabela `AnexoCliente` vinculada ao `Cliente` (ForeignKey) ou utilizar um modelo híbrido com campos `JSONB` no PostgreSQL.
3. **Frontend Integration:**
   - Expandir a Ficha do Cliente no `index.html` para permitir upload de arquivos e visualização de galeria de mídias anexadas ao cadastro.

### Etapa 2: Módulo de Orçamentos
1. **Modelagem (`portal/models.py`):**
   - Criar a classe `Orcamento` com os campos: `cliente` (ForeignKey), `servico`, `valor`, `data_envio`, `proximo_contato` e `status`.
2. **Endpoint API (`portal/views.py`):**
   - Criar a view `api_orcamentos` aceitando **GET** e **POST**.

### Etapa 3: Módulo de Ordens de Serviço (OS)
1. **Regra de Negócio Automática:**
   - Ao alterar o status de um orçamento para **Aprovado**, disparar a criação automática da Ordem de Serviço associada no banco.