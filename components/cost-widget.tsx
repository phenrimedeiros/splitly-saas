"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { updateExperimentCost } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function CostWidget({
  experimentId,
  currentCostCents,
}: {
  experimentId: string
  currentCostCents: number
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!open) {
    const cost = currentCostCents / 100
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/70 hover:text-foreground/70 transition-colors"
        >
          <svg className="size-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {cost > 0 ? `R$ ${cost.toFixed(0)} em anúncios` : "Adicionar custo de anúncio"}
        </button>
      </div>
    )
  }

  return (
    <form
      action={async (formData) => {
        setLoading(true)
        const result = await updateExperimentCost(experimentId, formData)
        if (result?.error) {
          toast.error(result.error)
        } else {
          toast.success("Custo atualizado. ROAS calculado.")
          setOpen(false)
          router.refresh()
        }
        setLoading(false)
      }}
      className="flex items-center gap-2"
    >
      <span className="text-xs text-muted-foreground/70">R$</span>
      <Input
        name="cost"
        type="number"
        step="0.01"
        min={0}
        defaultValue={currentCostCents / 100}
        className="h-7 w-24 text-xs"
      />
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? "..." : "Salvar"}
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
        Cancelar
      </Button>
    </form>
  )
}
