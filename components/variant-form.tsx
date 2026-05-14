"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { addVariant } from "@/lib/actions"
import { isValidUrl } from "@/lib/utils/url"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function VariantForm({ experimentId }: { experimentId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  if (!open) {
    return (
      <Button
        variant="outline"
        className="w-full border-dashed"
        onClick={() => setOpen(true)}
      >
        + Adicionar variante
      </Button>
    )
  }

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
        const result = await addVariant(experimentId, formData)
        if (result?.error) {
          setError(result.error)
          setLoading(false)
        } else {
          toast.success("Variante adicionada.")
          setOpen(false)
          router.refresh()
        }
      }}
      className="space-y-3 rounded-lg bg-muted/30 p-4"
    >
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground/70">Nome</label>
          <Input name="name" required placeholder='Ex: "PV Longa"' />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground/70">URL</label>
          <Input name="url" type="url" required placeholder="https://..." />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground/70">Peso (%)</label>
          <Input name="weight" type="number" required defaultValue={0} min={0} max={100} />
        </div>
      </div>

      <details className="text-xs">
        <summary className="cursor-pointer text-muted-foreground hover:text-foreground/80 py-1">
          + UTM (opcional)
        </summary>
        <div className="grid grid-cols-3 gap-2 mt-2">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">utm_source</label>
            <Input name="utm_source" placeholder="meta" className="h-7 text-xs" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">utm_medium</label>
            <Input name="utm_medium" placeholder="cpc" className="h-7 text-xs" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">utm_campaign</label>
            <Input name="utm_campaign" placeholder="teste-1" className="h-7 text-xs" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">utm_content</label>
            <Input name="utm_content" placeholder="variante-a" className="h-7 text-xs" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">utm_term</label>
            <Input name="utm_term" placeholder="" className="h-7 text-xs" />
          </div>
        </div>
      </details>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? "Salvando..." : "Adicionar"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
