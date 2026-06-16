# 🔐 Aspen Core — Segurança Digital

> Aplicativo mobile de autenticação segura via NFC e biometria, desenvolvido como Trabalho de Conclusão de Curso (TCC).

---

## 📱 Sobre o Projeto

O **Aspen Core** é uma solução brasileira de segurança digital inspirada na YubiKey, tornando a autenticação mais acessível e eliminando a dependência de senhas. O celular funciona como um hardware de autenticação — basta aproximá-lo via NFC e confirmar com biometria para liberar o acesso a sites e aplicativos.

### 🎯 Problema que resolve
Empresas e usuários sofrem com o gerenciamento de senhas: são esquecidas, reutilizadas e vulneráveis a ataques de phishing. O Aspen Core elimina esse problema usando o celular como chave de acesso.

### ✨ Funcionalidades
- ✅ Cadastro e login com autenticação JWT
- ✅ Recuperação de senha por e-mail com código
- ✅ Dashboard com resumo de segurança
- ✅ Gerenciamento de dispositivos conectados
- ✅ Planos de assinatura (Básico, Padrão, Premium)
- ✅ Perfil do usuário com abas (Dados, Segurança, Pagamento, Assinatura)
- ✅ Notificações de eventos da conta
- ✅ Configurações (Conta, Privacidade, Segurança, Preferências)
- ✅ Tela de desbloqueio via NFC + biometria
- ✅ APK Android disponível para instalação direta

---

## 👥 Equipe

| Nome | Função |
|------|--------|
| Rafael Alves de Souza Silva | Desenvolvedor Mobile & Backend |
| Caio Lacerda | Integrante |
| Igor Oliveira | Integrante |
| Enzo Henrique | Integrante |
| Paulo Souza | Integrante |

---

## 🛠️ Tecnologias Utilizadas

