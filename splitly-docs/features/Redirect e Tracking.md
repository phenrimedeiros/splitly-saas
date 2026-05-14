---
tags: [features, redirect, tracking]
---

# Redirect e Tracking

> ← [[Splitly - Home]] | Veja também: [[Decision Engine]], [[API Publica]]

## Redirect (`/r/{slug}`)

### Funcionamento

1. Busca o experimento pelo slug
2. Verifica se o experimento está `active`
3. Lê o cookie `ab_{slug}`
4. Cookie existe → redireciona para a mesma variante (sticky session)
5. Cookie não existe → sorteia variante ponderada pelo `weight`
6. Gera `visitor_hash` único (UUID v4)
7. Registra evento no banco
8. Injeta parâmetros de tracking na URL
9. Redireciona (302)

### Injeção automática de tracking

| Plataforma detectada | Parâmetro injetado |
|---------------------|-------------------|
| Hotmart (`pay.hotmart.com`) | `xcod` |
| Kiwify, Eduzz, Monetizze, Braip | `src` |
| PerfectPay, Yampi, Cartpanda, Doppus, HeroSpark | `src` |
| Outros | `splitly_vid` |

### Injeção de UTM

Se configurado na variante, o redirect injeta automaticamente:
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `utm_term`

## Tracking de conversão

### Método 1: Postback (webhook)

**Endpoint**: `POST /api/postback`

Configurável na Hotmart, Kiwify, Eduzz, etc. O Splitly recebe o payload JSON e:
- Busca recursivamente por `xcod`, `src`, `sck`, `splitly_vid`
- Extrai `transaction`, `price.value`, `status`
- Mapeia eventos: `PURCHASE_APPROVED` → approved, `PURCHASE_REFUNDED` → refunded, etc.
- Registra conversão vinculada ao evento e variante

### Método 2: Pixel universal

**Endpoint**: `GET /api/pixel?splitly_vid=ID&amount=97&order_id=HP123`

Funciona em **qualquer** thank-you page. Basta colar:
```html
<img src="https://splitly.app/api/pixel?splitly_vid=ID&amount=97" width="1" height="1" />
```

Retorna um GIF transparente 1x1. Não depende de webhook.

### Método 3: tracker.js

**Endpoint**: `GET /tracker.js`

Script que o usuário cola no `<head>` da landing page:
```html
<script src="https://splitly.app/tracker.js"></script>
```

Funções:
- Lê `splitly_vid` da URL
- Encontra todos os links para `pay.hotmart.com`
- Injeta `&xcod={splitly_vid}` nos links
- Usa `MutationObserver` para links adicionados dinamicamente
