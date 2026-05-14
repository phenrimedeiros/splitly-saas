"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function CopyLink({ link }: { link: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <div className="flex items-center gap-2">
      <code className="flex-1 rounded-lg bg-muted px-4 py-2 text-sm text-foreground/70 font-mono truncate">
        {link}
      </code>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => {
          navigator.clipboard.writeText(link)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        }}
      >
        {copied ? "Copiado!" : "Copiar"}
      </Button>
    </div>
  )
}
