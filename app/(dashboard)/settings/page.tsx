"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { updateSettings, deleteAccount, generateApiKey } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CopyLink } from "@/components/copy-link"

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [generatingKey, setGeneratingKey] = useState(false)

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-8">Configurações</h1>

      <form
        className="space-y-6"
        action={async (formData) => {
          setLoading(true)
          const result = await updateSettings(formData)
          if (result?.error) {
            toast.error(result.error)
          } else {
            toast.success("Configurações salvas.")
            router.refresh()
          }
          setLoading(false)
        }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Perfil</CardTitle>
            <CardDescription>Seu nome exibido no dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">Nome</label>
              <Input name="name" type="text" placeholder="Seu nome" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">Email</label>
              <Input name="email" type="email" placeholder="seu@email.com" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Teste A/B</CardTitle>
            <CardDescription>
              Nível de confiança para declarar uma variante campeã. Padrão: 95%.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">
                Threshold de confiança (%)
              </label>
              <Input name="confidenceThreshold" type="number" min={70} max={99} defaultValue={95} />
              <p className="text-xs text-muted-foreground/70">
                Quanto maior, mais rigoroso. 95% = padrão científico. 90% = mais rápido.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Domínio próprio</CardTitle>
            <CardDescription>
              Use seu domínio nos links de redirect. Ex: links.seusite.com/r/meu-teste.
              Deixe em branco para usar o domínio padrão do Splitly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">Seu domínio</label>
              <Input name="customDomain" type="text" placeholder="links.seusite.com" />
            </div>
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950 px-4 py-3 text-xs text-blue-700 dark:text-blue-300 space-y-1.5">
              <p><strong>Como ativar:</strong></p>
              <ol className="list-decimal pl-4 space-y-0.5">
                <li>Adicione um registro <strong>CNAME</strong> no seu DNS apontando para <code className="bg-blue-100 px-1 rounded">cname.vercel-dns.com</code></li>
                <li>Após salvar, o Splitly usará automaticamente <code className="bg-blue-100 px-1 rounded">https://links.seusite.com/r/seu-slug</code></li>
                <li>A propagação DNS pode levar até 5 minutos</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Senha</CardTitle>
            <CardDescription>Altere sua senha de acesso.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">Nova senha</label>
              <Input name="newPassword" type="password" minLength={6} placeholder="Mínimo 6 caracteres" />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Salvando..." : "Salvar configurações"}
        </Button>
      </form>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>API</CardTitle>
          <CardDescription>
            Use a API para integrar o Splitly a Looker Studio, Google Sheets ou sistemas próprios.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {apiKey ? (
            <CopyLink link={apiKey} />
          ) : (
            <Button
              variant="outline"
              size="sm"
              disabled={generatingKey}
              onClick={async () => {
                setGeneratingKey(true)
                const result = await generateApiKey()
                if (result.apiKey) {
                  setApiKey(result.apiKey)
                  toast.success("Chave de API gerada.")
                }
                setGeneratingKey(false)
              }}
            >
              {generatingKey ? "Gerando..." : "Gerar chave de API"}
            </Button>
          )}
          <div className="text-xs text-muted-foreground/70 space-y-1">
            <p>Endpoints disponíveis:</p>
            <ul className="list-disc pl-4 space-y-0.5 font-mono">
              <li>GET /api/v1/experiments?api_key=...</li>
              <li>GET /api/v1/experiments/:id?api_key=...</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 pt-6 border-t border-border">
        <DeleteAccountButton />
      </div>
    </div>
  )
}

function DeleteAccountButton() {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  if (confirming) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-3">
        <p className="text-sm text-red-700 font-medium">Tem certeza?</p>
        <p className="text-xs text-red-600">
          Todos os seus experimentos, variantes, cliques e conversões serão permanentemente excluídos.
          Esta ação não pode ser desfeita.
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="destructive"
            size="sm"
            disabled={loading}
            onClick={async () => {
              setLoading(true)
              await deleteAccount()
            }}
          >
            {loading ? "Excluindo..." : "Sim, deletar minha conta"}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
            Cancelar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Button
      variant="ghost"
      className="text-red-500 hover:text-red-600 hover:bg-red-50"
      onClick={() => setConfirming(true)}
    >
      Deletar minha conta
    </Button>
  )
}
