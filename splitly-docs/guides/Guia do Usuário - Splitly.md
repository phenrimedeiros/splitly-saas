---
tags: [guides, usuario, manual]
---

# Guia do Usuário — Splitly

> ← [[Splitly - Home]] | Veja também: [[Como usar - Guia completo]], [[Dashboard e UX]], [[Redirect e Tracking]]

---

## O que é o Splitly

O Splitly é uma ferramenta que permite testar **múltiplas landing pages, VSLs ou quizzes ao mesmo tempo** usando um único link nos seus anúncios.

**Problema que resolve**: sem o Splitly, você precisa criar uma campanha separada no Meta Ads para cada página que quer testar. Isso pulveriza o orçamento e dificulta a comparação.

**Com o Splitly**: um link divide automaticamente o tráfego entre quantas páginas você quiser, com os percentuais que você definir. O sistema registra cliques, vendas e receita de cada variação.

---

## Primeiros passos

### 1. Criar conta

Acesse [splitly.app](https://splitly.app) e clique em **Criar conta**. Preencha nome, email e senha.

### 2. Criar um experimento

No dashboard, clique em **Novo experimento**.

| Campo | O que preencher | Exemplo |
|-------|----------------|---------|
| Nome | Um nome descritivo para identificar o teste | `Teste PV Longa vs Curta` |
| Slug | Identificador do link (sem espaços, só letras e hífens) | `teste-pv` |

O link do seu experimento será: `splitly.app/r/teste-pv`

### 3. Adicionar variantes

Clique em **+ Adicionar variante** para cada página que você quer testar.

| Campo | O que preencher | Exemplo |
|-------|----------------|---------|
| Nome | Nome descritivo da variação | `PV Longa` |
| URL | Endereço completo da página | `https://meusite.com/pv-longa` |
| Peso (%) | Percentual do tráfego que vai pra essa página | `50` |

**Importante**: a soma dos pesos de todas as variantes deve ser 100%.

**Opcional**: expanda "+ UTM" para adicionar parâmetros como `utm_source=meta` e `utm_campaign=teste-1`.

### 4. Ativar

Na lista de experimentos, clique em **Ativar** no seu experimento. O status muda para verde "Ativo".

### 5. Usar nos anúncios

Copie o link gerado e cole como destino em **todas** as suas campanhas de anúncio (Meta Ads, TikTok, YouTube).

---

## Como rastrear vendas

O Splitly oferece 3 formas de rastrear qual variante gerou cada venda.

### Opção 1: Postback (recomendado para Hotmart, Kiwify, Eduzz, Monetizze)

1. Na página do experimento, clique em **1. Postback**
2. Copie a URL do postback
3. Na plataforma (ex: Hotmart), vá em Ferramentas → Notificação de vendas
4. Cole a URL e marque os eventos: **Venda aprovada**, **Reembolso**, **Cancelamento**
5. Salve

Pronto. Toda venda será automaticamente vinculada à variante correta.

### Opção 2: Script na landing page

Se você usa landing pages próprias, cole este código no `<head>` de cada página:

```html
<script src="https://splitly.app/tracker.js"></script>
```

O script automaticamente captura o código de rastreio da URL e injeta nos botões de checkout da Hotmart ou qualquer outra plataforma.

### Opção 3: Pixel universal

Funciona em **qualquer página de obrigado** (Shopify, WooCommerce, checkout próprio). Cole esta imagem:

```html
<img src="https://splitly.app/api/pixel?splitly_vid=ID&amount=97" width="1" height="1" />
```

Substitua `ID` pelo código de rastreio da sua plataforma.

---

## Entendendo os resultados

### Dashboard principal

A lista de experimentos mostra:
- **Status**: Ativo, Pausado ou Rascunho
- **Cliques**: quantas pessoas foram redirecionadas
- **Vendas**: quantas compras foram registradas

### Página do experimento

Ao entrar num experimento, você vê:

#### Cabeçalho
- Nome, slug, status
- Total de cliques, vendas, receita
- ROAS (se você adicionou o custo de anúncio)
- Link para copiar
- Botão CSV (exportar dados)

#### Fluxo visual
Diagrama interativo mostrando o caminho do tráfego:
- Nó "Tráfego" → Splitly → cada variante com seu peso
- Barras coloridas indicando a distribuição real de cliques
- Você pode arrastar os nós livremente

#### Distribuição de tráfego
Barras horizontais para cada variante:
- **Barra cinza**: cliques
- **Barra verde**: vendas
- Taxa de conversão de cada variante

#### Painel de Decisão
Motor estatístico que analisa os dados e recomenda:

| Status | Significado | O que fazer |
|--------|-------------|-------------|
| Coletando dados | Ainda não tem cliques suficientes | Aguardar |
| Em andamento | Já tem dados mas não o suficiente pra concluir | Continuar o teste |
| Líder detectado | Uma variante está na frente com 70%+ de confiança | Aguardar mais dados |
| Tem perdedoras | Alguma variante tem menos de 5% de chance | Remover perdedoras |
| Campeã encontrada | Uma variante tem 95%+ de confiança | Declarar campeã |
| Inconclusivo | 500+ cliques e nenhuma se destaca | Testar variações mais diferentes |

---

## Funcionalidades avançadas

### Adicionar custo de anúncio

Na página do experimento, clique em **Adicionar custo de anúncio** e informe quanto você gastou. O Splitly calcula o ROAS (retorno sobre investimento):

```
ROAS = receita ÷ custo
```

Ex: se você gastou R$200 e gerou R$1.455 em vendas, o ROAS é 7.2x.

### Exportar dados

Clique em **CSV** para baixar todos os dados do experimento em planilha.

### Compartilhar resultados

Clique em **Criar link público** para gerar uma página que qualquer pessoa pode ver, sem precisar de login. Ideal para agências e times.

### Modo escuro

Clique em **Modo escuro** no menu lateral para alternar entre tema claro e escuro.

### Domínio próprio

Em Configurações → Domínio próprio, você pode usar seu próprio domínio nos links (ex: `links.seusite.com/r/teste`). Basta adicionar um registro CNAME no seu DNS.

### API

Em Configurações → API, gere uma chave para acessar os dados via API REST. Útil para integrar com Looker Studio, Google Sheets ou CRMs.

---

## Perguntas frequentes

### O mesmo usuário sempre vê a mesma variante?
Sim. O Splitly usa um cookie de 30 dias. Se a mesma pessoa clicar no anúncio novamente, ela verá a mesma página que viu da primeira vez. Isso garante que o teste seja justo.

### Posso mudar os pesos durante o teste?
Sim. Edite a variante e altere o peso. A distribuição será ajustada para novos visitantes. Visitantes que já viram uma variante continuarão vendo a mesma (cookie).

### Como sei que a campeã é confiável?
O motor bayesiano do Splitly roda 10.000 simulações Monte Carlo para calcular a probabilidade de cada variante ser a melhor. Quando atinge 95% de confiança, a chance de erro é de apenas 5%. Esse é o padrão científico adotado em testes A/B.

### O que acontece quando declaro a campeã?
O experimento é pausado e a variante vencedora fica registrada. Você pode continuar usando o link normalmente — o tráfego vai para a campeã.

### Posso testar mais de 2 variantes?
Sim. Você pode adicionar quantas variantes quiser. Basta distribuir os pesos entre elas (ex: 50/30/20, 25/25/25/25, 60/40, etc).

### Funciona com checkout próprio?
Sim. Use o **Pixel universal** (opção 3). Cole a tag `<img>` na sua página de obrigado.

---

## Suporte

Dúvidas ou problemas? Entre em contato pelo email de suporte.
