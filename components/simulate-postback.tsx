"use client"

import { useState } from "react"
import { toast } from "sonner"
import { simulateConversion } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function SimulatePostback({ experimentId }: { experimentId: string }) {
  const [loading, setLoading] = useState<"none" | "single" | "batch">("none")

  async function simulateOnce() {
    setLoading("single")
    const result = await simulateConversion(experimentId)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`1 venda simulada em "${result.variantName}". Atualize para ver o reflexo.`)
    }
    setLoading("none")
  }

  async function simulateBatch() {
    setLoading("batch")
    const result = await simulateConversion(experimentId, true)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Dados gerados em todas as variantes. Atualize para ver o painel de decisão.")
    }
    setLoading("none")
  }

  return (
    <Card className="mt-4 border-dashed">
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-sm">Testar sem venda real</CardTitle>
          <CardDescription className="mt-1 max-w-md">
            Simule cliques e vendas para testar o painel de decisão.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={simulateOnce} disabled={loading !== "none"} size="sm" variant="outline">
            {loading === "single" ? "..." : "1 venda"}
          </Button>
          <Button onClick={simulateBatch} disabled={loading !== "none"} size="sm">
            {loading === "batch" ? "Gerando..." : "Gerar dados"}
          </Button>
        </div>
      </CardHeader>
    </Card>
  )
}
