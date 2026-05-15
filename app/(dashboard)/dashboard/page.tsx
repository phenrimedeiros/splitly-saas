import Link from "next/link"
import { eq, and, desc, count, sum } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { experiments, events, conversions } from "@/lib/db/schema"
import { ToggleButton } from "@/components/toggle-button"
import { DeleteButton } from "@/components/delete-button"
import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

import { AlertsBar } from "@/components/alerts-bar"
import { OnboardingWizard } from "@/components/onboarding-wizard"
import { users as usersTable } from "@/lib/db/schema"

export default async function DashboardPage() {
  const session = await auth()

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, session!.user!.id!))
    .limit(1)

  const experimentsList = await db
    .select()
    .from(experiments)
    .where(eq(experiments.userId, session!.user!.id!))
    .orderBy(desc(experiments.createdAt))

  const experimentsWithCounts = await Promise.all(
    experimentsList.map(async (exp) => {
      const [clickResult] = await db
        .select({ total: count() })
        .from(events)
        .where(eq(events.experimentId, exp.id))

      const [saleResult] = await db
        .select({ total: count(), revenue: sum(conversions.amount) })
        .from(conversions)
        .where(
          and(
            eq(conversions.experimentId, exp.id),
            eq(conversions.status, "approved")
          )
        )

      return {
        ...exp,
        clicks: clickResult?.total ?? 0,
        sales: saleResult?.total ?? 0,
        revenue: saleResult?.revenue
          ? typeof saleResult.revenue === "string"
            ? parseFloat(saleResult.revenue)
            : saleResult.revenue
          : 0,
      }
    })
  )

  const totalClicks = experimentsWithCounts.reduce((s, e) => s + e.clicks, 0)
  const totalSales = experimentsWithCounts.reduce((s, e) => s + e.sales, 0)
  const totalRevenue = experimentsWithCounts.reduce((s, e) => s + Number(e.revenue || 0), 0)
  const activeCount = experimentsWithCounts.filter((e) => e.status === "active").length

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <AlertsBar />
      <OnboardingWizard onboardingCompleted={user?.onboardingCompleted === "true"} />
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Experimentos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie seus testes A/B de tráfego pago.
          </p>
        </div>
        <Link
          href="/dashboard/new"
          className={cn(buttonVariants(), "inline-flex")}
        >
          Novo experimento
        </Link>
      </div>

      {experimentsWithCounts.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-emerald-500/10 bg-emerald-500/3">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-emerald-400/80 uppercase tracking-wide">
                Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-emerald-400">{activeCount}</p>
              <div className="mt-2 h-1 rounded-full bg-emerald-500/10">
                <div className="h-full rounded-full bg-emerald-500/40" style={{ width: `${Math.min((activeCount / experimentsWithCounts.length) * 100, 100)}%` }} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Cliques
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{totalClicks}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Vendas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-amber-400">{totalSales}</p>
            </CardContent>
          </Card>
          <Card className="border-amber-500/10 bg-amber-500/3">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-amber-400/80 uppercase tracking-wide">
                Receita
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-amber-400">
                R$ {totalRevenue.toFixed(0)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {experimentsWithCounts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-16">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <svg className="size-6 text-muted-foreground/70" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground">Nenhum experimento ainda.</p>
            <Link
              href="/dashboard/new"
              className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "inline-flex")}
            >
              Criar primeiro experimento
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {experimentsWithCounts.map((exp) => (
            <Card key={exp.id} className="hover:shadow-lg hover:border-emerald-500/15 transition-all duration-200">
              <CardContent className="flex items-center justify-between py-4">
                <Link
                  href={`/experiments/${exp.id}`}
                  className="flex-1 min-w-0 group"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "size-2 rounded-full shrink-0",
                      exp.status === "active" ? "bg-emerald-400 animate-pulse" : "bg-border"
                    )} />
                    <div>
                      <p className="text-sm font-semibold text-foreground group-hover:underline">
                        {exp.name}
                      </p>
                      <p className="text-xs font-mono text-foreground/40">
                        /r/{exp.slug}
                      </p>
                    </div>
                  </div>
                </Link>

                <div className="flex items-center gap-5">
                  <div className="flex items-center gap-5 text-xs">
                    <span className="text-foreground/60">
                      <span className="font-semibold text-foreground/80">{exp.clicks}</span> cliques
                    </span>
                    <span className="text-foreground/60">
                      <span className="font-semibold text-amber-400">{exp.sales}</span> vendas
                    </span>
                    {Number(exp.revenue || 0) > 0 && (
                      <span className="font-semibold text-amber-400">
                        R$ {Number(exp.revenue).toFixed(0)}
                      </span>
                    )}
                  </div>

                  <Badge
                    variant={
                      exp.status === "active"
                        ? "default"
                        : exp.status === "paused"
                          ? "secondary"
                          : "outline"
                    }
                    className="text-[10px]"
                  >
                    {exp.status === "active"
                      ? "Ativo"
                      : exp.status === "paused"
                        ? "Pausado"
                        : "Rascunho"}
                  </Badge>

                  <div className="flex items-center gap-1.5">
                    <ToggleButton experimentId={exp.id} status={exp.status} />
                    <DeleteButton experimentId={exp.id} name={exp.name} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
