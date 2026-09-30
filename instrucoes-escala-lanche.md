# Escala do Lanche — Instruções de Criação do Sistema

Sistema web para o grupo de amigos organizar **quem fica responsável pelo lanche nos encontros de sábado**.

- **Front-end:** React (Vite)
- **Autenticação:** Firebase Authentication
- **Banco de dados:** Cloud Firestore
- **Hospedagem sugerida:** Firebase Hosting

---

## 1. Objetivo e escopo

### Problema
Todo sábado o grupo se encontra e alguém precisa levar o lanche. Sem organização, sempre sobra para os mesmos ou ninguém leva.

### Solução
Um sistema simples onde:
- Cada amigo tem uma conta e faz login.
- Existe uma **escala de sábados** com um responsável por data.
- O sistema sugere o próximo da fila de forma justa (rodízio).
- Cada um pode ver a escala, trocar de data com outro amigo e marcar indisponibilidade.

### Fora do escopo (versão 1)
- Pagamentos ou divisão de custos.
- Chat interno.
- Aplicativo nativo (usar apenas web responsivo/PWA).

---

## 2. Perfis de usuário

| Perfil | Permissões |
|---|---|
| **Membro** | Ver escala, ver próprio histórico, solicitar troca, marcar indisponibilidade, confirmar/marcar lanche como entregue |
| **Admin** | Tudo do membro + gerenciar membros, gerar/editar escala, cancelar sábado, aprovar entrada de novos membros |

O primeiro usuário cadastrado (ou um e-mail definido em configuração) vira admin.

---

## 3. Requisitos funcionais

### 3.1 Autenticação
- RF01: Login com e-mail e senha.
- RF02: Login com Google (opcional, recomendado).
- RF03: Recuperação de senha por e-mail.
- RF04: Cadastro de novo usuário fica com status `pendente` até aprovação do admin (evita que estranhos entrem).
- RF05: Rotas protegidas: só usuários autenticados e aprovados acessam o sistema.

### 3.2 Membros
- RF06: Admin lista, aprova, desativa e promove membros.
- RF07: Cada membro edita seu nome de exibição e (opcional) foto.

### 3.3 Escala
- RF08: Gerar escala automática para os próximos N sábados (padrão: 8).
- RF09: Regra de rodízio: prioriza quem levou há mais tempo (ou nunca levou), respeitando indisponibilidades.
- RF10: Admin pode editar manualmente o responsável de qualquer sábado.
- RF11: Admin pode marcar um sábado como **cancelado** (sem encontro).
- RF12: Tela inicial destaca o **próximo sábado** e quem é o responsável.

### 3.4 Indisponibilidade e trocas
- RF13: Membro marca datas em que não poderá levar o lanche.
- RF14: Membro solicita troca com outro membro para um sábado; o outro aceita ou recusa.
- RF15: Ao aceitar, a escala é atualizada e a troca fica registrada no histórico.

### 3.5 Histórico e confirmação
- RF16: Após o sábado, o responsável (ou admin) marca como **entregue**.
- RF17: Histórico mostra quem levou em cada data e um contador por pessoa.
- RF18: (Opcional) Campo livre "o que foi levado" para registro e diversão.

### 3.6 Notificações (fase 2)
- RF19: Lembrete por e-mail ou push na quinta/sexta para o responsável do sábado.

### 3.7 Dashboard do admin
- RF20: Página exclusiva do admin com visão geral do grupo e da escala.
- RF21: **Cartões de resumo (KPIs):**
  - Total de membros aprovados, pendentes e inativos.
  - Próximo sábado: data, responsável e status (agendado/sem responsável).
  - Quantidade de sábados já entregues no mês/ano.
  - Taxa de cumprimento: `entregues / (entregues + não entregues)` nos sábados passados.
  - Trocas pendentes de resposta.
