🚀 EventFlow
Auditoria e Rastreamento Inteligente de Eventos em Tempo Real


📌 Visão Geral

EventFlow é uma aplicação Full Stack moderna, desenvolvida para auditoria, monitoramento e rastreamento de eventos e atividades de usuários em tempo real.

O sistema foi projetado com foco em:

🔐 Segurança

📊 Observabilidade

⚡ Performance

📈 Escalabilidade

🎯 Experiência do usuário

🧠 Arquitetura limpa e profissional

🧠 Explicação Simples (para quem não é técnico)

O EventFlow é um sistema que:

Permite criar contas de usuários

Controla login e autenticação

Registra eventos e atividades

Mostra gráficos e estatísticas

Permite configurar perfil, segurança e notificações

Armazena tudo com segurança em banco de dados

Funciona em tempo real

🏗️ Arquitetura do Projeto
Frontend (React + Vite)
        ↓ API REST
Backend (Node.js + Express + Prisma)
        ↓
Banco de Dados (PostgreSQL)


Frontend e Backend são totalmente desacoplados, comunicando-se via API REST segura.



🖥️ Frontend — Tecnologias Utilizadas
Linguagens e Ferramentas

TypeScript

JavaScript

HTML5

CSS3

Frameworks e Bibliotecas

React

Vite

React Router DOM

Axios

Tailwind CSS

PostCSS

ESLint

Funcionalidades do Frontend

Login e cadastro em tempo real

Validação de e-mail duplicado

Sugestão de senha forte

Login social (UI preparada)

Dashboard com métricas

Gráficos dinâmicos

Filtros por período

Perfil editável

Preferências de tema e idioma

Sistema de notificações

Rotas protegidas

🧠 Backend — Tecnologias Utilizadas
Linguagens e Runtime

Node.js

TypeScript

Frameworks e Bibliotecas

Express

Prisma ORM

PostgreSQL

JWT

bcrypt

dotenv

winston

cors

helmet

Funcionalidades do Backend

API REST

Autenticação JWT

Controle de sessão

Registro de eventos

Logs de auditoria

Middleware de segurança

Notificações

Perfil do usuário

Validações e schemas

🗄️ Banco de Dados

PostgreSQL

Gerenciado via Prisma ORM

Migrações versionadas

Schema tipado

Conexão segura via variável de ambiente

🔐 Variáveis de Ambiente
Backend (backend/.env)
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/eventflow
JWT_SECRET=your_secret
NODE_ENV=development

Frontend (frontend/.env)
VITE_API_URL=http://localhost:5000


⚠️ Nunca versionar .env em produção
Use .env.example no GitHub.

📦 Instalação — Passo a Passo Completo
1️⃣ Pré-requisitos

Node.js (v18+)

NPM ou Yarn

PostgreSQL

Git

2️⃣ Clonar o projeto
git clone https://github.com/andersondosreispacheco/eventflow.git
cd EventFlow

3️⃣ Backend
cd backend
npm install


Criar banco de dados no PostgreSQL:

CREATE DATABASE eventflow;


Rodar migrações:

npx prisma migrate deploy


Iniciar backend:

npm run dev

4️⃣ Frontend
cd frontend
npm install
npm run dev


Sistema de logging com Winston

Middleware de auditoria ativa

🐳 Docker (opcional)

Projeto preparado para uso com Docker e Docker Compose para ambientes de produção e testes.

🚀 Deploy (Produção)

Frontend: Netlify

Backend: Render

Banco: PostgreSQL gerenciado

CI/CD: GitHub Actions (opcional)

🎯 Objetivo do Projeto

Portfólio profissional

Projeto real e escalável

Demonstração de arquitetura moderna

Preparação para mercado de trabalho

👨‍💻 Autor

Anderson Pacheco
Desenvolvedor Full Stack

✅ Status do Projeto

✔️ Completo
✔️ Funcional
✔️ Escalável
✔️ Pronto para produção
