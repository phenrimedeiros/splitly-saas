import { NextRequest, NextResponse } from "next/server"
import { eq, and, count, sum } from "drizzle-orm"
import { db } from "@/lib/db"
import { users, experiments, variants, events, conversions } from "@/lib/db/schema"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const apiKey = request.headers.get("x-api-key") || request.nextUrl.searchParams.get("api_key") || ""

  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 401 })
  }

  const [user] = await db.select().from(users).where(eq(users.apiKey, apiKey)).limit(1)
  if (!user) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 })
  }

  const [experiment] = await db
    .select()
    .from(experiments)
    .where(and(eq(experiments.id, id), eq(experiments.userId, user.id)))
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
    .select({
      variantId: conversions.variantId,
      total: count(),
      revenue: sum(conversions.amount),
    })
    .from(conversions)
    .where(
      and(
        eq(conversions.experimentId, experiment.id),
        eq(conversions.status, "approved")
      )
    )
    .groupBy(conversions.variantId)

  const clicksBy = Object.fromEntries(eventsCounts.map((e) => [e.variantId, e.total]))
  const convBy = Object.fromEntries(
    conversionCounts.map((c) => [
      c.variantId,
      { total: c.total, revenue: c.revenue },
    ])
  )

  const cost = (experiment.costCents || 0) / 100

  return NextResponse.json({
    id: experiment.id,
    name: experiment.name,
    slug: experiment.slug,
    status: experiment.status,
    cost,
    variants: variantList.map((v) => {
      const clicks = clicksBy[v.id] || 0
      const conv = convBy[v.id]
      const sales = conv?.total || 0
      const revenue = conv?.revenue
        ? typeof conv.revenue === "string"
          ? parseFloat(conv.revenue)
          : conv.revenue
        : 0
      const roas = cost > 0 ? revenue / cost : 0
      return {
        id: v.id,
        name: v.name,
        url: v.url,
        weight: v.weight,
        clicks,
        sales,
        revenue,
        conversionRate: clicks > 0 ? (sales / clicks) * 100 : 0,
        roas: Math.round(roas * 100) / 100,
      }
    }),
  })
}