- RF22: **Alertas que exigem ação do admin:**
  - Sábados futuros sem responsável (`responsavelUid == null`).
  - Cadastros aguardando aprovação (com atalho para aprovar).
  - Sábados passados ainda não marcados como entregues.
  - Escala com menos de 4 sábados futuros (sugerir gerar mais).
  - Conflitos: responsável escalado em data em que marcou indisponibilidade.
- RF23: **Gráficos:**
  - Barras: quantidade de lanches levados por membro (ranking de contribuição).
  - Linha ou barras por mês: sábados realizados vs. cancelados vs. não entregues.
  - Distribuição da escala futura por membro (para checar se o rodízio está equilibrado).
- RF24: **Tabela de membros com métricas:** nome, total de vezes que levou, última vez que levou, próxima data escalada, total de indisponibilidades e trocas solicitadas/aceitas.
- RF25: **Atividade recente:** últimas trocas, entregas confirmadas e aprovações de membros (últimos 10 eventos).
- RF26: Filtro de período (mês atual, últimos 3 meses, ano, tudo) que se aplica aos gráficos e à tabela.
- RF27: Ações rápidas: gerar próximos sábados, aprovar membro, atribuir responsável a sábado sem dono.

---

## 4. Requisitos não funcionais

- **Mobile first e totalmente responsivo:** o sistema é projetado primeiro para o celular (uso principal no dia a dia do grupo) e depois adaptado para tablet e desktop. Detalhes na seção 4.1.
- Interface em português (pt-BR), datas formatadas como `dd/MM/yyyy`.
- Carregamento rápido; usar listeners em tempo real do Firestore apenas onde fizer sentido.
- Segurança via **Firestore Security Rules** (nunca confiar só no front-end).
- Código organizado, com variáveis de ambiente para credenciais do Firebase.

### 4.1 Diretrizes mobile-first e responsividade

**Abordagem**
- Escrever o CSS **do menor para o maior**: estilos base valem para celular (a partir de 320px) e `min-width` media queries adicionam ajustes para telas maiores. Com Tailwind, usar as classes sem prefixo para mobile e `sm:`, `md:`, `lg:`, `xl:` para ampliar.
- Testar sempre primeiro em 360×640 e 390×844 (celulares comuns), depois 768px (tablet) e 1280px (desktop).
- Incluir no `index.html`: `<meta name="viewport" content="width=device-width, initial-scale=1" />`.

**Breakpoints sugeridos**

| Faixa | Largura | Comportamento |
|---|---|---|
| Base (celular) | < 640px | Uma coluna, navegação inferior, cards empilhados |
| `sm` | ≥ 640px | Grades de 2 colunas onde couber |
| `md` (tablet) | ≥ 768px | Navegação lateral opcional, tabelas completas |
| `lg` (desktop) | ≥ 1024px | Layout com sidebar fixa, dashboard em múltiplas colunas |

**Navegação**
- Celular: **barra de navegação fixa na parte inferior** (Home, Escala, Minhas datas, Histórico) com ícones e rótulos; para admin, item extra "Admin" que abre o menu de gestão.
- Tablet/desktop: sidebar ou navbar superior com todos os itens.
- Menus e modais devem ser acessíveis com uma mão; ações principais ao alcance do polegar (parte inferior da tela).

**Toque e usabilidade**
- Alvos de toque com no mínimo **44×44px**, com espaçamento entre botões para evitar toques errados.
- Inputs com tamanho de fonte mínimo de **16px** (evita zoom automático no iOS) e `type`/`inputMode` corretos (`email`, `tel`, `date`).
- Modais viram **bottom sheets** (deslizam de baixo) no celular e diálogos centralizados no desktop.
- Formulários em uma coluna, com rótulos visíveis e teclado adequado por campo.
- Feedback imediato (toasts, estados de carregamento em botões) e nenhuma dependência de `hover` para funcionalidades essenciais.
- Respeitar áreas seguras de aparelhos com entalhe: `padding-bottom: env(safe-area-inset-bottom)` na barra inferior.

