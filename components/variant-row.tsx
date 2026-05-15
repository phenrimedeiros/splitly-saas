"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { updateVariant, deleteVariant } from "@/lib/actions"
import { isValidUrl } from "@/lib/utils/url"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Variant = {
  id: string
  name: string
  url: string
  weight: number
}

export function VariantRow({
  experimentId,
  variant,
  eventCount,
  saleCount,
  revenue,
}: {
  experimentId: string
  variant: Variant
  eventCount: number
  saleCount: number
  revenue: number
}) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  if (editing) {
    return (
      <form
        action={async (formData) => {
          const url = formData.get("url") as string
          if (url && !isValidUrl(url)) {
            setError("URL inválida. Inclua o https://.")
            return
          }
          setLoading(true)
          setError("")
          const result = await updateVariant(experimentId, variant.id, formData)
          if (result?.error) {
            setError(result.error)
            setLoading(false)
          } else {
            toast.success("Variante atualizada.")
            setEditing(false)
            router.refresh()
          }
        }}
        className="grid grid-cols-5 gap-2 py-3 items-center"
      >
        <Input name="name" defaultValue={variant.name} required className="col-span-1" />
        <Input name="url" type="url" defaultValue={variant.url} required className="col-span-1" />
        <Input name="weight" type="number" defaultValue={variant.weight} required min={0} max={100} className="w-20" />
        <div className="flex items-center gap-1">
          <Button type="submit" size="sm" disabled={loading}>
            {loading ? "..." : "Salvar"}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>
            Cancelar
          </Button>
        </div>
        {error && <p className="col-span-5 text-xs text-red-600">{error}</p>}
      </form>
    )
  }

  return (
    <div className="flex items-center gap-4 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{variant.name}</p>
        <p className="text-xs text-muted-foreground/70 truncate">{variant.url}</p>
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
        <span title="Peso">{variant.weight}%</span>
        <span className="text-border">|</span>
        <span title="Cliques">{eventCount} clicks</span>
        {saleCount > 0 && (
          <>
            <span className="text-border">|</span>
            <span title="Vendas" className="text-amber-400 font-medium">
              {saleCount} vendas
            </span>
          </>
        )}
        {revenue > 0 && (
          <span title="Receita" className="text-amber-400 font-medium">
            R$ {revenue.toFixed(0)}
          </span>
        )}
        <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
          Editar
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={async () => {
            await deleteVariant(experimentId, variant.id)
            toast.success(`"${variant.name}" removida com sucesso.`)
            router.refresh()
          }}
        >
          Excluir
        </Button>
      </div>
    </div>
  )
}
