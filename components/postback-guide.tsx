"use client"

import { useState } from "react"
import { CopyLink } from "./copy-link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function PostbackGuide({
  baseUrl,
}: {
  experimentSlug: string
  baseUrl: string
}) {
  const [section, setSection] = useState<"none" | "postback" | "tracker" | "pixel">("none")
  const postbackUrl = `${baseUrl}/api/postback`
  const trackerCode = `<script src="${baseUrl}/tracker.js"></script>`

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
          Configuração de conversão
        </CardTitle>
        <CardDescription>
          Configure o tracking para registrar vendas automaticamente.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            variant={section === "postback" ? "default" : "outline"}
            size="sm"
            onClick={() => setSection(section === "postback" ? "none" : "postback")}
          >
            1. Postback (Hotmart, Kiwify...)
          </Button>
          <Button
            variant={section === "tracker" ? "default" : "outline"}
            size="sm"
            onClick={() => setSection(section === "tracker" ? "none" : "tracker")}
          >
            2. Script landing page
          </Button>
          <Button
            variant={section === "pixel" ? "default" : "outline"}
            size="sm"
            onClick={() => setSection(section === "pixel" ? "none" : "pixel")}
          >
            3. Pixel universal
          </Button>
        </div>

        {section === "postback" && (
          <div className="space-y-4 text-sm text-foreground/70 border-t border-border pt-4">
            <p>
              Configure o webhook da Hotmart para notificar o Splitly sempre que
              uma venda for aprovada, reembolsada ou cancelada.
            </p>
            <ol className="list-decimal pl-4 space-y-3">
              <li>Hotmart → <strong>Ferramentas</strong> → <strong>Notificação de vendas</strong></li>
              <li>
                Cadastre a URL:
                <div className="mt-1">
                  <CopyLink link={postbackUrl} />
                </div>
              </li>
              <li>Eventos: <strong>Venda aprovada</strong>, <strong>Reembolso</strong>, <strong>Cancelamento</strong></li>
              <li>Salvar.</li>
            </ol>
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950 px-4 py-3 text-xs text-blue-700 dark:text-blue-300">
              O Splitly detecta automaticamente o <code className="bg-blue-100 px-1 rounded">xcod</code> no
              postback e associa a venda à variante correta.
            </div>
          </div>
        )}

        {section === "tracker" && (
          <div className="space-y-4 text-sm text-foreground/70 border-t border-border pt-4">
            <p>
              Cole o script abaixo <strong>uma vez</strong> em cada landing page.
              Ele captura o código de rastreio da URL e injeta nos botões de
              checkout automaticamente.
            </p>
            <div className="rounded-lg bg-foreground text-background p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground/70 font-mono">
                  Cole no &lt;head&gt; da sua landing page
                </span>
                <CopyLink link={trackerCode} />
              </div>
              <pre className="text-emerald-400 text-xs font-mono overflow-x-auto">
                {trackerCode}
              </pre>
            </div>
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950 px-4 py-3 text-xs text-emerald-700 dark:text-emerald-300">
              <strong>Pronto.</strong> O script funciona em Hotmart, Monetizze,
              Eduzz, Kiwify, Braip e checkouts próprios.
            </div>
            <div className="space-y-2 text-xs text-muted-foreground/70">
              <p><strong>Como testar:</strong></p>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Acesse sua landing page com <code className="bg-muted px-1 rounded">?splitly_vid=teste123</code></li>
                <li>Inspecione os botões — devem conter <code className="bg-muted px-1 rounded">&amp;xcod=teste123</code></li>
              </ol>
            </div>
          </div>
        )}

        {section === "pixel" && (
          <div className="space-y-4 text-sm text-foreground/70 border-t border-border pt-4">
            <p>
              O pixel de conversão funciona em <strong>qualquer página de obrigado</strong> (Hotmart, Shopify, WooCommerce, checkout próprio).
              Cole a URL como imagem na thank-you page.
            </p>
            <div className="rounded-lg bg-foreground text-background p-4">
              <pre className="text-emerald-400 text-xs font-mono overflow-x-auto">
{`<img src="${baseUrl}/api/pixel?splitly_vid=ID&amount=97" width="1" height="1" />`}
              </pre>
            </div>
            <p className="text-xs text-muted-foreground">
              Substitua <code>ID</code> pela variável de tracking da plataforma.
              Hotmart: <code>xcod</code>. Shopify: <code>order_id</code>. WooCommerce: <code>order_key</code>.
            </p>
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950 px-4 py-3 text-xs text-emerald-700 dark:text-emerald-300">
              <strong>Vantagem:</strong> funciona sem postback. Ideal para checkouts próprios ou plataformas sem webhook.
            </div>
            <div className="text-xs text-muted-foreground/70 space-y-1">
              <p><strong>Parâmetros aceitos:</strong></p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li><code>splitly_vid</code> — obrigatório</li>
                <li><code>amount</code>, <code>order_id</code>, <code>status</code> — opcionais</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