**Conteúdo e layout**
- Nada de rolagem horizontal na página. Tabelas largas (ex.: tabela de membros do dashboard) viram **lista de cards** no celular ou ficam dentro de um contêiner com rolagem horizontal controlada.
- Gráficos com `ResponsiveContainer` (recharts), altura fixa adequada para telas pequenas e rótulos abreviados.
- Imagens e avatares com dimensões definidas e `loading="lazy"`.
- Tipografia fluida ou em escala (`text-base` no mobile, maior a partir de `md`), com bom contraste (mínimo WCAG AA).
- Suporte a modo escuro é desejável (`prefers-color-scheme`).

**Desempenho no celular**
- Carregamento das rotas com `React.lazy` + `Suspense` (code splitting), principalmente para as telas de admin e gráficos.
- Evitar listeners em tempo real desnecessários para poupar bateria e dados.
- Meta de Lighthouse mobile: Performance ≥ 85 e Acessibilidade ≥ 90.

**PWA (instalável na tela inicial)**
- Adicionar `manifest.webmanifest` (nome, ícones 192/512px, `display: standalone`, cor do tema) e service worker via `vite-plugin-pwa`.
- Funcionar de forma básica offline: exibir a última escala carregada quando não houver conexão (usar persistência do Firestore com `persistentLocalCache`).

---

## 5. Stack e dependências

```bash
npm create vite@latest escala-lanche -- --template react
cd escala-lanche
npm install firebase react-router-dom date-fns
```

Opcionais:
- `tailwindcss` — **recomendado**: já é mobile-first por padrão (classes base para celular, prefixos `sm:`/`md:`/`lg:` para telas maiores).
- `vite-plugin-pwa` — instalação na tela inicial e cache offline.
- `react-hot-toast` — avisos ao usuário.
- `recharts` — gráficos do dashboard do admin.
- `@tanstack/react-query` — cache e estado de dados (se preferir não usar apenas hooks próprios).

---

## 6. Configuração do Firebase

1. Criar projeto em https://console.firebase.google.com.
2. Adicionar um app **Web** e copiar as credenciais.
3. Ativar **Authentication** → métodos: *E-mail/senha* e *Google*.
4. Criar banco **Firestore** (modo produção) na região mais próxima (ex.: `southamerica-east1`).
5. (Opcional) Ativar **Hosting** para publicar.

### Variáveis de ambiente (`.env`)

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

> Adicionar `.env` ao `.gitignore`. Manter um `.env.example` sem valores.

### `src/firebase.js`

```js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
});

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
```

---

## 7. Modelo de dados (Firestore)

### Coleção `users`
Documento com ID = `uid` do Firebase Auth.

```json
{
  "nome": "João",
  "email": "joao@email.com",
  "foto": "https://...",
  "papel": "membro",          // "membro" | "admin"
  "status": "aprovado",       // "pendente" | "aprovado" | "inativo"
  "criadoEm": "timestamp"
}
```

### Coleção `sabados`
Documento com ID = data no formato `YYYY-MM-DD` (ex.: `2026-10-03`).

```json
{
  "data": "timestamp",
  "responsavelUid": "uid",
  "status": "agendado",       // "agendado" | "entregue" | "cancelado"
  "descricaoLanche": "",
  "entregueEm": null,
  "atualizadoEm": "timestamp"
}
```

### Coleção `indisponibilidades`
```json
{
  "uid": "uid",
  "data": "2026-10-10",
  "motivo": "Viagem"
}
```

### Coleção `trocas`
```json
{
  "sabado": "2026-10-03",
  "solicitanteUid": "uid",
  "destinatarioUid": "uid",
  "status": "pendente",       // "pendente" | "aceita" | "recusada"
  "criadaEm": "timestamp"
}
```

