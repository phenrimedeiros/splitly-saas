"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { toggleShare } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { CopyLink } from "./copy-link"

export function ShareButton({
  experimentId,
  shareEnabled,
}: {
  experimentId: string
  shareEnabled: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [shareUrl, setShareUrl] = useState<string | null>(null)

  async function handleToggle() {
    setLoading(true)
    const result = await toggleShare(experimentId)
    if (result.error) {
      toast.error(result.error)
    } else {
      setShareUrl(result.shareUrl ?? null)
      toast.success(result.enabled ? "Link público ativado." : "Link público desativado.")
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="space-y-2">
      {shareUrl ? (
        <CopyLink link={shareUrl} />
      ) : (
        <Button
          variant={shareEnabled ? "secondary" : "outline"}
          size="sm"
          onClick={handleToggle}
          disabled={loading}
        >
          {shareEnabled
            ? loading
              ? "..."
              : "Desativar link público"
            : "Criar link público"}
        </Button>
      )}
    </div>
  )
}
