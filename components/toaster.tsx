"use client"

import { Toaster as SonnerToaster } from "sonner"

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "bg-slate-950 text-slate-50 dark:bg-background dark:text-foreground border border-border rounded-lg text-[13px]",
        },
        duration: 3000,
      }}
    />
  )
}
