# Gestao de Deposito

Sistema de gestao de deposito com **cadastro de itens** e **catalogo**, com login de administrador.

- **Backend:** Node.js + Express + SQLite (better-sqlite3) + JWT
- **Frontend:** React + Vite + React Router

## Funcionalidades

- Login de administrador (JWT)
- Cadastro de itens com: Nome, Quantidade, Foto, Categoria, Tipo de uso, Observacoes
- Datas de cadastro e alteracao automaticas
- Catalogo com busca, edicao e exclusao
- Upload de fotos

## Como rodar

### 1. Backend

```powershell
cd backend
npm install
npm run seed   # cria o usuario admin (apenas na primeira vez)
npm run dev    # inicia em http://localhost:4000
```

### 2. Frontend (em outro terminal)

```powershell
cd frontend
npm install
npm run dev    # inicia em http://localhost:5173
```

Abra http://localhost:5173 no navegador.

## Login padrao

| Usuario | Senha    |
| ------- | -------- |
| admin   | admin123 |

> As credenciais e o segredo JWT ficam no arquivo `backend/.env`.
> Altere a senha e o `JWT_SECRET` antes de usar em producao.

## Estrutura

```
gestao-deposito/
├── backend/          # API Node/Express
│   ├── routes/       # auth.js, items.js
│   ├── middleware/   # auth.js (JWT)
│   ├── db.js         # banco SQLite + tabelas
│   ├── seed.js       # cria o admin inicial
│   └── server.js
└── frontend/         # App React
    └── src/
        ├── pages/    # Login, Catalogo, CadastroItem
        ├── components/
        └── context/  # AuthContext
```
