# Escala do Lanche

Sistema web para o grupo de amigos organizar quem leva o lanche nos sábados. React + Vite, Firebase Authentication e Cloud Firestore. Ver `instrucoes-escala-lanche.md` para a especificação completa.

## Rodando localmente

```bash
npm install
cp .env.example .env   # preencha com as credenciais do seu projeto Firebase
npm run dev
```

## Configurar o Firebase

1. Crie um projeto em https://console.firebase.google.com.
2. Adicione um app **Web** e copie as credenciais para o `.env`.
3. Ative **Authentication** com os métodos e-mail/senha e Google.
4. Crie o **Firestore** em modo produção.
5. Defina `VITE_ADMIN_EMAIL` no `.env` com o e-mail que deve se tornar admin ao se cadastrar.
6. Edite `firestore.rules` e substitua `SUBSTITUA_PELO_EMAIL_DO_ADMIN@exemplo.com` pelo **mesmo** e-mail usado em `VITE_ADMIN_EMAIL` (em minúsculas).
7. Publique as regras: `firebase deploy --only firestore:rules` (ou cole o conteúdo no console).

## Scripts

- `npm run dev` — ambiente de desenvolvimento
- `npm run build` — build de produção (`dist/`)
- `npm run test` — testes unitários (Vitest) dos serviços de escala e métricas
- `npm run preview` — pré-visualiza o build de produção
- `npm run lint` — Oxlint

## Deploy

```bash
npm run build
firebase deploy
```

## Estrutura

Ver seção 9 de `instrucoes-escala-lanche.md`. Resumo:

- `src/services/` — acesso ao Firestore e regras de negócio (rodízio, métricas)
- `src/hooks/` — hooks que conectam componentes aos serviços em tempo real
- `src/pages/` — telas, incluindo `pages/admin/` para o dashboard e gestão
- `src/components/` — componentes de UI, com `components/dashboard/` para o painel admin
