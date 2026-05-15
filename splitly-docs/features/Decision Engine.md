---
tags: [features, analytics, bayesian]
---

# Decision Engine — Motor Bayesiano

> ← [[Splitly - Home]] | Veja também: [[Redirect e Tracking]], [[Dashboard e UX]]

O Splitly Lead usa estatística bayesiana para determinar qual variante é a melhor, com **nível de confiança configurável e ponderação por receita**.

## Como funciona

### 1. Modelagem

Cada variante é modelada como uma distribuição **Beta** para taxa de conversão:

$$Beta(\alpha, \beta) \text{ onde } \alpha = vendas + 1, \beta = (cliques - vendas) + 1$$

Para **receita esperada**, cada amostra da Beta é multiplicada pelo **ticket médio (AOV)** da variante:

$$Receita_{sample} = ConvRate_{sample} \times \frac{Receita}{Vendas}$$

### 2. Dupla comparação Monte Carlo

10.000 amostras são geradas de cada distribuição Beta usando **Marsaglia-Tsang**. Dois rankings paralelos:

| Ranking | O que compara | Quando usar |
|---------|--------------|-------------|
| **P(best) por conversão** | Qual tem a maior taxa de conversão | Sem dados de receita |
| **P(best) por receita** | Qual gera mais R$/clique | Com dados de receita (Hotmart postback) |

Quando há dados de receita, o **P(best) por receita** é o critério primário de decisão.

### 3. Métricas calculadas

| Métrica | Significado |
|---------|-------------|
| **P(best)** | Probabilidade da variante ser realmente a melhor (conversão) |
| **P(best) receita** | Probabilidade de ser a variante mais lucrativa |
| **Expected Revenue/Click** | Receita esperada por clique (R$) |
| **AOV** | Ticket médio (receita ÷ vendas) |
| **Profit** | Lucro = receita − custo proporcional |
| **Expected Loss** | Quanto se espera perder se escolher essa variante |
| **Credible Interval 90%** | Intervalo onde a taxa real está com 90% de probabilidade |
| **Revenue CI 90%** | Intervalo da receita esperada por clique |

### 4. Estados do teste

| Estado | Condição | Ação sugerida |
|--------|----------|---------------|
| `collecting_data` | < 5 cliques por variante | Aguardar mais dados |
| `in_progress` | Dados insuficientes | Continuar teste |
| `leader_detected` | P(best) > 70% | Aguardar confirmação |
| `has_losers` | P(best) < 5% | Remover perdedoras |
| `winner_found` | P(best) > 95% | Declarar campeã |
| `inconclusive` | 500+ cliques sem líder | Encerrar ou testar variações mais distintas |

### 5. Auto-redirect

Quando a campeã é declarada, o link do experimento **não quebra** — 100% do tráfego é redirecionado automaticamente para a variante vencedora.

## Arquivo

`lib/analytics.ts` — implementação completa do motor.
