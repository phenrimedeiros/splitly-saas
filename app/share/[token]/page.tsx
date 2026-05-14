import { eq, and, count, sum } from "drizzle-orm"
import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { experiments, variants, events, conversions } from "@/lib/db/schema"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  const [experiment] = await db
    .select()
    .from(experiments)
    .where(eq(experiments.shareToken, token))
    .limit(1)

  if (!experiment || experiment.shareEnabled !== "true") notFound()

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
    conversionCounts.map((c) => [c.variantId, { total: c.total, revenue: c.revenue }])
  )

  const totalClicks = eventsCounts.reduce((s, e) => s + e.total, 0)
  const totalSales = conversionCounts.reduce((s, c) => s + c.total, 0)
  const totalRevenue = conversionCounts.reduce(
    (s, c) => s + (typeof c.revenue === "string" ? parseFloat(c.revenue) : (c.revenue || 0)),
    0
  )
  const cost = (experiment.costCents || 0) / 100
  const roas = cost > 0 ? totalRevenue / cost : 0

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <p className="text-sm text-muted-foreground/70 mb-1">Resultados do experimento</p>
          <h1 className="text-3xl font-bold text-foreground">{experiment.name}</h1>
          <p className="mt-2 text-muted-foreground">
            {totalClicks} cliques · {totalSales} vendas · R$ {totalRevenue.toFixed(2)}
            {cost > 0 && ` · ROAS ${roas.toFixed(1)}x`}
          </p>
          <p className="mt-4 text-xs text-muted-foreground/70 flex items-center justify-center gap-1.5">
            Powered by <img src="/logo.png" alt="Splitly" className="h-3.5 w-auto inline opacity-60" />
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
              Variantes ({variantList.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {variantList.map((v) => {
              const clicks = clicksBy[v.id] || 0
              const conv = convBy[v.id]
              const sales = conv?.total || 0
              const revenue = conv?.revenue
                ? typeof conv.revenue === "string" ? parseFloat(conv.revenue) : conv.revenue
                : 0
              const aov = sales > 0 ? revenue / sales : 0
              const variantCost = cost > 0 && totalClicks > 0
                ? cost * (clicks / totalClicks)
                : 0
              const variantProfit = revenue - variantCost
              const variantRoas = variantCost > 0
                ? revenue / variantCost
                : 0
              const convRate = clicks > 0 ? (sales / clicks) * 100 : 0

              const barWidth = totalClicks > 0 ? (clicks / totalClicks) * 100 : 0

              return (
                <div key={v.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{v.name}</span>
                      {variantProfit > 0 && (
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          +R$ {variantProfit.toFixed(0)}
                        </span>
                      )}
                      {variantProfit < 0 && (
                        <span className="text-xs text-red-500 font-medium">
                          R$ {variantProfit.toFixed(0)}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground/70">{v.weight}% do tráfego</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden mb-2">
                    <div
                      className="h-full rounded-full bg-muted-foreground/70"
                      style={{ width: `${Math.max(barWidth, 2)}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-5 gap-4 text-xs text-muted-foreground">
                    <div>
                      <span className="font-medium text-foreground/80">{clicks}</span> cliques
                    </div>
                    <div>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">{sales}</span> vendas
                    </div>
                    <div>
                      <span className="font-medium text-foreground/80">R$ {revenue.toFixed(0)}</span> receita
                    </div>
                    <div>
                      {variantRoas > 0 && (
                        <span className="font-medium text-foreground/80">{variantRoas.toFixed(1)}x</span>
                      )}{" "}
                      ROAS
                    </div>
                    <div>
                      {aov > 0 && (
                        <span className="font-medium text-foreground/80">R$ {aov.toFixed(0)}</span>
                      )}{" "}
                      ticket
                    </div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