### Mobile (App)
- [React Native](https://reactnative.dev/) + [Expo](https://expo.dev/)
- [Expo Router](https://expo.github.io/router/) — navegação por arquivos
- [TypeScript](https://www.typescriptlang.org/)
- [Axios](https://axios-http.com/) — requisições HTTP
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) — armazenamento local
- [expo-local-authentication](https://docs.expo.dev/versions/latest/sdk/local-authentication/) — biometria
- [react-native-nfc-manager](https://github.com/revtel/react-native-nfc-manager) — NFC
- [EAS Build](https://docs.expo.dev/build/introduction/) — geração do APK

### Backend (API)
- [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)
- [PostgreSQL](https://www.postgresql.org/) — banco de dados
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js) — criptografia de senhas
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) — autenticação JWT
- [Resend](https://resend.com/) — envio de e-mails
- [Render](https://render.com/) — hospedagem da API e banco de dados

---

## 📁 Estrutura do Projeto
aspen-m/                        ← Projeto Mobile (Expo)

├── app/

│   ├── (tabs)/

│   │   ├── dashboard.tsx       ← Tela principal

│   │   ├── dispositivos.tsx    ← Gerenciar dispositivos

│   │   ├── planos.tsx          ← Planos de assinatura

│   │   ├── profile.tsx         ← Perfil do usuário

│   │   ├── notificacao.tsx     ← Notificações

│   │   └── configuracoes.tsx   ← Configurações

│   ├── login.tsx               ← Tela de login

│   ├── register.tsx            ← Tela de cadastro

│   ├── esqueci-senha.tsx       ← Recuperação de senha

│   └── desbloqueio.tsx         ← Tela NFC + biometria

├── components/

│   └── Header.tsx              ← Componente de cabeçalho reutilizável

├── services/

│   └── api.ts                  ← Configuração do Axios

├── assets/

│   └── images/                 ← Ícones e imagens

├── app.json                    ← Configuração do Expo

└── eas.json                    ← Configuração do EAS Build
aspen-api/                      ← Backend (Node.js)

├── server.js                   ← API completa

├── .env                        ← Variáveis de ambiente (não subir no Git)

└── package.json

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos
- [Node.js](https://nodejs.org/) instalado
- [Git](https://git-scm.com/) instalado
- Conta no [Expo](https://expo.dev/)
- Aplicativo **Expo Go** no celular (para testar)

---

### 📲 Rodando o App Mobile

**1. Clone o repositório:**
```bash
git clone https://github.com/RafaelAlvesdeSouzaSilva/aspen-m.git
cd aspen-m
```

**2. Instale as dependências:**
```bash
npm install --legacy-peer-deps
```

**3. Configure a API:**

Abra o arquivo `services/api.ts` e coloque a URL da API:
```ts
const BASE_URL = 'https://aspen-api-crqt.onrender.com';
```

**4. Rode o projeto:**
```bash
npx expo start
```

**5. Abra no celular:**
- Instale o **Expo Go** no celular
- Escaneie o QR Code que aparecer no terminal

---

### ⚙️ Rodando o Backend Localmente

**1. Clone o repositório do backend:**
```bash
git clone https://github.com/RafaelAlvesdeSouzaSilva/aspen-api.git
cd aspen-api
```

**2. Instale as dependências:**
```bash
npm install
```

**3. Crie o arquivo `.env`:**
```env
DATABASE_URL=postgresql://usuario:senha@localhost:5432/aspencore
JWT_SECRET=aspencore_secret_2024
RESEND_API_KEY=sua_api_key_aqui
PORT=3000
NODE_ENV=development
```

**4. Crie o banco de dados:**

Abra o MySQL Workbench ou psql e rode:
```sql
CREATE DATABASE aspencore;
```

As tabelas são criadas automaticamente quando o servidor inicia.

**5. Rode o servidor:**
```bash
node server.js
```

O servidor estará disponível em `http://localhost:3000`

---

### 📦 Gerando o APK Android

**1. Instale o EAS CLI:**
```bash
npm install -g eas-cli
```

**2. Faça login no Expo:**
```bash
eas login
```

**3. Gere o APK:**
```bash
eas build --platform android --profile preview
```

**4.** Aguarde o build (~15 minutos) e baixe o APK pelo link gerado.

---

## 🌐 API — Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/` | Teste — verifica se a API está rodando |
| POST | `/auth/cadastro` | Cadastrar novo usuário |
| POST | `/auth/login` | Login do usuário |
| GET | `/usuario/perfil` | Buscar perfil (autenticado) |
| POST | `/auth/esqueci-senha` | Solicitar código de recuperação |
| POST | `/auth/redefinir-senha` | Redefinir senha com código |

### Exemplo de requisição — Login:
```json
POST /auth/login
{
  "email": "usuario@email.com",
  "senha": "minhasenha123"
}
```

### Resposta:
```json
{
  "mensagem": "Login realizado com sucesso!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "nome": "Rafael Alves",
    "email": "usuario@email.com",
    "plano": "basico"
  }
}
```

---

## 🔐 Como funciona o NFC + Biometria

1. Usuário abre a tela de **Modo de Acesso NFC** no app
2. Aproxima o celular de uma **tag NFC** ou dispositivo compatível
3. O app detecta a tag e solicita **autenticação biométrica** (digital ou facial)
4. Após confirmação, o acesso é **liberado automaticamente**
5. Elimina completamente a necessidade de digitar senhas

---

## 🏗️ Arquitetura do Sistema

┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐

│                 │  HTTPS  │                 │   SQL   │                 │

│   App Mobile    │ ──────► │   API Node.js   │ ──────► │   PostgreSQL    │

│  (React Native) │         │   (Render)      │         │   (Render)      │

│                 │         │                 │         │                 │

└─────────────────┘         └─────────────────┘         └─────────────────┘

│                           │

│ NFC                       │ Resend

▼                           ▼

┌─────────────────┐         ┌─────────────────┐

│   Tag/Hardware  │         │   E-mail do     │

│      NFC        │         │    Usuário      │

└─────────────────┘         └─────────────────┘
---

## 🌍 Deploy

| Serviço | Plataforma | URL |
|---------|------------|-----|
| API Backend | Render | https://aspen-api-crqt.onrender.com |
| Banco de dados | Render PostgreSQL | Interno |
| Site institucional | Render | https://aspencore.onrender.com |
| E-mail transacional | Resend | — |

---

## 📄 Licença

Este projeto foi desenvolvido para fins acadêmicos como Trabalho de Conclusão de Curso.

---

<div align="center">
  <p>Desenvolvido com 💚 pela equipe Aspen Core</p>
  <p>Rafael Alves • Caio Lacerda • Igor Oliveira • Enzo Henrique • Paulo Souza</p>
</div>