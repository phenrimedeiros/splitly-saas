const MONTE_CARLO_SAMPLES = 10_000

function sampleGamma(alpha: number): number {
  if (alpha < 1) {
    const u = Math.random()
    return sampleGamma(alpha + 1) * Math.pow(u, 1 / alpha)
  }

  const d = alpha - 1 / 3
  const c = 1 / Math.sqrt(9 * d)

  for (;;) {
    let x: number
    let v: number

    for (;;) {
      x = gaussianRandom()
      v = 1 + c * x
      if (v > 0) break
    }

    v = v * v * v
    const u = Math.random()

    if (
      u < 1 - 0.0331 * x * x * x * x ||
      Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))
    ) {
      return d * v
    }
  }
}

function gaussianRandom(): number {
  let u = 0
  let v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
}

function sampleBeta(alpha: number, beta: number): number {
  const x = sampleGamma(alpha)
  const y = sampleGamma(beta)
  return x / (x + y)
}

export interface VariantStats {
  id: string
  name: string
  clicks: number
  sales: number
  revenue: number
  weight: number
}

export interface BayesianResult {
  variantId: string
  variantName: string
  probabilityOfBeingBest: number
  expectedConversionRate: number
  credibleInterval: [number, number] // 90% interval
  expectedLoss: number
  conversionRate: number
  revenue: number
  clicks: number
  sales: number
}

export interface AnalysisResult {
  variants: BayesianResult[]
  status: TestDecision
  recommendation: string
  estimatedRemainingClicks: number | null
  bestVariantId: string | null
  confidenceLevel: number | null
}

export type TestDecision =
  | "collecting_data"
  | "in_progress"
  | "leader_detected"
  | "has_losers"
  | "winner_found"
  | "inconclusive"

