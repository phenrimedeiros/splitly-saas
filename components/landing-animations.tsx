"use client"

import { useEffect, useState, useRef } from "react"

function useInView(ref: React.RefObject<HTMLElement | null>) {
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          obs.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [ref])

  return inView
}

export function AnimatedCounter({
  target,
  prefix = "",
  suffix = "",
  duration = 1500,
}: {
  target: number
  prefix?: string
  suffix?: string
  duration?: number
}) {
  const [count, setCount] = useState(target)
  const [animating, setAnimating] = useState(false)
  const ref = useRef<HTMLSpanElement>(null!)
  const inView = useInView(ref)

  useEffect(() => {
    if (!inView || animating) return
    setAnimating(true)
    setCount(0)
    let start = 0
    const step = Math.ceil(target / (duration / 16))
    const timer = setInterval(() => {
      start += step
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(start)
      }
    }, 16)
    return () => clearInterval(timer)
  }, [inView, target, duration, animating])

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  )
}

function FlowAnimation() {
  const ref = useRef<HTMLDivElement>(null!)
  const inView = useInView(ref)
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!inView) return
    const t1 = setTimeout(() => setStep(1), 300)
    const t2 = setTimeout(() => setStep(2), 800)
    const t3 = setTimeout(() => setStep(3), 1300)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [inView])

  return (
    <div ref={ref} className="flex items-center justify-center gap-2 sm:gap-4 py-8 flex-wrap text-xs sm:text-sm">
      <div
        className={`rounded-full border border-border px-3 py-1.5 bg-background transition-all duration-700 ${
          step >= 0 ? "opacity-100 scale-100" : "opacity-0 scale-75"
        }`}
      >
        Meta Ads
      </div>

      <svg className="size-4 sm:size-5 shrink-0" fill="none" viewBox="0 0 24 24">
        <path
          d="M4 12h16"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          className={`text-muted-foreground/30 transition-all duration-500 ${
            step >= 1 ? "opacity-100" : "opacity-0"
          }`}
        />
        <path
          d="M14 6l6 6-6 6"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-muted-foreground/30 transition-all duration-300 delay-150 ${
            step >= 1 ? "opacity-100" : "opacity-0"
          }`}
        />
      </svg>

      <div
        className={`rounded-xl border-2 border-primary bg-background px-4 py-2 font-bold transition-all duration-700 delay-100 ${
          step >= 1 ? "opacity-100 scale-100" : "opacity-0 scale-75"
        }`}
      >
        <span className="text-primary">Splitly</span>
        <span className="text-muted-foreground/50 text-[10px] ml-1">/r/seu-teste</span>
      </div>

      <svg className="size-4 sm:size-5 shrink-0" fill="none" viewBox="0 0 24 24">
        <path
          d="M4 12h16"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          className={`text-muted-foreground/30 transition-all duration-500 delay-300 ${
            step >= 2 ? "opacity-100" : "opacity-0"
          }`}
        />
      </svg>

      <div className="flex items-center gap-2">
        {[
          { name: "PV", w: 50, color: "#6366f1", delay: 500 },
          { name: "VSL", w: 30, color: "#8b5cf6", delay: 650 },
          { name: "Quiz", w: 20, color: "#a855f7", delay: 800 },
        ].map((v) => (
          <div
            key={v.name}
            className={`rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium transition-all duration-500 ${
              step >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
            style={{ transitionDelay: `${v.delay}ms` }}
          >
            <span className="text-foreground">{v.name}</span>
            <span className="text-muted-foreground/50 ml-1">{v.w}%</span>
            <div
              className="h-0.5 rounded-full mt-0.5"
              style={{ backgroundColor: v.color, width: `${v.w}%` }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export function AnimatedMockup() {
  const ref = useRef<HTMLDivElement>(null!)
  const inView = useInView(ref)

  return (
    <div ref={ref} className="rounded-xl border border-border overflow-hidden shadow-xl">
      <div className="bg-primary p-2 flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5">
          <div className="size-2.5 rounded-full bg-red-400" />
          <div className="size-2.5 rounded-full bg-amber-400" />
          <div className="size-2.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        <span className="text-[10px] text-primary-foreground/60 font-medium uppercase tracking-wider mr-2">
          Exemplo de resultado
        </span>
      </div>

      <div className="bg-background p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2">
          <div className="size-3 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-muted-foreground">
            {inView ? "Campeã encontrada — 96.3% de confiança" : ""}
          </span>
        </div>

        <div className="space-y-2.5">
          {[
            { name: "PV Longa", pct: 96.3, color: "bg-emerald-500", clicks: 78, sales: 9, rev: 873, roas: "8.7x" },
            { name: "VSL", pct: 2.1, color: "bg-muted-foreground/30", clicks: 42, sales: 2, rev: 194, roas: "1.9x" },
            { name: "Quiz", pct: 1.6, color: "bg-muted-foreground/20", clicks: 25, sales: 1, rev: 97, roas: "0.9x" },
          ].map((v, i) => (
            <div key={v.name}>
              <div className="flex justify-between text-sm mb-1">
                <span
                  className={
                    i === 0
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground"
                  }
                >
                  {v.name}
                                    {i === 0 && (
                    <svg className="size-3.5 text-amber-400 inline ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6.4-4.8-6.4 4.8 2.4-7.2-6-4.8h7.6z" />
                    </svg>
                  )}
                </span>
                <span
                  className={`font-mono font-bold text-xs ${
                    i === 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-muted-foreground/50"
                  }`}
                >
                  {v.pct}%
                </span>
              </div>
              <div className="h-6 rounded bg-muted overflow-hidden relative">
                <div
                  className={`h-full rounded transition-all duration-[2s] ease-out ${
                    i === 0 ? "bg-emerald-500" : v.color
                  }`}
                  style={{ width: inView ? `${v.pct}%` : "0%" }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground/60 mt-0.5">
                <span>{v.clicks} cliques</span>
                <span>{v.sales} vendas</span>
                <span>R$ {v.rev}</span>
                <span className={i === 0 ? "text-emerald-600 dark:text-emerald-400 font-semibold" : ""}>
                  ROAS {v.roas}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2">
          <div
            className={`rounded-lg bg-primary text-primary-foreground px-3 py-1 text-xs font-medium transition-all duration-500 ${
              inView ? "opacity-100 scale-100" : "opacity-0 scale-75"
            }`}
          >
            Declarar campeã
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <AnimatedCounter target={145} suffix=" cliques" />
            <AnimatedCounter target={12} suffix=" vendas" />
            <span className="font-semibold text-foreground">
              <AnimatedCounter target={1164} prefix="R$ " />
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              ROAS <AnimatedCounter target={5.8} suffix="x" duration={2000} />
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function AnimatedFlow() {
  return <FlowAnimation />
}

export function ScrollReveal({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null!)
  const inView = useInView(ref)

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      } ${className || ""}`}
    >
      {children}
    </div>
  )
}

export function MarqueeIntegrations() {
  const platforms = [
    "Hotmart", "Kiwify", "Eduzz", "Monetizze", "Braip",
    "Meta Ads", "TikTok Ads", "YouTube Ads", "Google Ads",
    "PerfectPay", "Yampi", "Cartpanda", "Doppus", "HeroSpark",
  ]

  return (
    <div className="relative overflow-hidden py-4">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className="animate-marquee flex gap-12 whitespace-nowrap w-max">
        {[...platforms, ...platforms].map((name, i) => (
          <span
            key={`${name}-${i}`}
            className="text-sm font-semibold text-muted-foreground/50 hover:text-foreground/80 transition-colors uppercase tracking-widest"
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  )
}
