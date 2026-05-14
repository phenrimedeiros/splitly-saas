"use client"

import { useState } from "react"
import Link from "next/link"
import { createExperiment } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function NewExperimentPage() {
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const form = new FormData(e.currentTarget)
    const result = await createExperiment(form)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-lg mx-auto">
      <Link
        href="/dashboard"
        className="mb-6 inline-block text-sm text-muted-foreground hover:text-foreground"
      >
        &larr; Voltar
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Novo experimento</CardTitle>
          <CardDescription>
            Crie um teste A/B para dividir seu tráfego entre múltiplos destinos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-950 px-4 py-3 text-sm text-red-600 dark:text-red-300">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="name" className="text-sm font-medium text-foreground/80">
                Nome do experimento
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                placeholder='Ex: "Teste PV vs VSL vs Quiz"'
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="slug" className="text-sm font-medium text-foreground/80">
                Slug do link
              </label>
              <div className="flex items-center rounded-lg border border-border bg-background focus-within:ring-2 focus-within:ring-primary/10">
                <span className="pl-3 text-sm text-muted-foreground/70">splitly.app/r/</span>
                <input
                  id="slug"
                  name="slug"
                  type="text"
                  required
                  placeholder="meu-teste"
                  onChange={(e) => {
                    e.target.value = e.target.value
                      .toLowerCase()
                      .replace(/\s+/g, "-")
                      .replace(/[^a-z0-9-]/g, "")
                  }}
                  className="flex-1 border-0 bg-transparent px-2 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
                />
              </div>
              <p className="text-xs text-muted-foreground/70 mt-1.5">
                Use letras, números e hífens. Este será o link usado nas campanhas.
              </p>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Criando..." : "Criar experimento"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