export function analyzeExperiment(stats: VariantStats[]): AnalysisResult {
  if (stats.length < 2) {
    return {
      variants: stats.map((s) => ({
        variantId: s.id,
        variantName: s.name,
        probabilityOfBeingBest: 1,
        expectedConversionRate: 0,
        credibleInterval: [0, 0],
        expectedLoss: 0,
        conversionRate: 0,
        revenue: s.revenue,
        clicks: s.clicks,
        sales: s.sales,
      })),
      status: "collecting_data",
      recommendation:
        "Adicione mais variantes para comparar. São necessárias pelo menos 2.",
      estimatedRemainingClicks: null,
      bestVariantId: null,
      confidenceLevel: null,
    }
  }

  const totalClicks = stats.reduce((s, v) => s + v.clicks, 0)
  const minClicksPerVariant = Math.min(...stats.map((v) => v.clicks))

  if (minClicksPerVariant < 5) {
    return {
      variants: stats.map((s) => simpleStats(s)),
      status: "collecting_data",
      recommendation: `Ainda coletando dados. Cada variante precisa de pelo menos 10 cliques para análise. Atual: ${minClicksPerVariant} no mínimo.`,
      estimatedRemainingClicks: Math.max(0, (10 - minClicksPerVariant) * stats.length),
      bestVariantId: null,
      confidenceLevel: null,
    }
  }

  const variants = stats.map((v) => {
    const alpha = v.sales + 1
    const beta = v.clicks - v.sales + 1

    const samples: number[] = []
    for (let i = 0; i < MONTE_CARLO_SAMPLES; i++) {
      samples.push(sampleBeta(alpha, beta))
    }

    samples.sort((a, b) => a - b)

    const lowerIdx = Math.floor(MONTE_CARLO_SAMPLES * 0.05)
    const upperIdx = Math.floor(MONTE_CARLO_SAMPLES * 0.95)
    const credibleInterval: [number, number] = [samples[lowerIdx], samples[upperIdx]]

    const expectedRate = samples.reduce((s, r) => s + r, 0) / MONTE_CARLO_SAMPLES
    const conversionRate = v.clicks > 0 ? v.sales / v.clicks : 0

    return {
      samples,
      alpha,
      beta,
      variantId: v.id,
      variantName: v.name,
      expectedConversionRate: expectedRate,
      credibleInterval,
      conversionRate,
      revenue: v.revenue,
      clicks: v.clicks,
      sales: v.sales,
      probabilityOfBeingBest: 0,
      expectedLoss: 0,
    }
  })

  const bestCounts = variants.map(() => 0)
  const lossSums = variants.map(() => 0)

  for (let i = 0; i < MONTE_CARLO_SAMPLES; i++) {
    let maxSample = 0
    let maxIdx = 0

    for (let j = 0; j < variants.length; j++) {
      const sample = variants[j].samples[i]
      if (sample > maxSample) {
        maxSample = sample
        maxIdx = j
      }
    }

    bestCounts[maxIdx]++

    for (let j = 0; j < variants.length; j++) {
      if (j !== maxIdx) {
        lossSums[j] += maxSample - variants[j].samples[i]
      }
    }
  }

  for (let j = 0; j < variants.length; j++) {
    variants[j].probabilityOfBeingBest = bestCounts[j] / MONTE_CARLO_SAMPLES
    variants[j].expectedLoss = lossSums[j] / MONTE_CARLO_SAMPLES
  }

  variants.sort((a, b) => b.probabilityOfBeingBest - a.probabilityOfBeingBest)

  const best = variants[0]
  let status: TestDecision = "in_progress"
  let recommendation = ""
  let bestVariantId: string | null = null
  const confidenceLevel = best.probabilityOfBeingBest

  if (best.probabilityOfBeingBest >= 0.95) {
    status = "winner_found"
    bestVariantId = best.variantId
    recommendation = `🏆 ${best.variantName} é a campeã com ${(best.probabilityOfBeingBest * 100).toFixed(1)}% de confiança estatística.`
    if (best.revenue > 0) {
      recommendation += ` Gerou R$ ${best.revenue.toFixed(2)} em vendas.`
    }
  } else if (best.probabilityOfBeingBest >= 0.70) {
    status = "leader_detected"
    recommendation = `📊 ${best.variantName} lidera com ${(best.probabilityOfBeingBest * 100).toFixed(1)}% de probabilidade de ser a melhor. Considere aguardar mais dados para confirmar.`
  } else if (totalClicks > 500 && best.probabilityOfBeingBest < 0.70) {
    status = "inconclusive"
    recommendation = "Com os dados atuais, nenhuma variante se destaca significativamente. O teste pode ser inconclusivo — considere testar hipóteses mais diferentes."
  }

  const losers = variants.filter((v) => v.probabilityOfBeingBest < 0.05 && v.variantId !== best.variantId)
  if (losers.length > 0 && status !== "winner_found") {
    status = "has_losers"
    const loserNames = losers.map((v) => v.variantName).join(", ")
    recommendation = `⚠️ ${loserNames} ${losers.length > 1 ? "têm" : "tem"} menos de 5% de chance de ser${losers.length > 1 ? "em" : ""} a${losers.length > 1 ? "s" : ""} melhor${losers.length > 1 ? "es" : ""}. Removê-la${losers.length > 1 ? "s" : ""} concentraria tráfego nas líderes.`
  }

  let estimatedRemainingClicks: number | null = null
  if (status === "in_progress" || status === "leader_detected") {
    const gapTo95 = 0.95 - best.probabilityOfBeingBest
    if (gapTo95 > 0) {
      estimatedRemainingClicks = Math.ceil(gapTo95 * 200 * variants.length)
    }
  }

  const clean: BayesianResult[] = variants.map((v) => ({
    variantId: v.variantId,
    variantName: v.variantName,
    probabilityOfBeingBest: v.probabilityOfBeingBest,
    expectedConversionRate: v.expectedConversionRate,
    credibleInterval: v.credibleInterval,
    expectedLoss: v.expectedLoss,
    conversionRate: v.conversionRate,
    revenue: v.revenue,
    clicks: v.clicks,
    sales: v.sales,
  }))

  return {
    variants: clean,
    status,
    recommendation,
    estimatedRemainingClicks,
    bestVariantId,
    confidenceLevel,
  }
}

function simpleStats(s: VariantStats): BayesianResult {
  return {
    variantId: s.id,
    variantName: s.name,
    probabilityOfBeingBest: 0,
    expectedConversionRate: 0,
    credibleInterval: [0, 0],
    expectedLoss: 0,
    conversionRate: s.clicks > 0 ? s.sales / s.clicks : 0,
    revenue: s.revenue,
    clicks: s.clicks,
    sales: s.sales,
  }
}
