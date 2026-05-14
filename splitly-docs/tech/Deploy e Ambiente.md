---
tags: [tech, deploy, devops]
---

# Deploy e Ambiente

> ← [[Splitly - Home]] | Veja também: [[Arquitetura]], [[Roadmap e Evolução]]

## Produção

- **URL**: https://splitly-saas.vercel.app
- **Projeto Vercel**: `phenrimedeiros-projects/splitly-saas`
- **Região**: Washington, D.C., USA (East) — iad1
- **Build**: Turbopack + TypeScript check

## Banco de dados

- **Tipo**: Neon PostgreSQL (serverless)
- **Host**: `ep-lucky-grass-acjc6ecm.sa-east-1.aws.neon.tech`
- **Database**: `neondb`
- **Driver**: `@neondatabase/serverless` (HTTP)

## Variáveis de ambiente (Vercel)

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | Connection string do Neon |
| `NEXTAUTH_SECRET` | Chave de sessão JWT |
| `NEXTAUTH_URL` | URL base da aplicação |

## Scripts

```bash
npm run dev          # Desenvolvimento local (localhost:3000)
npm run build        # Build de produção
npm run start        # Iniciar servidor de produção
npm run lint         # ESLint
npm run db:generate  # Gerar migrations Drizzle
npm run db:migrate   # Rodar migrations
npm run db:push      # Push direto do schema (MVP)
```

## Deploy manual

```bash
vercel --prod --yes
```

O deploy é atômico: build → typecheck → deploy → alias.

## Logs

Logs disponíveis no dashboard da Vercel (Functions → Logs).

Logs da aplicação:

- `[Splitly] Postback recebido sem tracking id` — payload sem xcod
- `[Splitly] ✅ Conversão: Produto X · R$97 · approved` — venda registrada (dados PII sanitizados)
- `[Splitly] Password reset requested for email` — solicitação de reset
