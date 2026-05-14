import { NextRequest, NextResponse } from "next/server"
import { eq, and, count, sum } from "drizzle-orm"
import { db } from "@/lib/db"
import { experiments, variants, events, conversions } from "@/lib/db/schema"
import { auth } from "@/lib/auth"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const [experiment] = await db
    .select()
    .from(experiments)
    .where(and(eq(experiments.id, id), eq(experiments.userId, session.user.id)))
    .limit(1)

  if (!experiment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const variantList = await db
    .select()
    .from(variants)
    .where(eq(variants.experimentId, experiment.id))

  const eventsCounts = await db
    .select({ variantId: events.variantId, total: count() })
    .from(events)
    .where(eq(events.experimentId, experiment.id))
    .groupBy(events.variantId)

  const conversionCounts = await db
    .select({ variantId: conversions.variantId, total: count(), revenue: sum(conversions.amount) })
    .from(conversions)
    .where(and(eq(conversions.experimentId, experiment.id), eq(conversions.status, "approved")))
    .groupBy(conversions.variantId)

  const clicksBy = Object.fromEntries(eventsCounts.map((e) => [e.variantId, e.total]))
  const convBy = Object.fromEntries(
    conversionCounts.map((c) => [
      c.variantId,
      { total: c.total, revenue: c.revenue },
    ])
  )

  const now = new Date().toISOString().slice(0, 10)
  const rows = [
    [
      "Variante",
      "URL",
      "Peso (%)",
      "Cliques",
      "Vendas",
      "Receita (R$)",
      "Taxa Conv (%)",
    ],
    ...variantList.map((v) => {
      const clicks = clicksBy[v.id] || 0
      const conv = convBy[v.id]
      const sales = conv?.total || 0
      const revenue = conv?.revenue
        ? typeof conv.revenue === "string"
          ? parseFloat(conv.revenue)
          : conv.revenue
        : 0
      const convRate = clicks > 0 ? ((sales / clicks) * 100).toFixed(1) : "0.0"
      return [
        v.name,
        v.url,
        String(v.weight),
        String(clicks),
        String(sales),
        String(revenue.toFixed(2)),
        convRate,
      ]
    }),
  ]

  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n")

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${experiment.name.replace(/[^a-zA-Z0-9]/g, "_")}_${now}.csv"`,
    },
  })
}
