import { NextRequest, NextResponse } from "next/server"
import { eq, desc } from "drizzle-orm"
import { db } from "@/lib/db"
import { users, experiments } from "@/lib/db/schema"

export async function GET(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key") || request.nextUrl.searchParams.get("api_key") || ""

  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 401 })
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.apiKey, apiKey))
    .limit(1)

  if (!user) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 })
  }

  const experimentsList = await db
    .select({
      id: experiments.id,
      name: experiments.name,
      slug: experiments.slug,
      status: experiments.status,
      costCents: experiments.costCents,
      createdAt: experiments.createdAt,
    })
    .from(experiments)
    .where(eq(experiments.userId, user.id))
    .orderBy(desc(experiments.createdAt))

  return NextResponse.json(experimentsList)
}
