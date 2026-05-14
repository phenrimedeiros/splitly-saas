"use server"

import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from "uuid"
import { eq, and } from "drizzle-orm"
import { redirect } from "next/navigation"
import { db } from "./db"
import { users, experiments, variants, events } from "./db/schema"
import { auth } from "./auth"
import { isValidUrl } from "./utils/url"
import { getOwnedExperiment } from "./guards"

export async function register(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string

  if (!email || !password || !name) {
    return { error: "Todos os campos são obrigatórios." }
  }

  if (password.length < 6) {
    return { error: "A senha deve ter no mínimo 6 caracteres." }
  }

  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  if (existing) {
    return { error: "Este email já está em uso." }
  }

  const passwordHash = await bcrypt.hash(password, 10)

  await db.insert(users).values({ email, passwordHash, name })

  redirect("/login?registered=true")
}

export async function createExperiment(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const name = formData.get("name") as string
  const slug = (formData.get("slug") as string).trim()

  if (!name || !slug) {
    return { error: "Nome e slug são obrigatórios." }
  }

  const cleanSlug = slug
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")

  const [existing] = await db
    .select()
    .from(experiments)
    .where(eq(experiments.slug, cleanSlug))
    .limit(1)

  if (existing) {
    return { error: "Este slug já está em uso." }
  }

  const [experiment] = await db
    .insert(experiments)
    .values({ name, slug: cleanSlug, userId: session.user.id })
    .returning()

  redirect(`/experiments/${experiment.id}`)
}

export async function toggleExperimentStatus(experimentId: string) {
  const experiment = await getOwnedExperiment(experimentId)
  if (!experiment) return { error: "Experimento não encontrado." }

  const newStatus = experiment.status === "active" ? "paused" : "active"

  await db
    .update(experiments)
    .set({ status: newStatus })
    .where(eq(experiments.id, experimentId))
}

export async function deleteExperiment(experimentId: string) {
  const experiment = await getOwnedExperiment(experimentId)
  if (!experiment) return { error: "Experimento não encontrado." }

  await db.delete(experiments).where(eq(experiments.id, experimentId))

  redirect("/dashboard")
}

export async function addVariant(experimentId: string, formData: FormData) {
  const experiment = await getOwnedExperiment(experimentId)
  if (!experiment) return { error: "Experimento não encontrado." }

  const name = formData.get("name") as string
  const url = formData.get("url") as string
  const weight = parseInt(formData.get("weight") as string) || 0

  if (!name || !url) {
    return { error: "Nome e URL são obrigatórios." }
  }

  if (!isValidUrl(url)) {
    return { error: "URL inválida. Inclua o https:// (ex: https://pagina.com)." }
  }

  const utmSource = (formData.get("utm_source") as string) || null
  const utmMedium = (formData.get("utm_medium") as string) || null
  const utmCampaign = (formData.get("utm_campaign") as string) || null
  const utmContent = (formData.get("utm_content") as string) || null
  const utmTerm = (formData.get("utm_term") as string) || null

  await db.insert(variants).values({
    experimentId, name, url, weight,
    utmSource, utmMedium, utmCampaign, utmContent, utmTerm,
  })
  return { success: true }
}

export async function updateVariant(
  experimentId: string,
  variantId: string,
  formData: FormData
) {
  const experiment = await getOwnedExperiment(experimentId)
  if (!experiment) return { error: "Experimento não encontrado." }

  const name = formData.get("name") as string
  const url = formData.get("url") as string
  const weight = parseInt(formData.get("weight") as string) || 0

  if (!name || !url) {
    return { error: "Nome e URL são obrigatórios." }
  }

  if (!isValidUrl(url)) {
    return { error: "URL inválida. Inclua o https:// (ex: https://pagina.com)." }
  }

  const utmSource = (formData.get("utm_source") as string) || null
  const utmMedium = (formData.get("utm_medium") as string) || null
  const utmCampaign = (formData.get("utm_campaign") as string) || null
  const utmContent = (formData.get("utm_content") as string) || null
  const utmTerm = (formData.get("utm_term") as string) || null

  await db
    .update(variants)
    .set({ name, url, weight, utmSource, utmMedium, utmCampaign, utmContent, utmTerm })
    .where(eq(variants.id, variantId))

  return { success: true }
}

export async function deleteVariant(experimentId: string, variantId: string) {
  const experiment = await getOwnedExperiment(experimentId)
  if (!experiment) return { error: "Experimento não encontrado." }

  await db.delete(variants).where(eq(variants.id, variantId))
}

