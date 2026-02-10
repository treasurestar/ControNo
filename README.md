<p align="center">
  <img src="unnamed-removebg-preview.png" alt="ControNo" width="180" />
</p>

<h1 align="center">ControNo</h1>

<p align="center">
  <strong>Sistema de controle de validade e estoque para redes de alimentacao</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Nuxt-4.3-00DC82?style=flat-square&logo=nuxt.js" />
  <img src="https://img.shields.io/badge/Vue-3.5-4FC08D?style=flat-square&logo=vue.js" />
  <img src="https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-3FCF8E?style=flat-square&logo=supabase" />
  <img src="https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss" />
  <img src="https://img.shields.io/badge/TypeScript-Typed-3178C6?style=flat-square&logo=typescript" />
</p>

---

## Sobre

O **ControNo** e um sistema web completo para gerenciar o ciclo de vida de produtos em redes de restaurantes e estabelecimentos alimenticios. Ele rastreia datas de fabricacao e validade, alerta sobre produtos proximos do vencimento e gera relatorios mensais por unidade.

Desenvolvido com **Nuxt 4**, **Supabase** e **Tailwind CSS**, o sistema oferece autenticacao segura, controle de acesso por perfil (admin/usuario), suporte a multiplas unidades e impressao de etiquetas.

---

## Funcionalidades

### Gestao de Produtos
- Cadastro completo: nome, ingredientes, responsavel, peso, datas de fabricacao e validade
- Status automatico baseado na data atual: **OK**, **Vencendo** (<=5 dias) e **Vencido**
- Tres modos de visualizacao: **Cards**, **Tabela** e **Flags**
- Busca e filtros em tempo real
- Impressao de etiquetas personalizadas (68mm x 68mm)

### Dashboard Inteligente
- Cards de estatisticas clicaveis (total, ok, vencendo, vencido)
- Filtro por unidade (admin) ou exibicao automatica (usuario)
- Navegacao direta para produtos filtrados por status

### Multi-Unidade
- Cada unidade/filial e isolada com seus proprios produtos
- Admin enxerga e gerencia todas as unidades
- Usuarios comuns veem apenas sua unidade

### Painel Administrativo
- **Usuarios**: criar, editar, excluir e filtrar por unidade/perfil
- **Unidades**: criar e excluir filiais, visualizar produtos por unidade
- **Relatorios**: metricas mensais por unidade com exportacao CSV

### Relatorios
- Total de produtos no mes
- Quantidade de produtos vencidos
- Media de dias de vida util
- Tabela de produtos vencidos
- Download em `.csv` compativel com Excel

### Tema Claro/Escuro
- Alternancia com um clique
- Preferencia salva no navegador
- Design system com CSS Variables

---

## Stack Tecnologica

| Camada | Tecnologia |
|---|---|
| Framework | Nuxt 4.3 (Vue 3.5) |
| Linguagem | TypeScript |
| Estilizacao | Tailwind CSS + CSS Variables |
| Backend/Auth | Supabase (PostgreSQL + Auth + RLS) |
| Fonte | Poppins (Google Fonts) |

---

## Estrutura do Projeto

```
controno-nuxt/
├── app/
│   ├── assets/css/         # Estilos globais e temas
│   ├── components/         # Componentes reutilizaveis
│   ├── composables/        # Logica compartilhada (useProducts, useAuth, etc.)
│   ├── layouts/            # Layout principal
│   ├── middleware/          # Guards de autenticacao e admin
│   ├── pages/              # Rotas da aplicacao
│   └── utils/              # Utilitarios (datas, status)
├── server/
│   ├── api/                # Endpoints da API (admin, units)
│   └── utils/              # Supabase Admin Client
├── shared/
│   └── types.ts            # Tipagens compartilhadas
├── supabase/
│   └── migrations/         # Schema completo do banco
└── nuxt.config.ts
```

---

## Instalacao

### Pre-requisitos

- **Node.js** 18+
- Conta no **Supabase** (plano gratuito funciona)

### 1. Clone o repositorio

```bash
git clone https://github.com/SEU_USUARIO/controno-nuxt.git
cd controno-nuxt
```

### 2. Instale as dependencias

```bash
npm install
```

### 3. Configure as variaveis de ambiente

Crie um arquivo `.env` na raiz:

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
```

### 4. Configure o banco de dados

No **SQL Editor** do Supabase, execute o conteudo do arquivo:

```
supabase/migrations/00000000000000_full_schema.sql
```

Isso cria todas as tabelas, triggers, policies RLS e o usuario admin.

> **Credenciais iniciais do admin:**
> - Email: `admin@controno.com.br`
> - Senha: `Controno@2026`
> - Troque a senha apos o primeiro login.

### 5. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse em `http://localhost:3000`

---

## Scripts Disponiveis

| Comando | Descricao |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera o build de producao |
| `npm run preview` | Pre-visualiza o build de producao |
| `npm run generate` | Gera site estatico |

---

## Banco de Dados

### Tabelas

| Tabela | Descricao |
|---|---|
| `units` | Unidades/filiais do estabelecimento |
| `profiles` | Perfis de usuario (vinculados ao Supabase Auth) |
| `products` | Produtos com datas de fabricacao e validade |

### Row Level Security (RLS)

- **Units**: qualquer usuario autenticado pode visualizar
- **Profiles**: usuario ve/edita o proprio; admin ve/edita todos
- **Products**: admin acessa todos; usuario acessa apenas da sua unidade

### Triggers

- `products_set_updated_at` — atualiza `updated_at` ao editar produto
- `on_auth_user_created` — cria perfil automaticamente no signup

---

## Licenca

Projeto privado. Todos os direitos reservados.
