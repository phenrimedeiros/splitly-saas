---
tags: [home, overview]
created: 2026-05-12
---

# Splitly Lead — Teste A/B para Tráfego Pago

**Splitly Lead** é um SaaS de split de tráfego com motor bayesiano de decisão focado em **lucro**. Permite que profissionais de marketing digital e afiliados testem múltiplas landing pages, VSLs e quizzes usando **um único link** em campanhas de Meta Ads, TikTok e YouTube, sem pulverizar orçamento.

## Proposta de valor

> "Um único link. Múltiplos destinos. Descubra qual oferta é mais lucrativa."

- Pare de criar campanhas separadas para cada variante
- Um link redireciona tráfego com pesos configuráveis
- Cookie de 30 dias garante que o mesmo usuário sempre vê a mesma variante
- Integração nativa com Hotmart, Kiwify, Eduzz, Monetizze, Braip e 5+ plataformas
- Motor bayesiano **ponderado por receita** — não só taxa de conversão, mas **R$/clique**
- Auto-redirect para a campeã (link não quebra ao declarar vencedora)
- Deduplicação de postback (refund/cancel atualiza, não duplica)
- ROAS, lucro e ticket médio por variante

## Links

- **Produção**: https://splitly-saas.vercel.app
- **GitHub**: https://github.com/phenrimedeiros/splitly-saas
- **Banco**: Neon PostgreSQL (serverless)
- **Hosting**: Vercel

## Documentação

- [[Arquitetura]] — Estrutura técnica completa
- [[Decision Engine]] — Motor bayesiano de decisão
- [[Redirect e Tracking]] — Como funciona o redirect e tracking
- [[Dashboard e UX]] — Experiência do usuário
- [[API Publica]] — Endpoints REST
- [[Pesquisa de Mercado]] — Concorrentes e posicionamento
- [[Deploy e Ambiente]] — Infra e scripts
- [[Roadmap e Evolução]] — Histórico e próximos passos
- [[Como usar - Guia completo]] — Tutorial passo a passo
- [[Guia do Usuário - Splitly]] — Manual completo do usuário final
- [[Estratégia de Aquisição]] — Plano de go-to-market por persona
- [[Afiliado Profissional]] — Persona primária
- [[Produtor Lançador]] — Persona secundária
- [[Agência de Tráfego]] — Persona terciária

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Linguagem | TypeScript |
| ORM | Drizzle ORM |
| Banco | Neon PostgreSQL |
| Auth | NextAuth.js v5 (credentials) |
| UI | Tailwind CSS v4 + shadcn/ui |
| Temas | next-themes (light/dark) |
| Notificações | sonner (toast) |
| Fontes | Inter + JetBrains Mono |
| Deploy | Vercel |
| Estatística | Monte Carlo 10k samples (Marsaglia-Tsang) |
