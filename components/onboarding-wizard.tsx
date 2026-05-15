"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { completeOnboarding } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface OnboardingWizardProps {
  onboardingCompleted: boolean
}

export function OnboardingWizard({ onboardingCompleted }: OnboardingWizardProps) {
  const [step, setStep] = useState(0)
  const [dismissed, setDismissed] = useState(onboardingCompleted)
  const [animating, setAnimating] = useState("")
  const router = useRouter()

  useEffect(() => {
    if (step > 0) {
      setAnimating("animate-fade-in")
      const t = setTimeout(() => setAnimating(""), 400)
      return () => clearTimeout(t)
    }
  }, [step])

  if (dismissed) return null

  const steps = [
    {
      title: "Bem-vindo ao Splitly Lead",
      description: "Teste A/B focado em lucro. Descubra qual oferta gera mais receita em 3 passos.",
      icon: (
        <svg className="size-8 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      ),
    },
    {
      title: "1. Crie um experimento",
      description: 'Dê um nome, defina um slug (ex: "teste-pv") e adicione as ofertas que quer comparar.',
      icon: (
        <svg className="size-8 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      ),
    },
    {
      title: "2. Ative e copie o link",
      description: "Ative o experimento e use o link único em todas as suas campanhas no Meta Ads, TikTok e YouTube.",
      icon: (
        <svg className="size-8 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
        </svg>
      ),
    },
    {
      title: "3. Descubra a campeã",
      description: "O motor bayesiano analisa cliques e receita com 95% de confiança e crava qual oferta é mais lucrativa.",
      icon: (
        <svg className="size-8 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6.4-4.8-6.4 4.8 2.4-7.2-6-4.8h7.6z" />
        </svg>
      ),
    },
  ]

  const current = steps[step]
  const isLast = step === steps.length - 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-sm text-center shadow-2xl ring-1 ring-emerald-500/10">
        <CardHeader>
          <div className="mb-4 flex justify-center transition-transform duration-300 hover:scale-110">
            {current.icon}
          </div>
          <CardTitle className={animating}>{current.title}</CardTitle>
          <CardDescription className={`mt-2 ${animating}`}>{current.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await completeOnboarding()
                setDismissed(true)
              }}
            >
              Pular tour
            </Button>
            <div className="flex items-center gap-1.5">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className={`size-2 rounded-full transition-all duration-300 ${
                    i === step
                      ? "bg-emerald-400 scale-125"
                      : i < step
                        ? "bg-emerald-500/30"
                        : "bg-border hover:bg-emerald-500/20"
                  }`}
                />
              ))}
            </div>
            {isLast ? (
              <Button
                size="sm"
                className="bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/25"
                onClick={async () => {
                  await completeOnboarding()
                  setDismissed(true)
                  router.push("/dashboard/new")
                }}
              >
                Criar experimento
              </Button>
            ) : (
              <Button
                size="sm"
                className="bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/25"
                onClick={() => setStep(step + 1)}
              >
                Próximo
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
