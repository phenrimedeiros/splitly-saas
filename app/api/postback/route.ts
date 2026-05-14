import { NextRequest, NextResponse } from "next/server"
import { eq, and } from "drizzle-orm"
import { db } from "@/lib/db"
import { events, variants, conversions } from "@/lib/db/schema"

export const dynamic = "force-dynamic"

function deepSearch(obj: unknown, targetKeys: string[]): string | null {
  if (!obj || typeof obj !== "object") return null

  if (Array.isArray(obj)) {
    for (const item of obj) {
      const found = deepSearch(item, targetKeys)
      if (found) return found
    }
    return null
  }

  const record = obj as Record<string, unknown>
  for (const key of targetKeys) {
    if (key in record) {
      const val = record[key]
      if (typeof val === "string" && val.length > 0) return val
      if (typeof val === "number") return String(val)
    }
  }

  for (const val of Object.values(record)) {
    const found = deepSearch(val, targetKeys)
    if (found) return found
  }

  return null
}

function sanitizePayload(obj: Record<string, unknown>): Record<string, unknown> {
  const cleaned = JSON.parse(JSON.stringify(obj))
  const paths = [
    "data.buyer",
    "data.billing",
    "buyer",
    "customer",
    "client",
    "email",
    "phone",
    "telefone",
    "document",
    "cpf",
    "cnpj",
    "address",
    "endereco",
  ]
  for (const path of paths) {
    const keys = path.split(".")
    let target: Record<string, unknown> = cleaned
    for (let i = 0; i < keys.length - 1; i++) {
      if (target && typeof target === "object") {
        target = target[keys[i]] as Record<string, unknown>
      }
    }
    const lastKey = keys[keys.length - 1]
    if (target && typeof target === "object" && lastKey in target) {
      delete (target as Record<string, unknown>)[lastKey]
    }
  }
  return cleaned
}

function getByPath(obj: Record<string, unknown>, path: string): unknown {
  return path
    .split(".")
    .reduce((acc: unknown, key) => {
      if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
        return (acc as Record<string, unknown>)[key]
      }
      return undefined
    }, obj)
}

const HOTMART_EVENTS: Record<
  string,
  "approved" | "refunded" | "cancelled" | "pending"
