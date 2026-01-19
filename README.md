# 🚀 EventFlow — Plataforma de Auditoria e Rastreamento de Eventos em Tempo Real

## 📌 Visão Geral

O **EventFlow** é uma **plataforma completa de auditoria, rastreamento de eventos e gerenciamento de acessos em tempo real**, desenvolvida com foco em **segurança, transparência e controle de dados**. O sistema permite acompanhar atividades de usuários, autenticações, eventos do sistema e métricas operacionais por meio de **dashboards interativos**, **logs auditáveis** e **configurações avançadas de perfil e segurança**.

O projeto foi pensado para ambientes corporativos, aplicações SaaS e sistemas que exigem **monitoramento contínuo**, **histórico confiável de eventos** e **gestão robusta de usuários**.

---

## 🎯 Objetivo do Projeto

* Auditar e rastrear **eventos e acessos em tempo real**
* Centralizar **logs de autenticação e ações do usuário**
* Garantir **segurança, rastreabilidade e conformidade**
* Oferecer **experiência moderna** com interface intuitiva
* Permitir **exportação e controle total dos dados do usuário**

---

## 🧠 Como o EventFlow Funciona

### 🔐 Autenticação e Cadastro

* Cadastro dinâmico de usuários
* Validação automática de usuários já existentes
* Senhas criptografadas
* Após cadastro, o usuário é **redirecionado obrigatoriamente para o login**
* Login com credenciais previamente cadastradas
* Autenticação baseada em **JWT (Access Token + Refresh Token)**
* Redirecionamento automático para o **Dashboard principal** após login bem-sucedido

---

## 🖥️ Dashboard Principal

O **Dashboard** apresenta informações consolidadas e em tempo real:

* 📊 **Total de eventos registrados**
* 👤 **Logins realizados no dia**
* 📈 **Acessos ao dashboard**
* 🗓️ **Eventos dos últimos 7 dias**
* 📉 Gráficos em tempo real (preparados para expansão)
* 📄 Exportação de relatórios

---

## ⚙️ Configurações do Usuário

### 👤 Perfil

* Visualização do nome e e-mail cadastrados
* Edição de perfil:

  * Foto ou avatar
  * Nome completo
  * Nome social
  * E-mail
  * Biografia (até **150 caracteres**)

---

### 🔐 Segurança do Perfil

* Alteração de senha:

  * Senha atual
  * Nova senha
  * Confirmação da nova senha
* Regras recomendadas:

  * Letras maiúsculas
  * Letras minúsculas
  * Números
  * Caracteres especiais
* Autenticação de dois fatores (2FA)
* Visualização de **sessões ativas**:

  * Navegador (ex: Chrome 120)
  * IP atual

---

### 🔔 Notificações

* Notificações por e-mail
* Notificações push
* Alertas de segurança
* Alertas de login
* Alterações de produto
* Newsletter
* E-mails de marketing
* Marcar todas como lidas
* Visualizar notificações não lidas
* Limpar todas as notificações

---

### 🎨 Aparência e Preferências

* Tema claro / escuro 🌙
* Idiomas disponíveis:

  * Português (BR)
  * Inglês (EUA)
  * Espanhol
* Sessão automática:

  * 15 minutos
  * 30 minutos
  * 1 hora
  * 2 horas
* Preferências de retenção de dados

---

### 📦 Gerenciamento de Dados

* Exportação de dados:

  * Eventos
  * Perfil
  * Backup completo da conta
* Download dos dados em **JSON**
* Limpeza de eventos críticos
* Exclusão permanente da conta (com confirmação de senha)

---

### 🔄 Migração de Conta (Em Desenvolvimento)

* Criação de processos de migração
* Importação/exportação futura de contas

---

## 🛠️ Tecnologias Utilizadas

### 🔙 Backend

* **Node.js**
* **Express.js**
* **TypeScript**
* **Prisma ORM**
* **PostgreSQL** (Render)
* **JWT (Access + Refresh Tokens)**
* **Bcrypt** (hash de senhas)
* **Zod** (validação de dados)
* **Helmet** (segurança HTTP)
* **Morgan** (logs)
* **CORS**

---

### 🎨 Frontend

* **React.js**
* **TypeScript**
* **Vite** (build e desenvolvimento rápido)
* **React Router DOM**
* **Axios / Fetch API**
* **Chart.js / React-ChartJS-2**
* **Framer Motion** (animações)
* **React Hook Form + Zod**

---

## 🗄️ Banco de Dados

* **PostgreSQL**
* Estrutura relacional
* Migrações automáticas via Prisma
* Criação dinâmica de tabelas

---

## ☁️ Infraestrutura e Deploy

* **Frontend**: Vercel
* **Backend**: Render
* **Banco de Dados**: PostgreSQL (Render)
* Variáveis de ambiente isoladas por ambiente

---

## 🔑 Variáveis de Ambiente (Exemplo)

```env
PORT=10000
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host/database
JWT_REFRESH_SECRET=your_refresh_secret
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
FRONTEND_URL=https://eventflow.vercel.app
```

Frontend:

```env
VITE_API_URL=https://eventflow-backend.onrender.com
```

---

## 📈 Performance e Otimização

* Code splitting no frontend
* Build otimizado com Vite
* Hashing seguro de senhas
* Tokens com expiração configurável
* Logs estruturados

---

## 🔒 Segurança

* Autenticação JWT
* Hash de senhas com Bcrypt
* Proteção HTTP com Helmet
* CORS configurado
* Controle de sessões
* Alertas de login e segurança

---

## 📦 Status do Projeto

🚧 **Em desenvolvimento contínuo**

* Funcionalidades principais concluídas
* Migração de contas em desenvolvimento
* Gráficos avançados em expansão

---

## 👨‍💻 Autor

**Anderson Pacheco**

Projeto desenvolvido com foco em aprendizado avançado, arquitetura moderna e boas práticas de mercado.

---

## ⭐ Considerações Finais

O **EventFlow** é um projeto robusto, escalável e pronto para evoluir para ambientes de produção reais, oferecendo **controle total, auditoria detalhada e segurança avançada**.

Se você procura uma base sólida para sistemas auditáveis e orientados a eventos, este projeto é um excelente ponto de partida.
