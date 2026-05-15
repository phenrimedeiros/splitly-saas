---
tags: [guides, tutorial]
---

# Como usar Splitly Lead — Guia completo

> ← [[Splitly - Home]] | Veja também: [[Dashboard e UX]], [[Redirect e Tracking]], [[Decision Engine]]

## 1. Criar conta

Acesse https://splitly-saas.vercel.app/register

Preencha nome, email e senha (mínimo 6 caracteres).

## 2. Criar experimento

1. Clique em **Novo experimento**
2. Dê um nome (ex: "Teste PV vs VSL vs Quiz")
3. Defina um slug (ex: `teste-1`) — será o link: `splitly-saas.vercel.app/r/teste-1`
4. Clique em **Criar experimento**

## 3. Adicionar variantes

Dentro do experimento, clique em **+ Adicionar variante**:

| Campo | Exemplo |
|-------|---------|
| Nome | "PV Longa" |
| URL | `https://minhalanding.com` |
| Peso (%) | 50 |

Opcional: expanda **+ UTM** para adicionar `utm_source`, `utm_campaign`, etc.

Adicione pelo menos 2 variantes. A soma dos pesos deve ser 100%.

## 4. Ativar o experimento

No dashboard, clique em **Ativar** no experimento. O status muda para "Ativo".

## 5. Copiar o link

Na página do experimento, clique em **Copiar** no link de redirect.

Use esse link em **todas** as campanhas do Meta Ads, TikTok, etc.

## 6. Configurar tracking

### 6a. Instalar tracker.js nas landing pages (OBRIGATÓRIO)

**Em cada landing page**, cole no `<head>`:
```html
<script src="https://splitly-saas.vercel.app/tracker.js"></script>
```
O script captura o código de rastreio da URL e injeta automaticamente nos botões de checkout da Hotmart.

### 6b. Configurar postback na Hotmart

1. Hotmart → **Ferramentas** → **Notificação de vendas**
2. Cadastre a URL: `https://splitly-saas.vercel.app/api/postback`
3. Eventos: **Venda aprovada**, **Reembolso**, **Cancelamento**
4. Salvar

### 6c. Pixel universal (alternativa)

Se usa Shopify, WooCommerce ou checkout próprio, use o pixel de 1x1 na thank-you page (seção 3 do guia de configuração).

## 7. Preencher custo de anúncio

Clique em **Adicionar custo de anúncio** no experimento e insira o gasto total. O Splitly calcula:
- **ROAS** por variante
- **Lucro** = receita − custo proporcional ao tráfego

## 8. Acompanhar resultados

O dashboard mostra em tempo real:
- Cliques por variante
- Vendas por variante
- Receita por variante
- **Lucro/prejuízo** (R$)
- **Ticket médio** (R$)
- Taxa de conversão
- ROAS

## 9. Painel de Decisão

O motor bayesiano analisa os dados e recomenda com 95% de confiança:

- **Qual oferta é mais lucrativa** — P(best) ponderado por receita por clique
- **Remover perdedoras** — variantes com <5% de chance de ser a melhor
- **Declarar campeã** — o link passa a redirecionar 100% do tráfego pra vencedora

## 10. Compartilhar resultados

Clique em **Criar link público** para gerar uma URL que mostra os resultados sem login. Ideal para agências.

## 11. Exportar CSV

Clique em **CSV** para baixar os dados completos em planilha.
