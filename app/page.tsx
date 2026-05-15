import Link from "next/link"
import { auth } from "@/lib/auth"
import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  AnimatedMockup,
  AnimatedFlow,
  ScrollReveal,
} from "@/components/landing-animations"
import {
  HeroBackground,
  HeroTypewriter,
  HeroShine,
  HeroCTA,
} from "@/components/hero-effects"

export default async function LandingPage() {
  const session = await auth()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center">
            <img src="/logo.png" alt="Splitly" className="h-6 w-auto" />
          </Link>
          <nav className="flex items-center gap-3">
            {session ? (
              <Link
                href="/dashboard"
                className={cn(buttonVariants({ size: "sm" }), "inline-flex")}
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "inline-flex")}
                >
                  Entrar
                </Link>
                <Link
                  href="/register"
                  className={cn(buttonVariants({ size: "sm" }), "inline-flex")}
                >
                  Criar conta
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main>
        <section className="relative mx-auto max-w-3xl px-6 py-32 text-center overflow-hidden">
          <HeroBackground />
          <Badge variant="secondary" className="mb-6 relative z-10">
            Funciona com{" "}
            <HeroTypewriter
              phases={["Hotmart", "Kiwify", "Eduzz", "Monetizze", "Braip"]}
              className="font-semibold text-emerald-600 dark:text-emerald-400"
            />
          </Badge>
          <h1 className="relative text-5xl font-bold tracking-tight text-foreground leading-tight z-10">
            <HeroShine>
              Pare de queimar verba
            </HeroShine>
            <br />
            <span className="text-muted-foreground/70">em campanhas duplicadas.</span>
          </h1>
          <p className="relative z-10 mt-6 text-lg leading-relaxed text-muted-foreground max-w-xl mx-auto">
            Um link divide seu tráfego entre quantas landing pages, VSLs ou
            quizzes você quiser. O sistema descobre qual <strong>oferta é mais lucrativa</strong> — com
            matemática, não com achismo. Em 2 minutos, sem complicação.
          </p>
          <div className="relative z-10 mt-10">
            <HeroCTA>
              <Link
                href={session ? "/dashboard" : "/register"}
                className={cn(buttonVariants({ size: "lg" }), "rounded-xl px-8 inline-flex relative z-10")}
              >
                {session ? "Ir para Dashboard" : "Quero descobrir minha oferta campeã — é grátis"}
              </Link>
            </HeroCTA>
          </div>
          <p className="relative z-10 mt-4 text-xs text-muted-foreground/50">
            Sem cartão de crédito. Crie sua conta em 30 segundos.
          </p>
        </section>

        <section className="border-t border-border bg-muted/30 py-24">
          <div className="mx-auto max-w-5xl px-6">
            <ScrollReveal>
              <p className="text-center text-sm font-medium text-muted-foreground/70 uppercase tracking-wider mb-12">
                3 passos. 2 minutos. Zero complicação.
              </p>
            </ScrollReveal>
            <div className="grid gap-6 sm:grid-cols-3">
              <ScrollReveal>
                <div className="rounded-xl bg-background p-6 shadow-sm ring-1 ring-border">
                  <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
                    1
                  </div>
                  <h3 className="font-semibold text-foreground">Coloque suas ofertas</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    As URLs das suas landing pages, VSLs ou quizzes. Defina o peso de
                    cada uma. Copiar e colar.
                  </p>
                </div>
              </ScrollReveal>
              <ScrollReveal>
                <div className="rounded-xl bg-background p-6 shadow-sm ring-1 ring-border">
                  <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
                    2
                  </div>
                  <h3 className="font-semibold text-foreground">Um link. Todas as campanhas.</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Use o mesmo link no Meta Ads, TikTok e YouTube. O tráfego se
                    divide sozinho. Você só sobe o anúncio.
                  </p>
                </div>
              </ScrollReveal>
              <ScrollReveal>
                <div className="rounded-xl bg-background p-6 shadow-sm ring-1 ring-border">
                  <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
                    3
                  </div>
                  <h3 className="font-semibold text-foreground">O motor crava a campeã</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Cliques, vendas, receita em tempo real. Com 95% de confiança
                    estatística, o sistema mostra qual oferta traz mais lucro. Você escala.
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        <section className="border-t border-border py-24">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <ScrollReveal>
              <p className="text-sm font-medium text-muted-foreground/70 uppercase tracking-wider mb-6">
                A matemática decide qual oferta é mais lucrativa. Você escala.
              </p>
            </ScrollReveal>
            <ScrollReveal>
              <AnimatedMockup />
            </ScrollReveal>
            <ScrollReveal>
              <p className="mt-6 text-sm text-muted-foreground/70">
                Enquanto você dorme, o motor analisa os dados e calcula com precisão qual página tem mais chance de ser a vencedora. Sem achismo, sem feeling — decisão estatística de verdade.
              </p>
            </ScrollReveal>
          </div>
        </section>

        <section className="border-t border-border bg-muted/30 py-16">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <ScrollReveal>
              <p className="text-sm font-medium text-muted-foreground/70 uppercase tracking-wider mb-6">
                Seu tráfego em movimento
              </p>
            </ScrollReveal>
            <AnimatedFlow />
          </div>
        </section>

        <section className="border-t border-border bg-muted/30 py-16">
          <div className="mx-auto max-w-4xl px-6">
            <ScrollReveal>
              <div className="flex flex-wrap items-center justify-center gap-8 opacity-40">
                <span className="text-xs font-semibold text-foreground uppercase tracking-widest">Hotmart</span>
                <span className="text-xs font-semibold text-foreground uppercase tracking-widest">Kiwify</span>
                <span className="text-xs font-semibold text-foreground uppercase tracking-widest">Eduzz</span>
                <span className="text-xs font-semibold text-foreground uppercase tracking-widest">Monetizze</span>
                <span className="text-xs font-semibold text-foreground uppercase tracking-widest">Braip</span>
                <span className="text-xs font-semibold text-foreground uppercase tracking-widest">Meta Ads</span>
                <span className="text-xs font-semibold text-foreground uppercase tracking-widest">TikTok</span>
                <span className="text-xs font-semibold text-foreground uppercase tracking-widest">YouTube</span>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground/70">
        Splitly Lead — Um link. Múltiplos destinos. Descubra qual oferta é mais lucrativa.
      </footer>
    </div>
  )
}
