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
  revenueProbabilityOfBeingBest: number
  expectedConversionRate: number
  expectedRevenuePerClick: number
  credibleInterval: [number, number]
  revenueCredibleInterval: [number, number]
  expectedLoss: number
  conversionRate: number
  avgOrderValue: number
  revenue: number
  clicks: number
  sales: number
  profit: number
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

export function analyzeExperiment(
  stats: VariantStats[],
  totalCostCents = 0
): AnalysisResult {
  const totalCost = totalCostCents / 100
  const totalWeight = stats.reduce((s, v) => s + v.weight, 0)

  if (stats.length < 2) {
    return {
      variants: stats.map((s) => ({
        variantId: s.id,
        variantName: s.name,
        probabilityOfBeingBest: 1,
        revenueProbabilityOfBeingBest: 1,
        expectedConversionRate: 0,
        expectedRevenuePerClick: 0,
        credibleInterval: [0, 0],
        revenueCredibleInterval: [0, 0],
        expectedLoss: 0,
        conversionRate: 0,
        avgOrderValue: 0,
        revenue: s.revenue,
        clicks: s.clicks,
        sales: s.sales,
        profit: 0,
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
      variants: stats.map((s) => simpleStats(s, totalCost, totalWeight)),
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
    const revenueSamples: number[] = []
    const aov = v.sales > 0 ? v.revenue / v.sales : 0

    for (let i = 0; i < MONTE_CARLO_SAMPLES; i++) {
      const convSample = sampleBeta(alpha, beta)
      samples.push(convSample)
      revenueSamples.push(convSample * aov)
    }

    samples.sort((a, b) => a - b)
    revenueSamples.sort((a, b) => a - b)

    const lowerIdx = Math.floor(MONTE_CARLO_SAMPLES * 0.05)
    const upperIdx = Math.floor(MONTE_CARLO_SAMPLES * 0.95)
    const credibleInterval: [number, number] = [samples[lowerIdx], samples[upperIdx]]
    const revenueCredibleInterval: [number, number] = [revenueSamples[lowerIdx], revenueSamples[upperIdx]]

    const expectedRate = samples.reduce((s, r) => s + r, 0) / MONTE_CARLO_SAMPLES
    const expectedRPC = revenueSamples.reduce((s, r) => s + r, 0) / MONTE_CARLO_SAMPLES
    const conversionRate = v.clicks > 0 ? v.sales / v.clicks : 0

    const variantCost = totalWeight > 0 ? totalCost * (v.weight / totalWeight) : 0
    const profit = v.revenue - variantCost

    return {
      samples,
      revenueSamples,
      variantId: v.id,
      variantName: v.name,
      expectedConversionRate: expectedRate,
      expectedRevenuePerClick: expectedRPC,
      credibleInterval,
      revenueCredibleInterval,
      conversionRate,
      avgOrderValue: aov,
      revenue: v.revenue,
      clicks: v.clicks,
      sales: v.sales,
      profit,
      probabilityOfBeingBest: 0,
      revenueProbabilityOfBeingBest: 0,
      expectedLoss: 0,
    }
  })

  const bestCounts = variants.map(() => 0)
  const revenueBestCounts = variants.map(() => 0)
  const lossSums = variants.map(() => 0)
  const hasRevenue = stats.some((v) => v.revenue > 0)

  for (let i = 0; i < MONTE_CARLO_SAMPLES; i++) {
    let maxSample = 0
    let maxIdx = 0
    let maxRevSample = 0
    let maxRevIdx = 0

    for (let j = 0; j < variants.length; j++) {
      const sample = variants[j].samples[i]
      if (sample > maxSample) {
        maxSample = sample
        maxIdx = j
      }

      if (hasRevenue) {
        const revSample = variants[j].revenueSamples[i]
        if (revSample > maxRevSample) {
          maxRevSample = revSample
          maxRevIdx = j
        }
      }
    }

    bestCounts[maxIdx]++

    if (hasRevenue) {
      revenueBestCounts[maxRevIdx]++
    }

    for (let j = 0; j < variants.length; j++) {
      if (j !== maxIdx) {
        lossSums[j] += maxSample - variants[j].samples[i]
      }
    }
  }

  for (let j = 0; j < variants.length; j++) {
    variants[j].probabilityOfBeingBest = bestCounts[j] / MONTE_CARLO_SAMPLES
    variants[j].revenueProbabilityOfBeingBest = hasRevenue
      ? revenueBestCounts[j] / MONTE_CARLO_SAMPLES
      : variants[j].probabilityOfBeingBest
    variants[j].expectedLoss = lossSums[j] / MONTE_CARLO_SAMPLES
  }

  const primaryPbb = (v: typeof variants[0]) =>
    hasRevenue ? v.revenueProbabilityOfBeingBest : v.probabilityOfBeingBest

  variants.sort((a, b) => primaryPbb(b) - primaryPbb(a))

  const best = variants[0]
  let status: TestDecision = "in_progress"
  let recommendation = ""
  let bestVariantId: string | null = null
  const confidenceLevel = primaryPbb(best)

  if (confidenceLevel >= 0.95) {
    status = "winner_found"
    bestVariantId = best.variantId
    const metric = hasRevenue ? "receita" : "conversão"
    recommendation = `🏆 ${best.variantName} é a campeã com ${(confidenceLevel * 100).toFixed(1)}% de confiança estatística (${metric}).`
    if (best.revenue > 0) {
      recommendation += ` Gerou R$ ${best.revenue.toFixed(2)} em vendas.`
    }
    if (best.profit > 0) {
      recommendation += ` Lucro estimado: R$ ${best.profit.toFixed(2)}.`
    }
  } else if (confidenceLevel >= 0.70) {
    status = "leader_detected"
    const rpcStr = best.expectedRevenuePerClick > 0
      ? ` R$ ${best.expectedRevenuePerClick.toFixed(2)}/clique esperado.`
      : ""
    recommendation = `📊 ${best.variantName} lidera com ${(confidenceLevel * 100).toFixed(1)}% de probabilidade de ser a melhor.${rpcStr} Considere aguardar mais dados para confirmar.`
  } else if (totalClicks > 500 && confidenceLevel < 0.70) {
    status = "inconclusive"
    recommendation = "Com os dados atuais, nenhuma variante se destaca significativamente. O teste pode ser inconclusivo — considere testar hipóteses mais diferentes."
  }

  const losers = variants.filter((v) => primaryPbb(v) < 0.05 && v.variantId !== best.variantId)
  if (losers.length > 0 && status !== "winner_found") {
    status = "has_losers"
    const loserNames = losers.map((v) => v.variantName).join(", ")
    recommendation = `⚠️ ${loserNames} ${losers.length > 1 ? "têm" : "tem"} menos de 5% de chance de ser${losers.length > 1 ? "em" : ""} a${losers.length > 1 ? "s" : ""} melhor${losers.length > 1 ? "es" : ""}. Removê-la${losers.length > 1 ? "s" : ""} concentraria tráfego nas líderes.`
  }

  let estimatedRemainingClicks: number | null = null
  if (status === "in_progress" || status === "leader_detected") {
    const gapTo95 = 0.95 - confidenceLevel
    if (gapTo95 > 0) {
      estimatedRemainingClicks = Math.ceil(gapTo95 * 200 * variants.length)
    }
  }

  const clean: BayesianResult[] = variants.map((v) => ({
    variantId: v.variantId,
    variantName: v.variantName,
    probabilityOfBeingBest: v.probabilityOfBeingBest,
    revenueProbabilityOfBeingBest: v.revenueProbabilityOfBeingBest,
    expectedConversionRate: v.expectedConversionRate,
    expectedRevenuePerClick: v.expectedRevenuePerClick,
    credibleInterval: v.credibleInterval,
    revenueCredibleInterval: v.revenueCredibleInterval,
    expectedLoss: v.expectedLoss,
    conversionRate: v.conversionRate,
    avgOrderValue: v.avgOrderValue,
    revenue: v.revenue,
    clicks: v.clicks,
    sales: v.sales,
    profit: v.profit,
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

function simpleStats(s: VariantStats, totalCost: number, totalWeight: number): BayesianResult {
  const variantCost = totalWeight > 0 ? totalCost * (s.weight / totalWeight) : 0
  const aov = s.sales > 0 ? s.revenue / s.sales : 0
  return {
    variantId: s.id,
    variantName: s.name,
    probabilityOfBeingBest: 0,
    revenueProbabilityOfBeingBest: 0,
    expectedConversionRate: 0,
    expectedRevenuePerClick: 0,
    credibleInterval: [0, 0],
    revenueCredibleInterval: [0, 0],
    expectedLoss: 0,
    conversionRate: s.clicks > 0 ? s.sales / s.clicks : 0,
    avgOrderValue: aov,
    revenue: s.revenue,
    clicks: s.clicks,
    sales: s.sales,
    profit: s.revenue - variantCost,
  }
}
