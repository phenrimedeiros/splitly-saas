"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { deleteExperiment } from "@/lib/actions"
import { Button } from "@/components/ui/button"

export function DeleteButton({
  experimentId,
  name,
}: {
  experimentId: string
  name: string
}) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <Button
          variant="destructive"
          size="sm"
          onClick={async () => {
            await deleteExperiment(experimentId)
            toast.success(`"${name}" excluído.`)
            router.refresh()
          }}
        >
          Confirmar
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
          Cancelar
        </Button>
      </div>
    )
  }

  return (
    <Button variant="ghost" size="sm" onClick={() => setConfirming(true)}>
      Excluir
    </Button>
  )
}
