# Status do Projeto — Gestao de Deposito

> Documento de acompanhamento. Resume tudo que ja foi feito para retomar o trabalho rapidamente.
> Ultima atualizacao: 2026-06-22

## Visao geral

Sistema de **gestao de deposito** com **cadastro de itens**, **catalogo** e **login de administrador**.

- **Backend:** Node.js + Express + SQLite (better-sqlite3) + JWT
- **Frontend:** React + Vite + React Router + Axios
- **Local:** `c:\ativacoes\gestao-deposito`

## Como rodar

Cada parte em um terminal proprio:

```powershell
# Terminal 1 - Backend (http://localhost:4000)
cd backend
npm install          # apenas na primeira vez
npm run seed         # apenas na primeira vez (cria o admin)
npm run dev

# Terminal 2 - Frontend (http://localhost:5173)
cd frontend
npm install          # apenas na primeira vez
npm run dev
```

Acesse http://localhost:5173

**Login padrao:** `admin` / `admin123` (definido em `backend/.env`)

## O que JA foi feito

### Backend (`backend/`)

- [x] Servidor Express com CORS e tratamento de erros — `server.js`
- [x] Banco SQLite com tabelas `users` e `items` (criadas automaticamente) — `db.js`
- [x] Seed que cria o usuario admin inicial — `seed.js`
- [x] Login de admin com JWT (expira em 8h) — `routes/auth.js`
- [x] Middleware de autenticacao (protege as rotas) — `middleware/auth.js`
- [x] API de itens (CRUD completo) — `routes/items.js`
  - `GET    /api/items` listar (com busca `?q=` e filtro `?categoria=`)
  - `GET    /api/items/:id` buscar um
  - `POST   /api/items` criar
  - `PUT    /api/items/:id` editar
  - `DELETE /api/items/:id` excluir
- [x] Upload de fotos com multer 2.x (apenas imagens, max 5MB), servidas em `/uploads`

### Frontend (`frontend/`)

- [x] Estrutura Vite + React Router — `main.jsx`, `App.jsx`
- [x] Proxy de `/api` e `/uploads` para o backend — `vite.config.js`
- [x] Contexto de autenticacao + token no localStorage — `context/AuthContext.jsx`
- [x] Axios com interceptors (anexa token, desloga no 401) — `api.js`
- [x] Tela de **Login** — `pages/Login.jsx`
- [x] Tela de **Cadastro/Edicao** de item — `pages/CadastroItem.jsx`
- [x] **Catalogo** em cards com busca, editar e excluir — `pages/Catalogo.jsx`
- [x] Layout com navbar e logout — `components/Layout.jsx`
- [x] Estilizacao completa — `styles.css`
- [x] Rotas protegidas (redireciona para /login sem token)

### Campos do item (todos implementados)

Nome\*, Quantidade, Foto, Categoria, Tipo de uso, Observacoes, Data de cadastro (auto), Data de alteracao (auto).

### Testado e funcionando

- [x] Login via API e via interface
- [x] Cadastro de item (testado com "Furadeira Bosch")
- [x] Exibicao no catalogo com datas, tags e quantidade

## Estrutura de pastas

```
gestao-deposito/
├── PROJETO.md            # este arquivo
├── README.md
├── backend/
│   ├── server.js
│   ├── db.js
│   ├── seed.js
│   ├── .env              # PORT, JWT_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD
│   ├── routes/
│   │   ├── auth.js
│   │   └── items.js
│   ├── middleware/
│   │   └── auth.js
│   └── uploads/          # fotos enviadas (ignorado no git)
└── frontend/
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── api.js
        ├── styles.css
        ├── context/AuthContext.jsx
        ├── components/Layout.jsx
        └── pages/
            ├── Login.jsx
            ├── Catalogo.jsx
            └── CadastroItem.jsx
```

## Pendencias / proximos passos sugeridos (NAO feitos ainda)

- [ ] Controle de estoque (movimentacao de entrada/saida)
- [ ] Gerenciamento de multiplos usuarios
- [ ] Paginacao no catalogo
- [ ] Filtro por categoria na interface (a API ja suporta)
- [ ] Deploy (produção)

## Notas importantes

- Antes de producao: trocar `JWT_SECRET` e a senha do admin em `backend/.env`.
- `.env`, `node_modules/`, `uploads/` e `*.db` estao no `.gitignore`.
- Banco fica em `backend/deposito.db` (criado ao iniciar o backend).