> **Contador de lanches por pessoa:** pode ser calculado consultando `sabados` com `status == "entregue"` e agrupando no cliente (grupo pequeno), ou mantido em `users.totalLevados` atualizado ao marcar como entregue.

### Coleção `atividades` (para o feed do dashboard)
Registro simples de eventos, gravado a cada ação relevante.

```json
{
  "tipo": "entrega",          // "entrega" | "troca_aceita" | "troca_recusada" | "membro_aprovado" | "sabado_cancelado"
  "uid": "uid de quem executou",
  "sabado": "2026-10-03",     // opcional
  "descricao": "João marcou o lanche como entregue",
  "criadoEm": "timestamp"
}
```

> **Métricas do dashboard:** para um grupo de amigos (poucas dezenas de usuários e ~52 sábados/ano), todos os números do dashboard podem ser calculados **no cliente** a partir de `users`, `sabados`, `indisponibilidades` e `trocas`. Não é necessário criar coleções de agregação nem Cloud Functions. Se o volume crescer, migrar para contadores mantidos por Cloud Functions.

---

## 8. Regras de segurança (Firestore Rules) — ponto de partida

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function logado() { return request.auth != null; }
    function meuDoc() { return get(/databases/$(database)/documents/users/$(request.auth.uid)).data; }
    function aprovado() { return logado() && meuDoc().status == "aprovado"; }
    function admin() { return aprovado() && meuDoc().papel == "admin"; }

    match /users/{uid} {
      allow read: if aprovado() || request.auth.uid == uid;
      // usuário cria o próprio doc apenas como membro pendente
      allow create: if request.auth.uid == uid
                    && request.resource.data.papel == "membro"
                    && request.resource.data.status == "pendente";
      // usuário edita apenas nome/foto; admin edita tudo
      allow update: if admin()
                    || (request.auth.uid == uid
                        && request.resource.data.diff(resource.data).affectedKeys().hasOnly(["nome","foto"]));
    }

    match /sabados/{id} {
      allow read: if aprovado();
      allow write: if admin();
      // responsável pode marcar como entregue
      allow update: if aprovado()
                    && resource.data.responsavelUid == request.auth.uid
                    && request.resource.data.diff(resource.data).affectedKeys()
                         .hasOnly(["status","descricaoLanche","entregueEm","atualizadoEm"]);
    }

    match /indisponibilidades/{id} {
      allow read: if aprovado();
      allow create, delete: if aprovado() && request.resource.data.uid == request.auth.uid
                            || admin();
    }

    match /trocas/{id} {
      allow read: if aprovado();
      allow create: if aprovado() && request.resource.data.solicitanteUid == request.auth.uid;
      allow update: if aprovado() && resource.data.destinatarioUid == request.auth.uid;
    }

    // feed de atividades: qualquer aprovado registra o próprio evento; só admin lê
    match /atividades/{id} {
      allow read: if admin();
      allow create: if aprovado() && request.resource.data.uid == request.auth.uid;
      allow update, delete: if false;
    }
  }
}
```

> Revisar e testar as regras no emulador antes de publicar. Ajustar conforme as decisões finais de fluxo.

---

## 9. Estrutura de pastas sugerida

```
src/
├── firebase.js
├── main.jsx
├── App.jsx
├── routes/
│   ├── ProtectedRoute.jsx
│   └── AdminRoute.jsx
├── contexts/
│   └── AuthContext.jsx
├── hooks/
│   ├── useSabados.js
│   ├── useMembros.js
│   ├── useIndisponibilidades.js
│   ├── useTrocas.js
│   └── useDashboard.js        // carrega dados e calcula as métricas do dashboard
├── services/
│   ├── authService.js
│   ├── sabadosService.js
│   ├── membrosService.js
│   ├── escalaService.js      // lógica de geração do rodízio
│   ├── atividadesService.js  // registra eventos para o feed
│   └── metricasService.js    // funções puras que calculam KPIs, alertas e rankings
├── utils/
│   └── datas.js              // gerar sábados, formatar datas
├── components/
│   ├── Navbar.jsx
│   ├── BottomNav.jsx          // navegação inferior (mobile)
│   ├── Layout.jsx             // alterna BottomNav/sidebar conforme breakpoint
│   ├── BottomSheet.jsx        // modal que vira bottom sheet no celular
│   ├── CardProximoSabado.jsx
│   ├── ListaEscala.jsx
│   ├── ModalTroca.jsx
│   ├── Loading.jsx
│   └── dashboard/
│       ├── CardKpi.jsx
│       ├── PainelAlertas.jsx
│       ├── GraficoRanking.jsx
│       ├── GraficoMensal.jsx
│       ├── TabelaMembros.jsx
│       ├── FeedAtividades.jsx
│       └── FiltroPeriodo.jsx
└── pages/
    ├── Login.jsx
    ├── Cadastro.jsx
    ├── AguardandoAprovacao.jsx
    ├── Home.jsx               // próximo sábado + próximos da escala
    ├── Escala.jsx             // calendário/lista completa
    ├── MinhasDatas.jsx        // indisponibilidades e trocas
    ├── Historico.jsx
    └── admin/
        ├── Dashboard.jsx
        ├── Membros.jsx
        └── GerenciarEscala.jsx
