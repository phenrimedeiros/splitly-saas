import Link from "next/link"
import { auth } from "@/lib/auth"
import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  AnimatedMockup,
  AnimatedFlow,
  ScrollReveal,
  AnimatedCounter,
} from "@/components/landing-animations"
import {
  HeroBackground,
  HeroTypewriter,
  HeroShine,
  HeroCTA,
  GridPattern,
  GradientOrb,
} from "@/components/hero-effects"
import { MarqueeIntegrations } from "@/components/landing-animations"

export default async function LandingPage() {
  const session = await auth()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Splitly" className="h-5 w-auto dark:hidden" />
            <img src="/logo-white.png" alt="Splitly" className="h-5 w-auto hidden dark:block" />
            <span className="text-xs font-semibold text-muted-foreground/60 tracking-wide uppercase">Lead</span>
          </Link>
          <nav className="flex items-center gap-2">
            {session ? (
              <Link href="/dashboard" className={cn(buttonVariants({ size: "sm" }), "inline-flex")}>
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "inline-flex")}>
                  Entrar
                </Link>
                <Link href="/register" className={cn(buttonVariants({ size: "sm" }), "inline-flex")}>
                  Criar conta grátis
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main>
        {/* ───── HERO ───── */}
        <section className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden">
          <GridPattern />
          <GradientOrb className="top-0 -left-64 w-[600px] h-[600px] bg-emerald-500/15 dark:bg-emerald-500/10" />
          <GradientOrb className="bottom-0 -right-64 w-[500px] h-[500px] bg-emerald-400/10 dark:bg-emerald-400/5" />
          <HeroBackground />

          <div className="relative z-10 max-w-6xl mx-auto px-6 w-full">
          <Badge variant="secondary" className="mb-6 relative z-10 animate-fade-in">
            Integração nativa com{" "}
            <HeroTypewriter
              phases={["Hotmart", "Kiwify", "Eduzz", "Monetizze", "Braip"]}
              className="font-semibold text-emerald-600 dark:text-emerald-400"
            />
          </Badge>

          <h1 className="relative text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1] z-10">
            <HeroShine>
              Descubra qual oferta
            </HeroShine>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-amber-400">
              gera mais lucro
            </span>
            <br />
            <span className="text-muted-foreground/60">sem duplicar campanhas.</span>
          </h1>

          <p className="relative z-10 mt-8 text-lg leading-relaxed text-foreground/75 max-w-2xl mx-auto">
            Um <strong className="text-foreground">link único</strong> divide seu tráfego entre quantas
            landing pages quiser. Postback da Hotmart rastreia cada venda.
            O <strong className="text-foreground">motor bayesiano</strong> crava qual oferta
            é mais lucrativa com 95% de confiança estatística.
          </p>

          <div className="relative z-10 mt-10 flex items-center justify-center gap-4 flex-wrap">
            <HeroCTA>
              <Link
                href={session ? "/dashboard" : "/register"}
                className={cn(buttonVariants({ size: "lg" }), "rounded-xl px-10 py-6 text-base relative z-10 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-shadow")}
              >
                {session ? "Ir para Dashboard" : "Descobrir minha oferta campeã — grátis"}
              </Link>
            </HeroCTA>
          </div>
          <p className="relative z-10 mt-5 text-xs text-muted-foreground/50">
            Sem cartão de crédito. Configure em 2 minutos.
          </p>

          <ScrollReveal>
            <div className="mt-20 max-w-4xl mx-auto">
              <AnimatedMockup />
            </div>
          </ScrollReveal>
          </div>
        </section>

        {/* ───── NUMBERS ───── */}
        <section className="border-t border-border py-20">
          <div className="mx-auto max-w-5xl px-6">
            <ScrollReveal>
              <p className="text-center text-sm font-medium text-muted-foreground/70 uppercase tracking-wider mb-14">
                Por que afiliados e produtores estão trocando campanhas duplicadas pelo Splitly Lead
              </p>
            </ScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: 1, label: "Link único", sub: "para todas as campanhas" },
                { value: 0, label: "Campanhas duplicadas", sub: "bastam um experimento" },
                { value: 95, label: "% de confiança", sub: "estatística bayesiana real" },
                { value: 30, label: "dias de cookie", sub: "mesmo lead, mesma página" },
              ].map((stat) => (
                <ScrollReveal key={stat.label}>
                  <div className="space-y-2">
                    <div className="text-4xl font-bold text-foreground tracking-tight tabular-nums">
                      {stat.value === 0 ? (
                        <span className="text-amber-400">Zero</span>
                      ) : stat.value === 1 ? (
                        <span className="text-amber-400">1</span>
                      ) : (
                        <span>
                          {stat.value === 95 ? (
                            <AnimatedCounter target={95} suffix="%" duration={2000} />
                          ) : (
                            <AnimatedCounter target={stat.value} suffix={stat.value === 30 ? "d" : ""} duration={2000} />
                          )}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-foreground">{stat.label}</p>
                    <p className="text-xs text-muted-foreground/70">{stat.sub}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ───── HOW IT WORKS ───── */}
        <section className="border-t border-border bg-muted/30 py-24">
          <div className="mx-auto max-w-5xl px-6">
            <ScrollReveal>
              <p className="text-center text-sm font-medium text-muted-foreground/70 uppercase tracking-wider mb-4">
                Como funciona
              </p>
              <h2 className="text-center text-3xl font-bold text-foreground mb-4">
                Três passos. Zero complicação.
              </h2>
              <p className="text-center text-foreground/70 mb-16 max-w-lg mx-auto">
                Configure em 2 minutos e deixe o motor trabalhar enquanto você escala.
              </p>
            </ScrollReveal>

            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  step: "1",
                  title: "Conecte suas ofertas",
                  desc: "Cole as URLs das landing pages, VSLs ou quizzes. Defina o peso de cada uma. É literalmente copiar e colar.",
                  icon: (
                    <svg className="size-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                    </svg>
                  ),
                },
                {
                  step: "2",
                  title: "Um link. Todas as mídias.",
                  desc: "Use o mesmo link no Meta Ads, TikTok e YouTube. O tráfego se divide sozinho por peso. Cookie de 30 dias garante consistência.",
                  icon: (
                    <svg className="size-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                    </svg>
                  ),
                },
                {
                  step: "3",
                  title: "O motor crava a campeã",
                  desc: "Cliques, vendas, receita e lucro em tempo real. Com 95% de confiança estatística, o sistema declara qual oferta é mais lucrativa.",
                  icon: (
                    <svg className="size-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                    </svg>
                  ),
                },
              ].map((item) => (
                <ScrollReveal key={item.step}>
                  <div className="group rounded-xl bg-background p-8 shadow-sm ring-1 ring-border hover:ring-emerald-500/30 hover:shadow-md transition-all duration-300">
                    <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-300">
                      {item.icon}
                    </div>
                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                      PASSO {item.step}
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ───── LIVE FLOW ───── */}
        <section className="border-t border-border py-20">
          <div className="mx-auto max-w-5xl px-6 text-center">
            <ScrollReveal>
              <p className="text-sm font-medium text-muted-foreground/70 uppercase tracking-wider mb-4">
                Veja o tráfego em movimento
              </p>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Um link. Múltiplos destinos.
              </h2>
              <p className="text-foreground/70 mb-12">
                Cada visitante recebe um ID único de rastreio. O postback da Hotmart
                identifica exatamente qual oferta gerou a venda.
              </p>
            </ScrollReveal>
            <AnimatedFlow />
          </div>
        </section>

        {/* ───── BEFORE / AFTER ───── */}
        <section className="border-t border-border bg-muted/30 py-24">
          <div className="mx-auto max-w-5xl px-6">
            <ScrollReveal>
              <h2 className="text-center text-3xl font-bold text-foreground mb-16">
                Chega de duplicar campanhas pra testar
              </h2>
            </ScrollReveal>

            <div className="grid gap-8 md:grid-cols-2">
              <ScrollReveal>
                <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 p-8">
                  <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-4">
                    Sem Splitly
                  </p>
                  <ul className="space-y-3">
                    {[
                      "3 campanhas separadas no Meta Ads",
                      "Orçamento pulverizado entre variantes",
                      "Resultados misturados sem clareza",
                      "Sem tracking de venda por página",
                      "Decisão no achismo, não em dados",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-red-700 dark:text-red-300">
                        <svg className="size-4 shrink-0 mt-0.5 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 p-8">
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-4">
                    Com Splitly Lead
                  </p>
                  <ul className="space-y-3">
                    {[
                      "1 campanha, 1 link, orçamento unificado",
                      "Tráfego divide automaticamente por peso",
                      "Cada venda atribuída à variante certa",
                      "Receita e lucro por oferta",
                      "Campeã declarada com 95% de confiança",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-emerald-700 dark:text-emerald-300">
                        <svg className="size-4 shrink-0 mt-0.5 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ───── INTEGRATIONS ───── */}
        <section className="border-t border-border py-16 overflow-hidden">
          <div className="mx-auto max-w-5xl px-6">
            <ScrollReveal>
              <p className="text-center text-sm font-medium text-muted-foreground/70 uppercase tracking-wider mb-12">
                Funciona com as plataformas que você já usa
              </p>
            </ScrollReveal>
            <MarqueeIntegrations />
          </div>
        </section>

        {/* ───── TESTIMONIALS ───── */}
        <section className="border-t border-border py-24">
          <div className="mx-auto max-w-5xl px-6">
            <ScrollReveal>
              <p className="text-center text-sm font-medium text-muted-foreground/70 uppercase tracking-wider mb-4">
                Quem usa aprova
              </p>
              <h2 className="text-center text-3xl font-bold text-foreground mb-16">
                Chega de decidir no achismo
              </h2>
            </ScrollReveal>

            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  quote: "Eu duplicava campanha toda semana pra testar landing page. Agora é um link só. O motor já me mostrou qual PV converte mais em 3 dias.",
                  name: "Afiliado Profissional",
                  role: "Hotmart + Meta Ads",
                },
                {
                  quote: "O que mais me impressionou foi o tracking. Cada venda aparece na variante certa. Consigo ver exatamente qual página traz mais lucro, não só mais clique.",
                  name: "Produtor Lançador",
                  role: "Kiwify + YouTube",
                },
                {
                  quote: "Mostro os resultados pros meus clientes pelo link público. Transparência total. Eles amam ver que a decisão é baseada em estatística, não em feeling.",
                  name: "Agência de Tráfego",
                  role: "Eduzz + Meta Ads",
                },
              ].map((t, i) => (
                <ScrollReveal key={i}>
                  <div className="rounded-xl bg-gradient-to-br from-emerald-500/5 to-amber-500/5 p-6 ring-1 ring-border hover:ring-emerald-500/20 transition-all duration-300">
                    <div className="flex items-center gap-1 mb-4">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <svg key={s} className="size-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground/70">{t.role}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ───── FAQ ───── */}
        <section className="border-t border-border bg-muted/30 py-24">
          <div className="mx-auto max-w-2xl px-6">
            <ScrollReveal>
              <p className="text-center text-sm font-medium text-muted-foreground/70 uppercase tracking-wider mb-4">
                Dúvidas comuns
              </p>
              <h2 className="text-center text-3xl font-bold text-foreground mb-16">
                Perguntas que todo mundo faz
              </h2>
            </ScrollReveal>

            <div className="space-y-4">
              {[
                {
                  q: "Preciso instalar alguma coisa nas minhas landing pages?",
                  a: "Só colar um script de 1 linha no <head> de cada página. Isso garante que o código de rastreio chegue até o checkout da Hotmart. O postback você configura uma vez na Hotmart, em 30 segundos.",
                },
                {
                  q: "Funciona com qualquer plataforma?",
                  a: "Sim. Hotmart, Kiwify, Eduzz, Monetizze, Braip, PerfectPay, Yampi, Cartpanda, Doppus e HeroSpark têm suporte nativo. Se sua plataforma tem webhook de venda, o Splitly integra.",
                },
                {
                  q: "O que significa '95% de confiança estatística'?",
                  a: "O motor bayesiano roda 10.000 simulações de Monte Carlo comparando as variantes. Quando uma atinge 95% de probabilidade de ser a melhor, é porque a matemática tem certeza — não é achismo. Você pode ajustar esse threshold nas configurações.",
                },
                {
                  q: "Meus dados de venda ficam seguros?",
                  a: "Sim. O Splitly remove automaticamente emails, telefones, endereços e documentos dos postbacks antes de armazenar. Só guardamos o que importa: valor da venda, status e qual variante gerou a conversão.",
                },
                {
                  q: "É grátis mesmo? Até quando?",
                  a: "O plano atual é gratuito. Quando lançarmos planos pagos, você será avisado com antecedência e poderá escolher se quer continuar. Quem entrar agora terá condições especiais de early adopter.",
                },
              ].map((item, i) => (
                <ScrollReveal key={i}>
                  <details className="group rounded-xl bg-background ring-1 ring-border hover:ring-emerald-500/20 transition-all duration-300">
                    <summary className="flex items-center justify-between px-6 py-4 cursor-pointer list-none">
                      <span className="text-sm font-medium text-foreground pr-4">{item.q}</span>
                      <svg className="size-4 shrink-0 text-muted-foreground group-open:rotate-45 transition-transform duration-200" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    </summary>
                    <div className="px-6 pb-4 text-sm text-muted-foreground leading-relaxed">
                      {item.a}
                    </div>
                  </details>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ───── FINAL CTA ───── */}
        <section className="relative border-t border-border bg-muted/30 py-24 overflow-hidden">
          <GradientOrb className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-emerald-500/8 dark:bg-emerald-500/5" />
          <div className="relative z-10 mx-auto max-w-2xl px-6 text-center">
            <ScrollReveal>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Pronto para descobrir sua oferta campeã?
              </h2>
              <p className="text-foreground/70 mb-10 text-lg">
                Configure em 2 minutos. Sem cartão de crédito. Resultados em tempo real.
              </p>
              <HeroCTA>
              <Link
                href={session ? "/dashboard" : "/register"}
                className={cn(buttonVariants({ size: "lg" }), "rounded-xl px-12 py-6 text-lg shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-shadow relative z-10")}
              >
                {session ? "Ir para Dashboard" : "Descobrir minha oferta campeã — grátis"}
              </Link>
              </HeroCTA>
              <div className="mt-8 flex items-center justify-center gap-6 text-xs text-muted-foreground/60">
                <span className="flex items-center gap-1.5">
                  <svg className="size-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Sem cartão de crédito
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="size-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Configuração em 2 minutos
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="size-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Hotmart, Kiwify, Eduzz...
                </span>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground/60">
        <p>Splitly Lead — Um link. Múltiplos destinos. Descubra qual oferta é mais lucrativa.</p>
      </footer>
    </div>
  )
}
