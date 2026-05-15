"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { updateSettings, deleteAccount, generateApiKey } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CopyLink } from "@/components/copy-link"

function SectionIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
      {children}
    </div>
  )
}

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [generatingKey, setGeneratingKey] = useState(false)

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10">
          <svg className="size-5 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
          <p className="text-sm text-foreground/50">Gerencie sua conta e preferências.</p>
        </div>
      </div>

      <form
        className="space-y-8"
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
        {/* Perfil */}
        <Card>
          <CardHeader className="flex-row items-start gap-4 space-y-0">
            <SectionIcon>
              <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </SectionIcon>
            <div>
              <CardTitle className="text-base">Perfil</CardTitle>
              <CardDescription>Seu nome e email exibidos no dashboard.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground/70">Nome</label>
              <Input name="name" type="text" placeholder="Seu nome" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground/70">Email</label>
              <Input name="email" type="email" placeholder="seu@email.com" />
            </div>
          </CardContent>
        </Card>

        {/* Teste A/B */}
        <Card>
          <CardHeader className="flex-row items-start gap-4 space-y-0">
            <SectionIcon>
              <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </SectionIcon>
            <div>
              <CardTitle className="text-base">Teste A/B</CardTitle>
              <CardDescription>Nível de confiança estatística para declarar uma variante campeã.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5 max-w-xs">
              <label className="text-xs font-medium text-foreground/70">Threshold de confiança (%)</label>
              <Input name="confidenceThreshold" type="number" min={70} max={99} defaultValue={95} />
              <p className="text-xs text-foreground/40">
                95% = padrão científico. 90% = declara mais rápido. 99% = máxima certeza.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Domínio */}
        <Card>
          <CardHeader className="flex-row items-start gap-4 space-y-0">
            <SectionIcon>
              <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
            </SectionIcon>
            <div>
              <CardTitle className="text-base">Domínio próprio</CardTitle>
              <CardDescription>Use seu domínio nos links. Ex: links.seusite.com/r/meu-teste.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5 max-w-sm">
              <label className="text-xs font-medium text-foreground/70">Seu domínio (opcional)</label>
              <Input name="customDomain" type="text" placeholder="links.seusite.com" />
            </div>
            <div className="rounded-lg bg-emerald-500/5 ring-1 ring-emerald-500/10 px-4 py-3 text-xs text-foreground/60 space-y-1.5">
              <p className="font-medium text-emerald-400/80">Como ativar:</p>
              <ol className="list-decimal pl-4 space-y-0.5">
                <li>Crie um registro <strong>CNAME</strong> no DNS apontando para <code className="bg-emerald-500/10 px-1 rounded text-emerald-400/80">cname.vercel-dns.com</code></li>
                <li>Salve aqui e o Splitly usará automaticamente seu domínio nos links de redirect</li>
                <li>Propagação DNS: até 5 minutos</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Senha */}
        <Card>
          <CardHeader className="flex-row items-start gap-4 space-y-0">
            <SectionIcon>
              <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </SectionIcon>
            <div>
              <CardTitle className="text-base">Senha</CardTitle>
              <CardDescription>Altere sua senha de acesso. Mínimo 6 caracteres.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5 max-w-xs">
              <label className="text-xs font-medium text-foreground/70">Nova senha</label>
              <Input name="newPassword" type="password" minLength={6} placeholder="••••••••" />
            </div>
          </CardContent>
        </Card>

        <div className="sticky bottom-4 z-10">
          <Button type="submit" disabled={loading} size="lg" className="w-full shadow-lg shadow-emerald-500/20">
            {loading ? "Salvando..." : "Salvar configurações"}
          </Button>
        </div>
      </form>

      <Separator className="my-8" />

      {/* API */}
      <Card>
        <CardHeader className="flex-row items-start gap-4 space-y-0">
          <SectionIcon>
            <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
            </svg>
          </SectionIcon>
          <div>
            <CardTitle className="text-base">API</CardTitle>
            <CardDescription>Integre com Looker Studio, Google Sheets ou sistemas próprios.</CardDescription>
          </div>
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
                  toast.success("Chave de API gerada. Guarde-a em local seguro.")
                }
                setGeneratingKey(false)
              }}
            >
              {generatingKey ? "Gerando..." : "Gerar chave de API"}
            </Button>
          )}
          <div className="rounded-lg bg-muted/50 p-4 space-y-2 text-xs">
            <p className="font-medium text-foreground/70">Endpoints disponíveis:</p>
            <ul className="space-y-1.5 font-mono text-foreground/50">
              <li className="flex items-center gap-2">
                <span className="text-emerald-400/60 text-[10px] font-semibold uppercase bg-emerald-500/10 px-1.5 py-0.5 rounded">GET</span>
                /api/v1/experiments?api_key=...
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400/60 text-[10px] font-semibold uppercase bg-emerald-500/10 px-1.5 py-0.5 rounded">GET</span>
                /api/v1/experiments/:id?api_key=...
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Separator className="my-8" />
      <div className="rounded-xl border border-red-500/20 bg-red-500/3 p-6">
        <div className="flex items-start gap-4">
          <div className="flex size-8 items-center justify-center rounded-lg bg-red-500/10 text-red-400 shrink-0">
            <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-400">Zona de perigo</h3>
            <p className="text-xs text-red-400/60 mt-1 mb-4">
              Esta ação é irreversível. Todos os seus experimentos, variantes, cliques e conversões serão permanentemente excluídos.
            </p>
            <DeleteAccountButton />
          </div>
        </div>
      </div>
    </div>
  )
}

function DeleteAccountButton() {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  if (confirming) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4 space-y-3">
        <p className="text-sm text-red-400 font-medium">Tem certeza absoluta?</p>
        <p className="text-xs text-red-400/60">
          Esta ação não pode ser desfeita. Todos os dados serão perdidos para sempre.
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
      variant="outline"
      size="sm"
      className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300"
      onClick={() => setConfirming(true)}
    >
      Deletar minha conta
    </Button>
  )
}