```

---

## 10. Telas e comportamento

1. **Login / Cadastro** — e-mail/senha e botão Google. Após cadastro, mostrar tela "Aguardando aprovação do admin".
2. **Home** — card grande com o próximo sábado, nome do responsável e botão "Trocar". Abaixo, os próximos 3–4 sábados. Se o usuário logado for o responsável, mostrar destaque ("Neste sábado o lanche é seu!").
3. **Escala** — lista (ou calendário) de todos os sábados futuros com responsável e status.
4. **Minhas datas** — marcar/desmarcar indisponibilidades; ver trocas recebidas (aceitar/recusar) e enviadas.
5. **Histórico** — sábados passados, quem levou, o que levou; ranking/contador por pessoa.
6. **Admin › Dashboard** — página inicial do admin (ver detalhamento abaixo).
7. **Admin › Membros** — aprovar pendentes, desativar, promover a admin.
8. **Admin › Gerenciar escala** — gerar próximos sábados, editar responsável, cancelar sábado.

### Layout do Dashboard (Admin › Dashboard)

```
┌──────────────────────────────────────────────────────────────┐
│ Dashboard                          [Período: Últimos 3 meses]│
├──────────┬──────────┬──────────┬──────────┬──────────────────┤
│ Membros  │ Próximo  │ Entregues│ Taxa de  │ Trocas           │
│ ativos   │ sábado   │ no mês   │ cumprim. │ pendentes        │
├──────────┴──────────┴──────────┴──────────┴──────────────────┤
│ ⚠ Alertas (ações necessárias)                                │
│  • 2 sábados futuros sem responsável        [Atribuir]       │
│  • 1 cadastro aguardando aprovação          [Aprovar]        │
│  • 1 sábado passado sem confirmação         [Marcar entregue]│
├─────────────────────────────┬────────────────────────────────┤
│ Ranking: lanches por membro │ Sábados por mês                │
│ (gráfico de barras)         │ (realizados/cancelados/faltou) │
├─────────────────────────────┴────────────────────────────────┤
│ Tabela de membros (total, última vez, próxima data, trocas)  │
├──────────────────────────────────────────────────────────────┤
│ Atividade recente (últimos 10 eventos)                       │
└──────────────────────────────────────────────────────────────┘
```

**Comportamento:**
- **Mobile first:** o layout acima é a versão desktop (`lg`). No celular, tudo em uma coluna, nesta ordem: alertas, KPIs (grade 2×3 ou carrossel horizontal), gráficos empilhados, tabela de membros (como lista de cards) e feed de atividades. Alertas ficam no topo por exigirem ação.
- Em tablet (`md`), KPIs em 3 colunas e gráficos lado a lado.
- Ações dos alertas abrem bottom sheets no celular.
- Cada alerta tem botão de ação direta que leva à tela ou modal correspondente.
- O filtro de período recalcula gráficos e tabela; os KPIs de "próximo sábado" e "trocas pendentes" ignoram o filtro.
- Estados de carregamento (skeleton), vazio ("Nenhum dado no período") e erro em cada bloco.

### Cálculo das métricas (`metricasService.js`)

Implementar como **funções puras** (recebem arrays, devolvem objetos), para facilitar testes:

| Função | Retorno |
|---|---|
| `calcularKpis(membros, sabados, trocas)` | contagens de membros por status, próximo sábado, entregues no mês, taxa de cumprimento, trocas pendentes |
| `gerarAlertas(membros, sabados, indisponibilidades, hoje)` | lista de `{ tipo, mensagem, acao }` |
| `rankingPorMembro(membros, sabados, periodo)` | `[{ uid, nome, total }]` ordenado desc |
| `sabadosPorMes(sabados, periodo)` | `[{ mes, entregues, cancelados, naoEntregues }]` |
| `metricasPorMembro(membros, sabados, indisponibilidades, trocas)` | linhas da tabela do RF24 |

Definições:
- **Não entregue:** sábado com data passada, `status == "agendado"` e responsável definido.
- **Taxa de cumprimento:** `entregues / (entregues + naoEntregues)`; ignorar sábados cancelados.
- **Conflito de indisponibilidade:** sábado futuro cujo responsável possui registro em `indisponibilidades` para a mesma data.

---

## 11. Lógica de geração da escala (rodízio justo)

Implementar em `escalaService.js`:

1. Gerar a lista de próximos N sábados a partir de hoje (ignorar sábados que já existem em `sabados`).
2. Buscar membros com `status == "aprovado"`.
3. Para cada sábado, em ordem cronológica:
   - Remover candidatos com indisponibilidade naquela data.
   - Ordenar candidatos por: (a) menor número de vezes que levou, (b) data mais antiga da última vez que levou.
   - Evitar repetir o mesmo responsável em sábados consecutivos, se houver alternativa.
   - Escolher o primeiro da lista e contabilizá-lo como "levou" para os próximos sábados da mesma geração.
4. Salvar com `writeBatch` no Firestore.
5. Se nenhum candidato estiver disponível, deixar `responsavelUid: null` e sinalizar para o admin resolver.

### Utilitário de datas

```js
import { addDays, nextSaturday, format } from "date-fns";

