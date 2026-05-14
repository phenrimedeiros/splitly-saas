---
tags: [guides, tutorial]
---

# Como usar — Guia completo

> ← [[Splitly - Home]] | Veja também: [[Dashboard e UX]], [[Redirect e Tracking]], [[Decision Engine]]

## 1. Criar conta

Acesse https://splitly.app/register

Preencha nome, email e senha (mínimo 6 caracteres).

## 2. Criar experimento

1. Clique em **Novo experimento**
2. Dê um nome (ex: "Teste PV vs VSL vs Quiz")
3. Defina um slug (ex: `teste-1`) — será o link: `splitly.app/r/teste-1`
4. Clique em **Criar experimento**

## 3. Adicionar variantes

Dentro do experimento, clique em **+ Adicionar variante**:

| Campo | Exemplo |
|-------|---------|
| Nome | "PV Longa" |
| URL | `https://pastorrhema.com` |
| Peso (%) | 50 |

Opcional: expanda **+ UTM** para adicionar `utm_source`, `utm_campaign`, etc.

Adicione pelo menos 2 variantes. A soma dos pesos deve ser 100%.

## 4. Ativar o experimento

No dashboard, clique em **Ativar** no experimento. O status muda para "Ativo".

## 5. Copiar o link

Na página do experimento, clique em **Copiar** no link de redirect.

Use esse link em **todas** as campanhas do Meta Ads, TikTok, etc.

## 6. Configurar tracking

### Se usa Hotmart (ou Kiwify, Eduzz, etc.)

1. Na página do experimento, expanda **1. Postback**
2. Copie a URL do postback
3. Na Hotmart: Ferramentas → Notificação de vendas → Cole a URL
4. Eventos: Venda aprovada, Reembolso, Cancelamento
5. Salve

### Se usa landing page própria

1. Na página do experimento, expanda **2. Script landing page**
2. Cole o `<script>` no `<head>` de cada landing page
3. O script automaticamente injeta `xcod` nos botões de checkout

### Se usa checkout próprio (Shopify, WooCommerce, etc.)

1. Na página do experimento, expanda **3. Pixel universal**
2. Cole a tag `<img>` na thank-you page
3. Substitua `ID` pela variável de tracking da plataforma

## 7. Acompanhar resultados

O dashboard mostra em tempo real:
- Cliques por variante
- Vendas por variante
- Receita por variante
- Taxa de conversão

Adicione o **custo de anúncio** para ver o ROAS.

## 8. Tomar decisão

O **Painel de Decisão** usa estatística bayesiana para recomendar:

- **Continuar teste** — precisa de mais dados
- **Remover perdedoras** — variantes com <5% de chance
- **Declarar campeã** — variante com >95% de confiança

## 9. Compartilhar

Clique em **Criar link público** para gerar uma URL que mostra os resultados sem login. Ideal para agências mostrarem resultados para clientes.

## 10. Exportar

Clique em **CSV** para baixar os dados do experimento em planilha.
