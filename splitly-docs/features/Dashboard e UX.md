---
tags: [features, ux, dashboard]
---

# Dashboard e Experiência do Usuário

> ← [[Splitly - Home]] | Veja também: [[Decision Engine]], [[Como usar - Guia completo]]

## Páginas

| Rota | Descrição |
|------|-----------|
| `/` | Landing page com hero, 3 passos, mockup do dashboard |
| `/login` | Login com email/senha |
| `/register` | Registro |
| `/forgot-password` | Recuperação de senha |
| `/dashboard` | Lista de experimentos com stats cards |
| `/dashboard/new` | Criar experimento (validação de slug) |
| `/experiments/:id` | Detalhes + analytics + decisão + fluxo visual |
| `/settings` | Perfil, threshold, domínio, API key, senha, delete account |
| `/share/:token` | Página pública read-only |

## Funcionalidades de UX

### Fluxo Visual (React Flow)
Canvas interativo na página do experimento mostrando o diagrama de tráfego:
- Nó "Tráfego" → Nó "Splitly /r/slug" → Variantes coloridas → Checkout
- Aresta animada da origem até o Splitly
- Barras de distribuição de cliques dentro dos nós de variante
- Drag and drop para reorganizar os nós
- Zoom, pan, minimap e controles
- Responde ao tema claro/escuro

### Onboarding
Modal de 4 passos no primeiro login guiando o usuário a criar seu primeiro experimento.

### Alertas
Barra amarela no topo do dashboard quando:
- Experimento ativo sem variantes
- Experimento ativo sem cliques
- Experimento sem vendas há 2+ dias

### Dark mode
Toggle na sidebar. Persiste em `localStorage`. Respeita `prefers-color-scheme`.

### Mobile
Sidebar com hamburger menu. Overlay escuro. Transição suave.

### Loading
Skeleton animation nas páginas de dashboard e experimento durante o carregamento.

### Toasts
Notificações de sucesso/erro em todas as ações (sonner).

### Timestamp
Indicador "atualizado há X minutos" com bolinha verde no header do experimento.

## Landing Page

### Hero — Efeitos JavaScript
A hero section da landing page foi projetada com 4 efeitos nativos:

| Efeito | Descrição |
|--------|-----------|
| **Typewriter** | Badge animada: "Funciona com **Hotmart**" → "Kiwify" → "Eduzz" em loop com cursor pulsante verde |
| **Floating Shapes** | Canvas com 12 círculos translúcidos em movimento lento no background, responsivos ao dark mode |
| **Shine Sweep** | Ao passar o mouse sobre o headline principal, um brilho diagonal percorre o texto |
| **Magnetic CTA** | O botão de CTA atrai o cursor (25% de deslocamento) + glow verde (emerald) no hover |

**Arquivo**: `components/hero-effects.tsx`

### Animações de scroll
Toda a landing page usa `IntersectionObserver` para revelar conteúdo ao scroll:

| Efeito | Descrição |
|--------|-----------|
| **Animated counters** | Números (145 cliques, 12 vendas, R$1.164, ROAS 5.8x) sobem de 0 ao valor real quando entram na tela |
| **Barras crescentes** | Barras do dashboard (PV 96%, VSL 2%, Quiz 2%) crescem com easing de 2s |
| **Bolinha pulsante** | Indicador verde no mockup pulsa simulando "ao vivo" |
| **Fluxo de tráfego** | Animação sequencial em cascata: Meta Ads → Splitly → variantes aparecendo com delay |
| **Scroll reveal** | Cada seção desliza pra cima com fade-in ao entrar na tela |
| **Trust bar** | Lista de plataformas aparece com scroll |

**Arquivo**: `components/landing-animations.tsx`

### Copy da landing page
Refinada em 3 iterações com base na persona primária [[Afiliado Profissional]]:

- Headline: "Pare de queimar verba em campanhas duplicadas"
- Badge typewriter com nomes das plataformas BR
- 3 passos com verbos de ação direta
- Mockup do dashboard com métricas reais (ROAS, cliques, vendas)
- Trust bar com plataformas suportadas
- CTA com "é grátis" + "Sem cartão de crédito"
- Tom: coloquial, direto, nível 5ª série

### Acessibilidade
- Inter (sans-serif) + JetBrains Mono (monospace)
- Contraste adequado em ambos os temas
- Estados de foco visíveis
- `suppressHydrationWarning` no HTML