export function proximosSabados(qtd = 8, base = new Date()) {
  const lista = [];
  let atual = base.getDay() === 6 ? base : nextSaturday(base);
  for (let i = 0; i < qtd; i++) {
    lista.push(format(atual, "yyyy-MM-dd"));
    atual = addDays(atual, 7);
  }
  return lista;
}
```

---

## 12. Rotas

| Rota | Acesso |
|---|---|
| `/login`, `/cadastro` | Público |
| `/aguardando` | Autenticado e pendente |
| `/` (Home) | Aprovado |
| `/escala` | Aprovado |
| `/minhas-datas` | Aprovado |
| `/historico` | Aprovado |
| `/admin` (redireciona para `/admin/dashboard`) | Admin |
| `/admin/dashboard` | Admin |
| `/admin/membros` | Admin |
| `/admin/escala` | Admin |

`ProtectedRoute` deve checar: autenticado → aprovado → (se rota admin) papel admin.

---

## 13. Plano de implementação (ordem sugerida)

1. **Setup:** projeto Vite, dependências, Firebase, variáveis de ambiente, Tailwind e `Layout` mobile-first (BottomNav + sidebar responsiva) já na base do projeto.
2. **Autenticação:** `AuthContext`, login, cadastro, logout, rotas protegidas, fluxo de aprovação.
3. **Membros (admin):** listar, aprovar, desativar.
4. **Escala básica:** criar/listar sábados manualmente, Home com próximo sábado.
5. **Geração automática** do rodízio.
6. **Indisponibilidades.**
7. **Trocas** entre membros.
8. **Confirmação de entrega e histórico.**
9. **Feed de atividades:** gravar eventos em `atividades` nas ações de entrega, troca, aprovação e cancelamento.
10. **Dashboard do admin:** `metricasService.js` (com testes unitários das funções puras), `useDashboard`, KPIs, alertas, gráficos, tabela, feed e filtro de período.
11. **Regras de segurança** finais + testes no emulador.
12. **PWA, responsividade e deploy:** manifest, service worker, cache offline, revisão em 360px/390px/768px/1280px, auditoria Lighthouse mobile e `firebase deploy`.
13. **Fase 2:** notificações (Cloud Functions + e-mail ou FCM).

---

## 14. Critérios de aceite

- [ ] Usuário novo se cadastra e só acessa o sistema após aprovação do admin.
- [ ] Home mostra corretamente o próximo sábado e o responsável.
- [ ] Admin gera 8 sábados e nenhum responsável é escalado em data em que marcou indisponibilidade.
- [ ] Rodízio distribui de forma equilibrada entre os membros.
- [ ] Troca aceita atualiza a escala para ambos.
- [ ] Responsável consegue marcar "entregue" e o histórico reflete.
- [ ] Um membro comum não consegue editar a escala nem aprovar usuários (validado pelas Rules).
- [ ] Apenas admins acessam `/admin/dashboard` e a coleção `atividades`.
- [ ] Dashboard exibe KPIs corretos (conferidos manualmente com dados de teste).
- [ ] Alertas aparecem para sábado sem responsável, cadastro pendente, entrega não confirmada e conflito de indisponibilidade, cada um com ação direta.
- [ ] Gráfico de ranking e gráfico mensal mudam conforme o filtro de período.
- [ ] Feed mostra as últimas atividades em ordem cronológica decrescente.
- [ ] Funções de `metricasService.js` têm testes unitários cobrindo casos vazios e sábados cancelados.
- [ ] Todas as telas (inclusive as de admin e o dashboard) funcionam sem rolagem horizontal em 360px, 390px, 768px e 1280px.
- [ ] Navegação inferior no celular e sidebar/navbar em telas maiores.
- [ ] Alvos de toque ≥ 44px e inputs com fonte ≥ 16px (sem zoom automático no iOS).
- [ ] Modais aparecem como bottom sheet no celular.
- [ ] Sistema instalável como PWA e exibe a última escala carregada quando offline.
- [ ] Lighthouse mobile: Performance ≥ 85 e Acessibilidade ≥ 90.

---

## 15. Convenções

- Componentes funcionais com hooks; nomes em PascalCase para componentes, camelCase para funções.
- **Mobile first sempre:** todo componente novo é desenhado e testado primeiro em 360px; estilos para telas maiores entram por breakpoints.
- Textos da interface em pt-BR.
- Datas armazenadas como `YYYY-MM-DD` (ID e campos de data simples) ou `Timestamp` quando houver horário.
- Tratar estados de carregamento, vazio e erro em todas as telas.
- Nunca expor lógica de permissão apenas no front; sempre refletir nas Security Rules.

---

## 16. Prompt de partida (para usar com um assistente de código)

> Leia este documento inteiro e implemente o sistema seguindo o plano da seção 13, começando pelo passo 1 (o dashboard do admin entra nos passos 9 e 10). Use React + Vite, Firebase Auth e Firestore, com o modelo de dados da seção 7 e a estrutura de pastas da seção 9. Ao final de cada etapa, explique o que foi feito e como testar.
