---
tags: [tech, architecture]
---

# Arquitetura do Splitly

> ← [[Splitly - Home]] | Veja também: [[Deploy e Ambiente]], [[Redirect e Tracking]]

## Diagrama de fluxo

```
Usuário clica no anúncio (Meta Ads / TikTok / YouTube)
        │
        ▼
  ┌─────────────────┐
  │ splitly.app/r/   │  ← Link único em TODAS as campanhas
  │   {slug}         │
  └──────┬──────────┘
         │
         │ Verifica cookie ab_{slug}
         │   ├─ Tem cookie? → mesma variante (sticky session)
         │   └─ Não tem?   → sorteio ponderado por weight
         │ Injeta tracking: xcod (Hotmart) / src (Kiwify) / splitly_vid
         │ Injeta UTM (se configurado)
         │
    ┌────┼────┬────┐
    ▼    ▼    ▼    ▼
   PV1  PV2  VSL  Quiz   ← Landing pages
    │    │    │    │
    │    │    │    │  tracker.js captura splitly_vid
    ▼    ▼    ▼    ▼
  Hotmart / Kiwify / Eduzz checkout
    │
    │ Venda aprovada
    ▼
  POST /api/postback  ←  Webhook da plataforma
  OU
  GET  /api/pixel     ←  Pixel 1x1 na thank-you page
```

## Estrutura do projeto

```
splitly-saas/
├── app/
│   ├── (auth)/           # Login, Register, Forgot Password
│   ├── (dashboard)/      # Dashboard, Settings
│   │   ├── dashboard/    # Lista + Novo experimento
│   │   └── experiments/  # Detalhe + Analytics + Decisão
│   ├── r/[slug]/route.ts # 🔴 Redirect endpoint (core)
│   ├── api/
│   │   ├── auth/         # NextAuth handlers
│   │   ├── postback/     # Recebe notificações de venda
│   │   ├── pixel/        # Pixel 1x1 universal
│   │   ├── export/       # CSV export
│   │   └── v1/           # API pública REST
│   └── share/[token]/    # Link público read-only
├── components/
│   ├── ui/               # shadcn/ui: Button, Card, Input, Badge, etc.
│   ├── sidebar.tsx       # Sidebar com dark mode toggle
│   ├── decision-panel.tsx
│   ├── variant-form.tsx
│   ├── simulate-postback.tsx
│   ├── onboarding-wizard.tsx
│   └── ...
├── lib/
│   ├── db/               # Drizzle schema + connection + indexes
│   ├── auth.ts           # NextAuth config
│   ├── actions.ts        # Server actions (CRUD)
│   ├── analytics.ts      # Motor bayesiano (Monte Carlo)
│   ├── guards.ts         # Auth + ownership centralizado
│   ├── utils.ts          # Tailwind + clsx helpers
│   └── utils/            # URL validation
├── public/
│   ├── tracker.js        # Script de landing page
│   ├── logo.png          # Logo preta horizontal
│   └── logo-white.png    # Logo branca horizontal
└── types/                # TypeScript augmentations
```

## Banco de dados

### Tabelas principais

| Tabela | Descrição |
|--------|-----------|
| `users` | Contas, auth, domínio customizado, API key |
| `experiments` | Testes A/B com slug único, status, custo |
| `variants` | URLs de destino, peso, UTM params |
| `events` | Cada clique/redirect registrado com visitor_hash |
| `conversions` | Vendas registradas via postback ou pixel |
| `plans` | Planos de assinatura (Stripe groundwork) |
| `subscriptions` | Assinaturas ativas por usuário |

### Relacionamentos

```
users 1──N experiments
experiments 1──N variants
experiments 1──N events
events 1──N conversions
users 1──1 subscriptions
subscriptions N──1 plans
```

### Índices

| Tabela | Índice | Coluna |
|--------|--------|--------|
| `variants` | `idx_variants_experiment` | `experiment_id` |
| `events` | `idx_events_experiment` | `experiment_id` |
| `events` | `idx_events_visitor` | `visitor_hash` |
| `conversions` | `idx_conversions_experiment` | `experiment_id` |
| `conversions` | `idx_conversions_visitor` | `visitor_hash` |

## Autenticação

- **NextAuth.js v5** com provider `credentials` (email/senha)
- **bcryptjs** para hash de senha
- JWT session strategy
- Proteção de rotas no layout do dashboard (server-side `auth()`)
- API Key para acesso à API pública (`/api/v1/*`)

## Guards e segurança

- **`lib/guards.ts`** — `getOwnedExperiment()` centraliza verificação de auth + ownership de experimento. Elimina duplicação de 10 blocos repetidos em server actions.
- **PII sanitization** — `app/api/postback/route.ts` sanitiza payload antes de logar e persistir: remove campos `buyer`, `email`, `phone`, `address` do `rawData`.
- **Rate limiting** — pendente (MVP).
