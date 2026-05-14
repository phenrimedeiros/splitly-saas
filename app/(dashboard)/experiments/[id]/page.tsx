import Link from "next/link"
import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { experiments, variants, events, conversions, users as usersTable } from "@/lib/db/schema"
import { eq, and, desc, count, sum, max } from "drizzle-orm"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CopyLink } from "@/components/copy-link"
import { VariantForm } from "@/components/variant-form"
import { VariantRow } from "@/components/variant-row"
import { PostbackGuide } from "@/components/postback-guide"
import { SimulatePostback } from "@/components/simulate-postback"
import { DecisionPanel } from "@/components/decision-panel"
import { ShareButton } from "@/components/share-button"
import { CostWidget } from "@/components/cost-widget"
import { VisualFlow } from "@/components/visual-flow"
import { analyzeExperiment, type VariantStats } from "@/lib/analytics"

export default async function ExperimentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()

  const [experiment] = await db
    .select()
    .from(experiments)
    .where(
      and(eq(experiments.id, id), eq(experiments.userId, session!.user!.id!))
    )
    .limit(1)

  if (!experiment) notFound()

  const variantList = await db
    .select()
    .from(variants)
    .where(eq(variants.experimentId, experiment.id))
    .orderBy(desc(variants.createdAt))

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

  const countsByVariant = Object.fromEntries(eventsCounts.map((e) => [e.variantId, e.total]))
  const convByVariant = Object.fromEntries(
    conversionCounts.map((c) => [
      c.variantId,
      { total: c.total, revenue: c.revenue },
    ])
  )

  const totalEvents = eventsCounts.reduce((s, e) => s + e.total, 0)
  const totalConversions = conversionCounts.reduce((s, c) => s + c.total, 0)
  const totalRevenue = conversionCounts.reduce(
    (s, c) => s + (typeof c.revenue === "string" ? parseFloat(c.revenue) : (c.revenue || 0)),
    0
  )
  const totalWeight = variantList.reduce((s, v) => s + v.weight, 0)
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, session!.user!.id!))
    .limit(1)

  const baseUrl = user?.customDomain
    ? `https://${user.customDomain}`
    : process.env.NEXTAUTH_URL || "http://localhost:3000"
  const link = `${baseUrl}/r/${experiment.slug}`

  const variantStats: VariantStats[] = variantList.map((v) => {
    const vConv = convByVariant[v.id]
    return {
      id: v.id,
      name: v.name,
      clicks: countsByVariant[v.id] || 0,
      sales: vConv?.total || 0,
      revenue: vConv?.revenue
        ? typeof vConv.revenue === "string"
          ? parseFloat(vConv.revenue)
          : vConv.revenue
        : 0,
      weight: v.weight,
    }
  })

  const analysis = analyzeExperiment(variantStats, experiment.costCents || 0)

  const [latestEvent] = await db
    .select({ ts: max(events.createdAt) })
    .from(events)
    .where(eq(events.experimentId, experiment.id))

  const [latestConversion] = await db
    .select({ ts: max(conversions.createdAt) })
    .from(conversions)
    .where(eq(conversions.experimentId, experiment.id))

  const lastActivity =
    latestEvent?.ts || latestConversion?.ts
      ? new Date(
          Math.max(
            latestEvent?.ts ? new Date(latestEvent.ts).getTime() : 0,
            latestConversion?.ts ? new Date(latestConversion.ts).getTime() : 0
          )
        )
      : null

  // eslint-disable-next-line react-hooks/purity -- Server Component: Date.now() is per-request deterministic
  const now = Date.now()

  function timeAgo(date: Date): string {
    const minutes = Math.floor((now - date.getTime()) / 60000)
    if (minutes < 1) return "agora"
    if (minutes === 1) return "1 minuto atrás"
    if (minutes < 60) return `${minutes} minutos atrás`
    const hours = Math.floor(minutes / 60)
    if (hours === 1) return "1 hora atrás"
    return `${hours} horas atrás`
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <svg className="size-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Voltar
      </Link>

      <Card>
        <CardHeader className="flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle className="text-xl">{experiment.name}</CardTitle>
            <CardDescription className="mt-1.5 flex items-center gap-2">
              <span>
                {totalEvents} clique{totalEvents !== 1 ? "s" : ""}
                {" · "}
                {totalConversions} venda{totalConversions !== 1 ? "s" : ""}
                {totalRevenue > 0 && ` · R$ ${totalRevenue.toFixed(2)}`}
                {experiment.costCents && experiment.costCents > 0 && totalRevenue > 0 &&
                  ` · ROAS ${(totalRevenue / ((experiment.costCents || 100) / 100)).toFixed(1)}x`
                }
              </span>
              {lastActivity && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground/70">
                  <span className="inline-block size-1.5 rounded-full bg-emerald-400" />
                  {timeAgo(lastActivity)}
                </span>
              )}
            </CardDescription>
          </div>
          <Badge
            variant={
              experiment.status === "active"
                ? "default"
                : experiment.status === "paused"
                  ? "secondary"
                  : "outline"
            }
          >
            {experiment.status === "active"
              ? "Ativo"
              : experiment.status === "paused"
                ? "Pausado"
                : "Rascunho"}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1"><CopyLink link={link} /></div>
            <a
              href={`/api/export/${experiment.id}`}
              download
              className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground/70 hover:bg-muted"
            >
              <svg className="size-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              CSV
            </a>
          </div>
          <div className="flex items-center justify-between mt-3">
            <CostWidget
              experimentId={experiment.id}
              currentCostCents={experiment.costCents || 0}
            />
            <ShareButton
              experimentId={experiment.id}
              shareEnabled={experiment.shareEnabled === "true"}
            />
          </div>
        </CardContent>
      </Card>

      {variantList.length > 0 && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
              Distribuição de tráfego e conversões
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {variantList.map((v) => {
              const vClicks = countsByVariant[v.id] || 0
              const vConv = convByVariant[v.id]
              const vSales = vConv?.total || 0
              const vRevenue = vConv?.revenue
                ? typeof vConv.revenue === "string"
                  ? parseFloat(vConv.revenue)
                  : vConv.revenue
                : 0
              const convRate = vClicks > 0 ? (vSales / vClicks) * 100 : 0

              return (
                <div key={v.id}>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-medium text-foreground">{v.name}</span>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{vClicks} cliques</span>
                      {vSales > 0 && (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          {vSales} vendas
                        </span>
                      )}
                      {vRevenue > 0 && (
                        <span className="text-foreground/80 font-medium">
                          R$ {vRevenue.toFixed(0)}
                        </span>
                      )}
                      {vClicks > 0 && (
                        <span>{convRate.toFixed(1)}% conv.</span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-1 h-3">
                    <div className="flex-1 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-muted-foreground/70"
                        style={{
                          width: `${totalEvents > 0 ? (vClicks / totalEvents) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    {totalConversions > 0 && (
                      <div className="flex-1 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{
                            width: `${(vSales / totalConversions) * 100}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="mt-1.5 text-xs text-muted-foreground/70">
                    Peso configurado: {v.weight}%
                  </div>
                </div>
              )
            })}

            <Separator />

            <div className="flex items-center gap-4 text-xs text-muted-foreground/70">
              <div className="flex items-center gap-1.5">
                <div className="size-2.5 rounded-full bg-muted-foreground/70" />
                Cliques
              </div>
              <div className="flex items-center gap-1.5">
                <div className="size-2.5 rounded-full bg-emerald-500" />
                Vendas
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
            Variantes ({variantList.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {variantList.length > 0 && (
            <div className="divide-y divide-border mb-6">
              {variantList.map((v) => {
                const vConv = convByVariant[v.id]
                return (
                  <VariantRow
                    key={v.id}
                    experimentId={experiment.id}
                    variant={v}
                    eventCount={countsByVariant[v.id] || 0}
                    saleCount={vConv?.total || 0}
                    revenue={
                      vConv?.revenue
                        ? typeof vConv.revenue === "string"
                          ? parseFloat(vConv.revenue)
                          : vConv.revenue
                        : 0
                    }
                  />
                )
              })}
            </div>
          )}

          {totalWeight > 0 && totalWeight !== 100 && (
            <div className="mb-4 rounded-lg bg-amber-50 dark:bg-amber-950 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
              A soma dos pesos é {totalWeight}%. O ideal é que some 100%.
            </div>
          )}

          <VariantForm experimentId={experiment.id} />
        </CardContent>
      </Card>

      <DecisionPanel
        analysis={analysis}
        experimentId={experiment.id}
        isWinnerDeclared={!!experiment.winnerVariantId}
      />

      <VisualFlow
        slug={experiment.slug}
        variants={variantList.map((v) => ({ id: v.id, name: v.name, weight: v.weight }))}
        totalClicks={totalEvents}
        variantClicks={countsByVariant}
      />

      <SimulatePostback experimentId={experiment.id} />
      <PostbackGuide experimentSlug={experiment.slug} baseUrl={baseUrl} />
    </div>
  )
}
