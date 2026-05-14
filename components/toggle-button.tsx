"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { toggleExperimentStatus } from "@/lib/actions"
import { Button } from "@/components/ui/button"

export function ToggleButton({
  experimentId,
  status,
}: {
  experimentId: string
  status: string
}) {
  const router = useRouter()

  return (
    <Button
      variant={status === "active" ? "secondary" : "default"}
      size="sm"
      onClick={async () => {
        await toggleExperimentStatus(experimentId)
        toast.success(status === "active" ? "Experimento pausado." : "Experimento ativado.")
        router.refresh()
      }}
    >
      {status === "active" ? "Pausar" : "Ativar"}
    </Button>
  )
}
