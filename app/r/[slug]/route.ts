import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { eq } from "drizzle-orm"
import { v4 as uuidv4 } from "uuid"
import { db } from "@/lib/db"
import { experiments, variants, events } from "@/lib/db/schema"

type VariantRow = {
  id: string
  weight: number
}

function selectWeighted<T extends VariantRow>(variantList: T[]): T {
  const total = variantList.reduce((sum, v) => sum + v.weight, 0)
  if (total <= 0) return variantList[0]
  let r = Math.random() * total
  for (const v of variantList) {
    r -= v.weight
    if (r <= 0) return v
  }
  return variantList[variantList.length - 1]
}

const PLATFORM_PARAMS: Record<string, string> = {
  hotmart: "xcod",
  "pay.hotmart": "xcod",
  monetizze: "src",
  eduzz: "src",
  kiwify: "src",
  braip: "src",
  perfectpay: "src",
  yampi: "src",
  cartpanda: "src",
  doppus: "src",
  herospark: "src",
}

function getTrackingParam(hostname: string): string {
  for (const [domain, param] of Object.entries(PLATFORM_PARAMS)) {
    if (hostname.includes(domain)) return param
  }
  return "splitly_vid"
}

function buildFinalUrl(
  baseUrl: string,
  visitorHash: string,
  utmSource?: string | null,
  utmMedium?: string | null,
  utmCampaign?: string | null,
  utmContent?: string | null,
  utmTerm?: string | null
): string {
  try {
    const parsed = new URL(baseUrl.includes("://") ? baseUrl : `https://${baseUrl}`)
    const trackingParam = getTrackingParam(parsed.hostname)
    parsed.searchParams.set(trackingParam, visitorHash)

    if (utmSource) parsed.searchParams.set("utm_source", utmSource)
    if (utmMedium) parsed.searchParams.set("utm_medium", utmMedium)
    if (utmCampaign) parsed.searchParams.set("utm_campaign", utmCampaign)
    if (utmContent) parsed.searchParams.set("utm_content", utmContent)
    if (utmTerm) parsed.searchParams.set("utm_term", utmTerm)

    return parsed.toString()
  } catch {
    const sep = baseUrl.includes("?") ? "&" : "?"
    let url = `${baseUrl}${sep}splitly_vid=${visitorHash}`
    if (utmSource) url += `&utm_source=${encodeURIComponent(utmSource)}`
    if (utmMedium) url += `&utm_medium=${encodeURIComponent(utmMedium)}`
    if (utmCampaign) url += `&utm_campaign=${encodeURIComponent(utmCampaign)}`
    if (utmContent) url += `&utm_content=${encodeURIComponent(utmContent)}`
    if (utmTerm) url += `&utm_term=${encodeURIComponent(utmTerm)}`
    return url
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const [experiment] = await db
    .select()
    .from(experiments)
    .where(eq(experiments.slug, slug))
    .limit(1)

  if (!experiment || experiment.status !== "active") {
    return NextResponse.redirect(new URL("/", request.url))
  }

  const variantList = await db
    .select()
    .from(variants)
    .where(eq(variants.experimentId, experiment.id))

  if (variantList.length === 0) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  const cookieStore = await cookies()
  const cookieName = `ab_${slug}`
  const existing = cookieStore.get(cookieName)

  let selected = variantList[0]

  if (existing) {
    const match = variantList.find((v) => v.id === existing.value)
    selected = match || selectWeighted(variantList)
  } else {
    selected = selectWeighted(variantList)
  }

  cookieStore.set(cookieName, selected.id, {
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
    httpOnly: true,
    sameSite: "lax",
  })

  const visitorHash = uuidv4()

  await db.insert(events).values({
    experimentId: experiment.id,
    variantId: selected.id,
    visitorHash,
  })

  const finalUrl = buildFinalUrl(
    selected.url,
    visitorHash,
    selected.utmSource,
    selected.utmMedium,
    selected.utmCampaign,
    selected.utmContent,
    selected.utmTerm
  )

  return NextResponse.redirect(finalUrl)
}
