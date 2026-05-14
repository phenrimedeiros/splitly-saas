---
tags: [features, analytics, bayesian]
---

# Decision Engine — Motor Bayesiano

> ← [[Splitly - Home]] | Veja também: [[Redirect e Tracking]], [[Dashboard e UX]]

O Splitly usa estatística bayesiana para determinar qual variante é a melhor, com nível de confiança configurável.

## Como funciona

### 1. Modelagem

Cada variante é modelada como uma distribuição **Beta**:

$$Beta(\alpha, \beta) \text{ onde } \alpha = vendas + 1, \beta = (cliques - vendas) + 1$$

A distribuição Beta representa a incerteza sobre a taxa de conversão real da variante.

### 2. Monte Carlo

10.000 amostras são geradas de cada distribuição Beta usando o algoritmo **Marsaglia-Tsang** para amostragem Gamma.

### 3. Métricas calculadas

| Métrica | Significado |
|---------|-------------|
| **P(best)** | Probabilidade da variante ser realmente a melhor |
| **Expected Loss** | Quanto se espera perder em taxa de conversão se escolher essa variante e ela não for a melhor |
| **Credible Interval 90%** | Intervalo onde a taxa de conversão real está com 90% de probabilidade |
| **Conversion Rate** | Taxa de conversão observada |

### 4. Estados do teste

| Estado | Condição | Ação sugerida |
|--------|----------|---------------|
| `collecting_data` | < 5 cliques por variante | Aguardar mais dados |
| `in_progress` | Dados insuficientes | Continuar teste |
| `leader_detected` | P(best) > 70% | Aguardar confirmação |
| `has_losers` | P(best) < 5% | Remover perdedoras |
| `winner_found` | P(best) > 95% | Declarar campeã |
| `inconclusive` | 500+ cliques sem líder | Encerrar ou testar variações mais distintas |

## Arquivo

`lib/analytics.ts` — implementação completa do motor.
