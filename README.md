# Serralheria App — Sistema de Gestão ERP

Sistema web completo de gestão operacional e comercial para serralheria, desenvolvido em **Python (Django)**, **PostgreSQL** (containerizado com Docker) e **JavaScript SPA** para alta responsividade na interface.

---

## 🏗️ Arquitetura e Stack Tecnológica

- **Backend:** Python 3.12+ / Django 4.2+ (App `portal`)
- **Banco de Dados:** PostgreSQL 15 (Container `serralheria_db`)
- **Containerização:** Docker & Docker Compose
- **Frontend:** HTML5, CSS3, JavaScript (ES6+ assíncrono com API Fetch e manipulação dinâmica de DOM)
- **Autenticação:** Django Authentication System (com decorador `@login_required` e proteção de rotas)
- **Ambiente de Desenvolvimento:** Ubuntu WSL2 (Windows Subsystem for Linux) + `venv` local

---

## 📁 Estrutura de Diretórios do Projeto

```text
serralheria-app/
├── docker-compose.yml           # Serviço do banco de dados PostgreSQL 15
├── .gitignore                   # Ignora venv, cache Python e arquivos temporários do WSL/Windows
├── README.md                    # Documentação técnica e guia de continuidade
└── web/                         # Projeto Django principal
    ├── Dockerfile               # Imagem da aplicação Python/Django
    ├── manage.py                # Utilitário de comandos do Django
    ├── requirements.txt         # Dependências (Django, psycopg2-binary, etc.)
    ├── core/                    # Configurações globais (settings, urls, wsgi, asgi)
    │   ├── settings.py          # Conexão com o banco PostgreSQL no Docker
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

## 📌 Histórico do Projeto e Progresso Atual (v0.2)

### 1. Infraestrutura & Ambiente
- [x] Configuração da árvore de diretórios e ambiente virtual (`venv`).
- [x] Criação do `docker-compose.yml` para orquestração do banco de dados PostgreSQL na porta `5432`.
- [x] Conexão bem-sucedida entre o Django (`core/settings.py`) e o banco containerizado.
- [x] Versionamento inicial do código no GitHub (`silviojpa/serralheria-app`).

### 2. Autenticação e Segurança
- [x] Implementação do fluxo completo de login e logout via Django Auth.
- [x] Proteção da rota principal (`/`) com o decorador `@login_required`, redirecionando usuários não autenticados para `/login/`.
- [x] Implementação da captura e envio automático do token CSRF (`X-CSRFToken`) nas requisições HTTP assíncronas do frontend.

### 3. Módulo de Clientes (Integração Backend + Frontend)
- [x] Modelagem da tabela `Cliente` (`portal_cliente`) no PostgreSQL contendo campos como `nome`, `cpf_cnpj`, `telefone`, `email`, `endereco` e `status`.
- [x] Registro da modelagem no painel administrativo do Django (`portal/admin.py`).
- [x] Criação da rota `/api/clientes/` permitindo requisições **GET** (listagem completa) e **POST** (cadastro em JSON).
- [x] Atualização da SPA (`index.html`) para substituir dados estáticos hardcoded pela busca assíncrona real (`carregarClientesDoBackend()`).
- [x] Integração do formulário interativo de cadastro de novos clientes salvando diretamente no banco PostgreSQL.
- [x] Limpeza das funções de renderização (`fichaCliente()`) para exibir unicamente dados cadastrais dinâmicos.

---

## 🚀 Como Executar o Projeto Localmente

### Pró-requisitos
- Docker & Docker Compose instalados e ativos.
- Python 3.10+ configurado no WSL (Ubuntu).

### Passo a Passo

1. **Subir o container do PostgreSQL:**
   ```bash
   cd ~/silvio/python/serralheria-app
   docker compose up -d
   ```

2. **Ativar o ambiente virtual e acessar a pasta `web`:**
   ```bash
   source venv/bin/activate
   cd web
   ```

3. **Executar migrações do banco (caso necessário):**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

4. **Iniciar o servidor de desenvolvimento:**
   ```bash
   python manage.py runserver
   ```
   *Acesse no navegador através de:* `http://127.0.0.1:8000/`

---

## 📋 Próximos Passos para Continuidade do Desenvolvimento

Abaixo está o roteiro sugerido para a evolução gradual dos demais módulos da serralheria:

### Etapa 1: Módulo de Orçamentos
1. **Modelagem (`portal/models.py`):**
   - Criar a classe `Orcamento` com os campos: `cliente` (ForeignKey para `Cliente`), `servico`, `valor`, `data_envio`, `proximo_contato` e `status` (`Aguardando retorno`, `Em negociação`, `Aprovado`, `Recusado`).
2. **Endpoint API (`portal/views.py`):**
   - Criar a view `api_orcamentos` aceitando **GET** e **POST**.
3. **Frontend Integration:**
   - Criar a função `carregarOrcamentosDoBackend()` no `index.html`.
   - Atualizar a tela de Orçamentos e a aba "Follow-up de Vendas" para renderizarem registros vindos do banco de dados.

### Etapa 2: Módulo de Ordens de Serviço (OS)
1. **Modelagem:**
   - Criar o model `OrdemServico` vinculado a um `Orcamento` (quando aprovado) e ao `Cliente`.
2. **Regra de Negócio Automática:**
   - Ao alterar o status de um orçamento para **Aprovado**, disparar a criação automática da Ordem de Serviço associada no banco.
3. **Interface:**
   - Vincular as páginas de OS e acompanhamento de execução de obras aos dados persistidos.

### Etapa 3: Módulo de Fornecedores e Almoxarifado
1. **Modelagem:**
   - Criar tabelas para `Fornecedor` e `ItemEstoque` (perfil metalon, telhas termoacústicas, chapas galvanizadas, ferragens).
2. **Operações:**
   - Implementar formulários de entrada/saída de estoque e registro de fornecedores homologados.

### Etapa 4: Upload de Anexos e Projetos (Documentos/PDFs)
1. Configuração de `MEDIA_ROOT` e `MEDIA_URL` no Django.
2. Suporte a uploads de arquivos técnicos e desenhos de corte na ficha do cliente e na OS.
```
...eof

O arquivo `README.md` foi gerado e inclui todo o histórico do projeto, a stack configurada, o estado atual do banco PostgreSQL e o roteiro exato para a próxima sessão de desenvolvimento.

### Resumo do que foi configurado:
- Documentação completa da stack (Django, PostgreSQL, Docker Compose, WSL, JS SPA).
- Estrutura de arquivos e fluxo de migração de dados fictícios para a API REST.
- Roteiro detalhado em etapas para quando você retomar o desenvolvimento (Orçamentos, Ordens de Serviço, Fornecedores e Documentos).
