import Link from "next/link"
import { eq, and, desc, count, inArray } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { experiments, variants, events, conversions } from "@/lib/db/schema"
import { Badge } from "@/components/ui/badge"

export async function AlertsBar() {
  const session = await auth()
  if (!session?.user?.id) return null

  const experimentsList = await db
    .select()
    .from(experiments)
    .where(and(eq(experiments.userId, session.user.id), eq(experiments.status, "active")))
    .orderBy(desc(experiments.createdAt))

  if (experimentsList.length === 0) return null

  const experimentIds = experimentsList.map((e) => e.id)

  const variantCounts = await db
    .select({ experimentId: variants.experimentId, count: count() })
    .from(variants)
    .where(inArray(variants.experimentId, experimentIds))
    .groupBy(variants.experimentId)

  const clickCounts = await db
    .select({ experimentId: events.experimentId, count: count() })
    .from(events)
    .where(inArray(events.experimentId, experimentIds))
    .groupBy(events.experimentId)

  const saleCounts = await db
    .select({ experimentId: conversions.experimentId, count: count() })
    .from(conversions)
    .where(and(
      inArray(conversions.experimentId, experimentIds),
      eq(conversions.status, "approved")
    ))
    .groupBy(conversions.experimentId)

  const variantMap = new Map(variantCounts.map((r) => [r.experimentId, r.count]))
  const clickMap = new Map(clickCounts.map((r) => [r.experimentId, r.count]))
  const saleMap = new Map(saleCounts.map((r) => [r.experimentId, r.count]))

  // eslint-disable-next-line react-hooks/purity -- Server Component: Date.now() is per-request deterministic
  const now = Date.now()
  const alerts: { exp: (typeof experimentsList)[0]; type: "no_data" | "no_variants" | "stale" }[] = []

  for (const exp of experimentsList) {
    const variantCount = variantMap.get(exp.id) ?? 0
    const totalClicks = clickMap.get(exp.id) ?? 0
    const totalSales = saleMap.get(exp.id) ?? 0

    if (variantCount < 2) {
      alerts.push({ exp, type: "no_variants" })
    } else if (totalClicks === 0) {
      alerts.push({ exp, type: "no_data" })
    } else if (totalClicks > 0 && totalSales === 0 && new Date(exp.createdAt).getTime() < now - 172800000) {
      alerts.push({ exp, type: "stale" })
    }
  }

  if (alerts.length === 0) return null

  return (
    <div className="px-8 pt-4 max-w-5xl mx-auto space-y-2">
      {alerts.map((a) => (
        <Link
          key={a.exp.id}
          href={`/experiments/${a.exp.id}`}
          className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950 px-4 py-3 text-sm hover:bg-amber-100 transition-colors"
        >
          <Badge variant="secondary" className="shrink-0">
            {a.type === "no_variants" ? "Sem variantes" : a.type === "no_data" ? "Sem dados" : "Parado"}
          </Badge>
          <span className="text-amber-800 font-medium">{a.exp.name}</span>
          <span className="text-amber-600 text-xs ml-auto">
            {a.type === "no_variants"
              ? "Adicione variantes para começar"
              : a.type === "no_data"
                ? "Nenhum clique registrado ainda"
                : "Sem vendas nos últimos 2 dias"}
          </span>
        </Link>
      ))}
    </div>
  )
}
