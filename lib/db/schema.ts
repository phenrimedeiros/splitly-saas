import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  pgEnum,
  numeric,
  jsonb,
  index,
} from "drizzle-orm/pg-core"

export const statusEnum = pgEnum("status", ["active", "paused", "draft"])

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  onboardingCompleted: text("onboarding_completed").default("false"),
  confidenceThreshold: integer("confidence_threshold").default(95),
  customDomain: text("custom_domain"),
  planId: uuid("plan_id").references(() => plans.id),
  apiKey: text("api_key"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const experiments = pgTable("experiments", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  status: statusEnum("status").default("draft").notNull(),
  winnerVariantId: uuid("winner_variant_id"),
  winnerDeclaredAt: timestamp("winner_declared_at"),
  costCents: integer("cost_cents").default(0),
  shareToken: text("share_token"),
  shareEnabled: text("share_enabled").default("false"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const variants = pgTable("variants", {
  id: uuid("id").defaultRandom().primaryKey(),
  experimentId: uuid("experiment_id")
    .references(() => experiments.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  weight: integer("weight").notNull().default(0),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  utmContent: text("utm_content"),
  utmTerm: text("utm_term"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_variants_experiment").on(table.experimentId),
])

export const events = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(),
  experimentId: uuid("experiment_id")
    .references(() => experiments.id, { onDelete: "cascade" })
    .notNull(),
  variantId: uuid("variant_id")
    .references(() => variants.id, { onDelete: "cascade" })
    .notNull(),
  visitorHash: text("visitor_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_events_experiment").on(table.experimentId),
  index("idx_events_visitor").on(table.visitorHash),
])

export const conversionStatusEnum = pgEnum("conversion_status", [
  "pending",
  "approved",
  "refunded",
  "cancelled",
])

export const conversions = pgTable("conversions", {
  id: uuid("id").defaultRandom().primaryKey(),
  experimentId: uuid("experiment_id")
    .references(() => experiments.id, { onDelete: "cascade" })
    .notNull(),
  variantId: uuid("variant_id")
    .references(() => variants.id, { onDelete: "cascade" })
    .notNull(),
  visitorHash: text("visitor_hash").notNull(),
  orderId: text("order_id"),
  amount: numeric("amount", { precision: 10, scale: 2 }),
  status: conversionStatusEnum("status").default("pending").notNull(),
  platform: text("platform").default("hotmart"),
  rawData: jsonb("raw_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_conversions_experiment").on(table.experimentId),
  index("idx_conversions_visitor").on(table.visitorHash),
])

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "canceled",
  "past_due",
  "incomplete",
  "trialing",
])

export const plans = pgTable("plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  monthlyClicks: integer("monthly_clicks").notNull(),
  monthlyExperiments: integer("monthly_experiments").notNull(),
  priceCents: integer("price_cents").notNull(),
  stripePriceId: text("stripe_price_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  planId: uuid("plan_id")
    .references(() => plans.id)
    .notNull(),
  stripeSubscriptionId: text("stripe_subscription_id"),
  status: subscriptionStatusEnum("status").default("active").notNull(),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})