export async function simulateConversion(experimentId: string, spreadAcross = false) {
  const experiment = await getOwnedExperiment(experimentId)
  if (!experiment) return { error: "Experimento não encontrado." }
  if (experiment.status !== "active") return { error: "Ative o experimento primeiro." }

  const variantList = await db
    .select()
    .from(variants)
    .where(eq(variants.experimentId, experimentId))

  if (variantList.length === 0) return { error: "Adicione ao menos uma variante." }

  if (spreadAcross) {
    const results: string[] = []
    const iterationsPerVariant = 5

    for (const variant of variantList) {
      const convRate = variant.name.toLowerCase().includes("1") || variant.name.toLowerCase().includes("a")
        ? 0.08
        : variant.name.toLowerCase().includes("2") || variant.name.toLowerCase().includes("b")
          ? 0.04
          : 0.02

      for (let i = 0; i < iterationsPerVariant; i++) {
        const visitorHash = uuidv4()
        await db.insert(events).values({ experimentId, variantId: variant.id, visitorHash })

        if (Math.random() < convRate) {
          const payload = buildTestPayload(visitorHash, variant.name)
          try {
            await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/postback`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
          } catch {}
        }
      }
      results.push(`${variant.name}: ${iterationsPerVariant} cliques, ~${Math.round(convRate * iterationsPerVariant)} vendas`)
    }

    return { success: true, spreadResults: results }
  }

  const selected = variantList[0]
  const visitorHash = uuidv4()

  await db.insert(events).values({ experimentId, variantId: selected.id, visitorHash })

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
  const payload = buildTestPayload(visitorHash, selected.name)

  try {
    const res = await fetch(`${baseUrl}/api/postback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const json = await res.json()
    return { success: true, result: json, variantName: selected.name }
  } catch (e) {
    return { error: `Falha ao chamar postback: ${e}` }
  }
}

function buildTestPayload(visitorHash: string, variantName: string) {
  return {
    id: uuidv4(),
    creation_date: Date.now(),
    event: "PURCHASE_APPROVED",
    version: "2.0.0",
    data: {
      product: { id: 0, ucode: uuidv4(), name: `Produto Teste - ${variantName}` },
      buyer: { email: "teste@splitly.app", name: "Comprador Teste", first_name: "Comprador", last_name: "Teste", checkout_phone: "99999999900" },
      purchase: {
        approved_date: Date.now(),
        price: { value: 97.0, currency_value: "BRL" },
        full_price: { value: 97.0, currency_value: "BRL" },
        original_offer_price: { value: 97.0, currency_value: "BRL" },
        order_date: Date.now(),
        status: "APPROVED",
        transaction: `SIMULATED-${visitorHash.slice(0, 8)}`,
        payment: { installments_number: 1, type: "CREDIT_CARD" },
        offer: { code: "test" },
        xcod: visitorHash,
      },
    },
    hottok: "simulated",
  }
}

export async function declareWinner(experimentId: string, variantId: string) {
  const experiment = await getOwnedExperiment(experimentId)
  if (!experiment) return { error: "Experimento não encontrado." }

  await db
    .update(experiments)
    .set({
      winnerVariantId: variantId,
      winnerDeclaredAt: new Date(),
      status: "paused",
    })
    .where(eq(experiments.id, experimentId))
}

export async function pauseLosers(experimentId: string, loserIds: string[]) {
  const experiment = await getOwnedExperiment(experimentId)
  if (!experiment) return { error: "Experimento não encontrado." }

  for (const id of loserIds) {
    await db.delete(variants).where(
      and(eq(variants.id, id), eq(variants.experimentId, experimentId))
    )
  }
}

export async function updateSettings(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const newPassword = formData.get("newPassword") as string
  const confidenceThreshold = formData.get("confidenceThreshold") as string
  const customDomain = (formData.get("customDomain") as string)?.trim() || null

  const updateData: Record<string, unknown> = {}

  if (name && name.length > 0) updateData.name = name
  if (email && email.length > 0) updateData.email = email
  if (newPassword && newPassword.length >= 6) {
    updateData.passwordHash = await bcrypt.hash(newPassword, 10)
  }
  if (confidenceThreshold) {
    const threshold = parseInt(confidenceThreshold)
    if (threshold >= 70 && threshold <= 99) {
      updateData.confidenceThreshold = threshold
    }
  }

  if (customDomain !== undefined) {
    const clean = customDomain
      ? customDomain.replace(/^https?:\/\//, "").replace(/\/$/, "").toLowerCase()
      : null
    updateData.customDomain = clean
  }

  if (Object.keys(updateData).length === 0) {
    return { error: "Nenhum dado para atualizar." }
  }

  await db.update(users).set(updateData).where(eq(users.id, session.user.id))

  return { success: true }
}

export async function requestPasswordReset(formData: FormData) {
  const email = formData.get("email") as string

  if (!email) return { error: "Email é obrigatório." }

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)

  if (user) {
    // MVP: log to console. Replace with email service in production.
    console.log(`[Splitly] Password reset requested for ${email}. User ID: ${user.id}`)
  }

  return { success: true }
}

export async function completeOnboarding() {
  const session = await auth()
  if (!session?.user?.id) return

  await db
    .update(users)
    .set({ onboardingCompleted: "true" })
    .where(eq(users.id, session.user.id))
}

export async function deleteAccount() {
  "use server"

  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  await db.delete(users).where(eq(users.id, session.user.id))

  redirect("/?deleted=true")
}

export async function generateApiKey() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const apiKey = `spl_${uuidv4().replace(/-/g, "")}`

  await db.update(users).set({ apiKey }).where(eq(users.id, session.user.id))

  return { apiKey }
}

export async function toggleShare(experimentId: string) {
  const experiment = await getOwnedExperiment(experimentId)
  if (!experiment) return { error: "Experimento não encontrado." }

  const enable = experiment.shareEnabled !== "true"
  const shareToken = enable ? uuidv4().slice(0, 12) : experiment.shareToken

  await db
    .update(experiments)
    .set({
      shareEnabled: enable ? "true" : "false",
      shareToken: enable ? shareToken : experiment.shareToken,
    })
    .where(eq(experiments.id, experimentId))

  return {
    enabled: enable,
    shareUrl: enable
      ? `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/share/${shareToken}`
      : null,
  }
}

export async function updateExperimentCost(experimentId: string, formData: FormData) {
  const experiment = await getOwnedExperiment(experimentId)
  if (!experiment) return { error: "Experimento não encontrado." }

  const costStr = formData.get("cost") as string
  const costCents = costStr ? Math.round(parseFloat(costStr) * 100) : 0

  await db.update(experiments).set({ costCents }).where(eq(experiments.id, experimentId))

  return { success: true }
}
