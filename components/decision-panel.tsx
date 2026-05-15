"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { declareWinner, pauseLosers } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { AnalysisResult, BayesianResult } from "@/lib/analytics"

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  awaiting_sales: { label: "Aguardando vendas", variant: "secondary" },
  collecting_data: { label: "Coletando dados", variant: "secondary" },
  in_progress: { label: "Em andamento", variant: "secondary" },
  leader_detected: { label: "Líder detectado", variant: "default" },
  has_losers: { label: "Tem perdedoras", variant: "destructive" },
  winner_found: { label: "Campeã encontrada", variant: "default" },
  inconclusive: { label: "Inconclusivo", variant: "outline" },
}

function VariantBar({ variant, maxProb, hasRevenue }: { variant: BayesianResult; maxProb: number; hasRevenue: boolean }) {
  const primaryPbb = hasRevenue ? variant.revenueProbabilityOfBeingBest : variant.probabilityOfBeingBest
  const primaryPct = primaryPbb * 100
  const isWinner = primaryPbb >= 0.95
  const isLoser = primaryPbb < 0.05

  const displayPct = primaryPct
  const displayProb = primaryPbb

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">{variant.variantName}</span>
          {isWinner && <span className="text-xs">🏆</span>}
          {isLoser && <span className="text-xs">⚠️</span>}
          {hasRevenue && variant.probabilityOfBeingBest !== variant.revenueProbabilityOfBeingBest && (
            <span className="text-[10px] text-muted-foreground/60" title="PBB por taxa de conversão">
              (conv: {(variant.probabilityOfBeingBest * 100).toFixed(0)}%)
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{variant.clicks} cliques</span>
          <span>{variant.sales} vendas</span>
          {variant.revenue > 0 && <span className="text-foreground/80 font-medium">R$ {variant.revenue.toFixed(0)}</span>}
          {variant.profit !== 0 && (
            <span className={variant.profit > 0 ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-red-500 font-medium"}>
              {variant.profit > 0 ? "+" : ""}R$ {variant.profit.toFixed(0)}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-6 rounded bg-muted overflow-hidden">
          <div
            className={`h-full rounded transition-all duration-500 ${
              isWinner ? "bg-emerald-500" : isLoser ? "bg-red-300" : "bg-muted-foreground/70"
            }`}
            style={{ width: `${Math.max((displayProb / maxProb) * 100, 2)}%` }}
          />
        </div>
        <span className={`text-sm font-mono font-bold w-16 text-right ${
          isWinner ? "text-emerald-600 dark:text-emerald-400" : isLoser ? "text-red-500" : "text-foreground/70"
        }`}>
          {displayPct.toFixed(1)}%
        </span>
      </div>
      <div className="text-xs text-muted-foreground/70 flex flex-wrap gap-x-4 gap-y-0.5">
        <span>Conv. rate: {(variant.conversionRate * 100).toFixed(1)}% · 90%: [{(variant.credibleInterval[0] * 100).toFixed(1)}% – {(variant.credibleInterval[1] * 100).toFixed(1)}%]</span>
        {variant.avgOrderValue > 0 && <span>Ticket: R$ {variant.avgOrderValue.toFixed(0)}</span>}
        {hasRevenue && variant.expectedRevenuePerClick > 0 && (
          <span>R$ {variant.expectedRevenuePerClick.toFixed(2)}/clique</span>
        )}
      </div>
    </div>
  )
}

export function DecisionPanel({
  analysis,
  experimentId,
  isWinnerDeclared,
}: {
  analysis: AnalysisResult
  experimentId: string
  isWinnerDeclared: boolean
}) {
  const router = useRouter()
  const [actionLoading, setActionLoading] = useState("")

  if (isWinnerDeclared) {
    return (
      <Card className="border-emerald-200 bg-emerald-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-800">
            🏆 Campeã declarada
          </CardTitle>
          <CardDescription>
            Este experimento já tem uma variante campeã. O tráfego está sendo redirecionado para ela.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const status = STATUS_LABELS[analysis.status] || STATUS_LABELS.in_progress
  const hasRevenue = analysis.variants.some((v) => v.revenue > 0)
  const primaryPbb = (v: BayesianResult) => hasRevenue ? v.revenueProbabilityOfBeingBest : v.probabilityOfBeingBest
  const maxProb = Math.max(...analysis.variants.map(primaryPbb), 0.01)

  return (
    <Card className={
      analysis.status === "winner_found" ? "border-emerald-200" :
      analysis.status === "has_losers" ? "border-amber-200" :
      undefined
    }>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2">
            Decisão do teste
            <Badge variant={status.variant}>{status.label}</Badge>
          </CardTitle>
          <CardDescription className="mt-1 max-w-lg">
            {analysis.recommendation}
          </CardDescription>
          {analysis.estimatedRemainingClicks != null && analysis.estimatedRemainingClicks > 0 && (
            <p className="mt-1 text-xs text-muted-foreground/70">
              Estimativa: mais ~{analysis.estimatedRemainingClicks} cliques para atingir 95% de confiança.
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {analysis.status === "winner_found" && analysis.bestVariantId && (
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={actionLoading !== ""}
              onClick={async () => {
                setActionLoading("winner")
                await declareWinner(experimentId, analysis.bestVariantId!)
                router.refresh()
              }}
            >
              {actionLoading === "winner" ? "..." : "Declarar campeã"}
            </Button>
          )}
          {analysis.status === "has_losers" && (
            <Button
              size="sm"
              variant="outline"
              disabled={actionLoading !== ""}
              onClick={async () => {
                setActionLoading("losers")
                const loserIds = analysis.variants
                  .filter((v) => v.probabilityOfBeingBest < 0.05 && v.variantId !== analysis.bestVariantId)
                  .map((v) => v.variantId)
                await pauseLosers(experimentId, loserIds)
                router.refresh()
              }}
            >
              {actionLoading === "losers" ? "..." : "Remover perdedoras"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {analysis.variants.map((v) => (
          <VariantBar key={v.variantId} variant={v} maxProb={maxProb} hasRevenue={hasRevenue} />
        ))}
      </CardContent>
    </Card>
  )
}
