---
tags: [features, api]
---

# API Pública

> ← [[Splitly - Home]] | Veja também: [[Deploy e Ambiente]], [[Redirect e Tracking]]

Disponível em `/api/v1/`. Autenticação via `api_key` (query param ou header `x-api-key`).

## Gerar chave

Acesse `/settings` → seção **API** → **Gerar chave de API**.

Formato: `spl_{32 caracteres}`

## Endpoints

### Listar experimentos

```
GET /api/v1/experiments?api_key=spl_xxx
```

**Resposta**:
```json
[
  {
    "id": "uuid",
    "name": "Teste PV vs VSL",
    "slug": "teste-pv-vsl",
    "status": "active",
    "costCents": 20000,
    "createdAt": "2026-05-12T17:29:18.354Z"
  }
]
```

### Resultados do experimento

```
GET /api/v1/experiments/:id?api_key=spl_xxx
```

**Resposta**:
```json
{
  "id": "uuid",
  "name": "Teste PV vs VSL",
  "slug": "teste-pv-vsl",
  "status": "active",
  "cost": 200,
  "variants": [
    {
      "id": "uuid",
      "name": "PV Longa",
      "url": "https://...",
      "weight": 50,
      "clicks": 145,
      "sales": 12,
      "revenue": 1164,
      "conversionRate": 8.27,
      "roas": 5.82
    }
  ]
}
```

## Integrações possíveis

- **Looker Studio** — conectar como fonte de dados
- **Google Sheets** — importar via Apps Script ou IMPORTDATA
- **CRMs próprios** — puxar métricas por variante
- **Zapier / Make** — webhook de saída (futuro)
