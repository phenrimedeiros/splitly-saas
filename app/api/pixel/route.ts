import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { events, conversions } from "@/lib/db/schema"

export const dynamic = "force-dynamic"

const PIXEL_GIF = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
)

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const visitorHash =
    url.searchParams.get("splitly_vid") ||
    url.searchParams.get("xcod") ||
    url.searchParams.get("src") ||
    url.searchParams.get("click_id") ||
    url.searchParams.get("uid") ||
    request.cookies.get("spl_vid")?.value ||
    ""

  if (!visitorHash) {
    return new NextResponse(PIXEL_GIF, {
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control": "no-cache",
      },
    })
  }

  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.visitorHash, visitorHash))
    .limit(1)

  if (!event) {
    return new NextResponse(PIXEL_GIF, {
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control": "no-cache",
      },
    })
  }

  const amountStr =
    url.searchParams.get("amount") ||
    url.searchParams.get("valor") ||
    url.searchParams.get("value") ||
    url.searchParams.get("price")

  const orderId = url.searchParams.get("order_id") || url.searchParams.get("transaction") || null

  const rawStatus = url.searchParams.get("status") || "approved"
  let status: "pending" | "approved" | "refunded" | "cancelled" = "approved"
  if (rawStatus.toLowerCase().includes("refund") || rawStatus.toLowerCase().includes("estorn")) {
    status = "refunded"
  } else if (rawStatus.toLowerCase().includes("cancel") || rawStatus.toLowerCase().includes("recus")) {
    status = "cancelled"
  }

  await db.insert(conversions).values({
    experimentId: event.experimentId,
    variantId: event.variantId,
    visitorHash,
    orderId: orderId || undefined,
    amount: amountStr || undefined,
    status,
    platform: "pixel",
    rawData: Object.fromEntries(url.searchParams.entries()) as Record<string, unknown>,
  })

  return new NextResponse(PIXEL_GIF, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-cache",
    },
  })
}
