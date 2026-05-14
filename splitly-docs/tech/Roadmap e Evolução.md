---
tags: [tech, roadmap]
---

# Roadmap e Histórico de Evolução

> ← [[Splitly - Home]] | Veja também: [[Pesquisa de Mercado]], [[Deploy e Ambiente]]

## MVP Inicial (v0.1)

- [x] Next.js 16 + Neon PostgreSQL + Vercel
- [x] Auth (NextAuth v5, email/senha)
- [x] CRUD experimentos e variantes
- [x] Redirect com cookie-based sticky sessions
- [x] Weighted random distribution
- [x] Postback da Hotmart
- [x] Simulador de postback

## v0.2 — Tracking Completo

- [x] tracker.js para landing pages
- [x] Pixel universal (`GET /api/pixel`)
- [x] Suporte a Kiwify, Eduzz, Monetizze, Braip, PerfectPay, Yampi, Cartpanda, Doppus, HeroSpark
- [x] UTM automático nas variantes

## v0.3 — Decisão e UX

- [x] Motor bayesiano (Monte Carlo 10k samples)
- [x] DecisionPanel com P(best), credible interval
- [x] Estados: collecting_data, leader_detected, has_losers, winner_found, inconclusive
- [x] Toast notifications (sonner)
- [x] URL validation
- [x] Skeleton loading
- [x] Timestamp de última atividade
- [x] Export CSV

## v0.4 — Multi-tenant Completo

- [x] Domínio próprio por conta (CNAME)
- [x] Página de configurações (threshold, nome, email, senha)
- [x] Recuperação de senha
- [x] Onboarding wizard
- [x] Mobile responsivo (sidebar hamburger)
- [x] Alertas visuais no dashboard
- [x] Delete account
- [x] Tabelas plans/subscriptions (Stripe groundwork)

## v0.5 — Diferenciação

- [x] ROAS por variante (custo de anúncio)
- [x] API pública (`/api/v1/*`)
- [x] Link público (share page)
- [x] Dark mode
- [x] Logo + favicon + OG image
- [x] Visual Flow (React Flow — diagrama interativo do tráfego)
- [x] Documentação completa no Obsidian

## v0.6 — Design e Conversão

- [x] Inter + JetBrains Mono (fontes)
- [x] shadcn/ui components
- [x] Landing page com mockup visual
- [x] Tema clean/minimalista
- [x] Visual Flow (React Flow — diagrama interativo do tráfego)
- [x] Documentação completa no Obsidian
- [x] Copy refinada para persona Afiliado Profissional (3 iterações)
- [x] Landing page com 4 efeitos JS (typewriter, floating shapes, shine, magnetic CTA)
- [x] Animações de scroll (counters, barras, fluxo, scroll reveal)
- [x] Estratégia de aquisição + personas documentadas

## v0.6.1 — Refinamento Arquitetural (14 Mai 2026)

- [x] Renomeado projeto: `splittest-saas` → `splitly-saas` (Vercel, dir local, docs)
- [x] Guard centralizado: `lib/guards.ts` — `getOwnedExperiment()` elimina 10 blocos repetidos em `actions.ts` (-90 linhas)
- [x] PII sanitization: logs e `rawData` do postback não expõem mais email, telefone, endereço
- [x] Índices DB: `idx_variants_experiment`, `idx_events_experiment`, `idx_events_visitor`, `idx_conversions_experiment`, `idx_conversions_visitor`
- [x] Alerts-bar otimizado: N+1 queries → 4 queries fixas com `GROUP BY` + `inArray`
- [x] Lint 0 erros, TypeScript limpo, build passando
- [x] Deploy: https://splitly-saas.vercel.app

## v1.0 (Próximo)

- [ ] Stripe integração completa
- [ ] Emails transacionais (welcome, reset real)
- [ ] Limites de plano (cliques/experimentos por mês)
- [ ] Audit log
- [ ] Webhooks de saída (notificar quando achar campeã)
- [ ] Domínio customizado com SSL automático

## v2.0 (Futuro)

- [ ] Time/colaboradores (multi-user por conta)
- [ ] Regras avançadas de rotação (por país, device, idioma)
- [ ] Segmentação de audiência
- [ ] Integração nativa com Meta Ads API (ROAS automático)
- [ ] White label
- [ ] SDK JavaScript para SPAs