> = {
  PURCHASE_APPROVED: "approved",
  PURCHASE_COMPLETE: "approved",
  PURCHASE_COMMISSION: "approved",
  PURCHASE_REFUNDED: "refunded",
  PURCHASE_CHARGEBACK: "refunded",
  PURCHASE_CANCELED: "cancelled",
  PURCHASE_PROTEST: "cancelled",
  PURCHASE_BILL_PRINTED: "pending",
  PURCHASE_OVERDUE: "pending",
  SUBSCRIPTION_APPROVED: "approved",
  SUBSCRIPTION_RENEWED: "approved",
  SUBSCRIPTION_REFUNDED: "refunded",
  SUBSCRIPTION_CANCELED: "cancelled",
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>

  const contentType = request.headers.get("content-type") || ""

  if (contentType.includes("application/json")) {
    body = await request.json()
  } else if (contentType.includes("form-urlencoded")) {
    const text = await request.text()
    const searchParams = new URLSearchParams(text)
    body = Object.fromEntries(searchParams.entries())
  } else {
    const text = await request.text()
    try {
      body = JSON.parse(text)
    } catch {
      body = Object.fromEntries(new URLSearchParams(text).entries())
    }
  }

  const visitorHash = deepSearch(body, [
    "xcod",
    "splitly_vid",
    "sck",
    "src",
    "subid",
    "uid",
    "click_id",
    "external_code",
    "sckPaymentLink",
  ])

  if (!visitorHash) {
    console.log(
      `[Splitly] Postback recebido sem tracking id. Tamanho: ${JSON.stringify(body).length} bytes`
    )
    return NextResponse.json({
      status: "ignored",
      reason: "no tracking id found — send traffic through Splitly first with ?xcod= appended",
    })
  }

  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.visitorHash, visitorHash))
    .limit(1)

  if (!event) {
    console.log(
      `[Splitly] Tracking id não encontrado nos eventos: ${visitorHash.slice(0, 8)}...`
    )
    return NextResponse.json({
      status: "ignored",
      reason: "event not found for tracking id",
    })
  }

  const [variant] = await db
    .select()
    .from(variants)
    .where(eq(variants.id, event.variantId))
    .limit(1)

  const orderId =
    deepSearch(body, ["transaction"]) ||
    String(getByPath(body, "data.purchase.transaction") || "") ||
    null

  const rawPrice =
    getByPath(body, "data.purchase.price.value") ||
    getByPath(body, "data.purchase.price") ||
    getByPath(body, "data.purchase.full_price.value") ||
    getByPath(body, "data.purchase.original_offer_price.value") ||
    deepSearch(body, ["price", "amount", "valor", "value"])

  const amountStr = rawPrice ? String(rawPrice) : null

  let status: "pending" | "approved" | "refunded" | "cancelled" = "pending"

  const hotmartEvent = String(
    body.event || body.type || body.action || getByPath(body, "event") || ""
  )

  if (hotmartEvent && HOTMART_EVENTS[hotmartEvent]) {
    status = HOTMART_EVENTS[hotmartEvent]
  } else {
    const rawStatus = deepSearch(body, [
      "status",
      "transaction_status",
      "situacao",
    ])
    if (rawStatus) {
      const s = rawStatus.toLowerCase()
      if (
        s.includes("apr") ||
        s.includes("complet") ||
        s.includes("pago") ||
        s === "3"
      ) {
        status = "approved"
      } else if (
        s.includes("refund") ||
        s.includes("estorn") ||
        s.includes("chargeback")
      ) {
        status = "refunded"
      } else if (
        s.includes("cancel") ||
        s.includes("recusado") ||
        s === "7"
      ) {
        status = "cancelled"
      }
    }
  }

  const platformDetector = JSON.stringify(body).toLowerCase()
  const platform = platformDetector.includes("hotmart")
    ? "hotmart"
    : platformDetector.includes("monetizze")
      ? "monetizze"
      : platformDetector.includes("kiwify")
        ? "kiwify"
        : platformDetector.includes("eduzz")
          ? "eduzz"
          : platformDetector.includes("braip")
            ? "braip"
            : "unknown"

  const productName =
    (getByPath(body, "data.product.name") as string) ||
    deepSearch(body, ["product_name", "productName"]) ||
    variant?.name ||
    ""

  let conversion: typeof conversions.$inferSelect | undefined

  if (orderId) {
    const [existing] = await db
      .select()
      .from(conversions)
      .where(
        and(
          eq(conversions.orderId, orderId),
          eq(conversions.visitorHash, visitorHash)
        )
      )
      .limit(1)

    if (existing) {
      const [updated] = await db
        .update(conversions)
        .set({
          status,
          amount: amountStr ? String(amountStr) : existing.amount,
          rawData: sanitizePayload(body),
        })
        .where(eq(conversions.id, existing.id))
        .returning()
      conversion = updated

      console.log(
        `[Splitly] 🔄 Atualizada: ${productName || variant?.name} · R$${amountStr || "?"} · ${existing.status} → ${status}`
      )
    }
  }

  if (!conversion) {
    ;[conversion] = await db
      .insert(conversions)
      .values({
        experimentId: event.experimentId,
        variantId: event.variantId,
        visitorHash,
        orderId: orderId || undefined,
        amount: amountStr ? String(amountStr) : undefined,
        status,
        platform,
        rawData: sanitizePayload(body),
      })
      .returning()

    console.log(
      `[Splitly] ✅ Conversão: ${productName || variant?.name} · R$${amountStr || "?"} · ${status}`
    )
  }

  return NextResponse.json({ success: true, id: conversion.id })
}
