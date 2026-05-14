"use client"

import { useState } from "react"
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
  const router = useRouter()

  if (dismissed) return null

  const steps = [
    {
      title: "Bem-vindo ao Splitly",
      description: "Teste A/B para tráfego pago em 3 passos simples.",
      icon: "👋",
    },
    {
      title: "1. Crie um experimento",
      description: 'Dê um nome, defina um slug (ex: "teste-pv") e adicione as variantes que quer testar.',
      icon: "🧪",
    },
    {
      title: "2. Ative e copie o link",
      description: "Ative o experimento e use o link único em todas as suas campanhas no Meta Ads.",
      icon: "🔗",
    },
    {
      title: "3. Descubra a campeã",
      description: "O Splitly analisa os dados com estatística bayesiana e aponta a variante vencedora.",
      icon: "🏆",
    },
  ]

  const current = steps[step]
  const isLast = step === steps.length - 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="text-4xl mb-2">{current.icon}</div>
          <CardTitle>{current.title}</CardTitle>
          <CardDescription className="mt-2">{current.description}</CardDescription>
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
              Pular
            </Button>
            <div className="flex items-center gap-1">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`size-1.5 rounded-full ${i === step ? "bg-primary" : "bg-border"}`}
                />
              ))}
            </div>
            {isLast ? (
              <Button
                size="sm"
                onClick={async () => {
                  await completeOnboarding()
                  setDismissed(true)
                  router.push("/dashboard/new")
                }}
              >
                Criar experimento
              </Button>
            ) : (
              <Button size="sm" onClick={() => setStep(step + 1)}>
                Próximo
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
