"use server"

import { eq, and } from "drizzle-orm"
import { redirect } from "next/navigation"
import { auth } from "./auth"
import { db } from "./db"
import { experiments } from "./db/schema"

export async function getOwnedExperiment(experimentId: string) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const [experiment] = await db
    .select()
    .from(experiments)
    .where(
      and(
        eq(experiments.id, experimentId),
        eq(experiments.userId, session.user.id),
      ),
    )
    .limit(1)

  return experiment
}
