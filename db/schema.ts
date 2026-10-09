import { sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const jokeCandidates = sqliteTable(
  "joke_candidates",
  {
    id: text("id").primaryKey(),
    setupJson: text("setup_json").notNull(),
    punchline: text("punchline").notNull(),
    tag: text("tag"),
    emoji: text("emoji").notNull().default("🙂"),
    mechanismId: text("mechanism_id").notNull(),
    format: text("format").notNull(),
    topicsJson: text("topics_json").notNull().default("[]"),
    emotionalTruth: text("emotional_truth").notNull(),
    expectedReading: text("expected_reading").notNull(),
    revealedReading: text("revealed_reading").notNull(),
    palette: text("palette").notNull().default("yellow"),
    label: text("label").notNull(),
    qualityScore: integer("quality_score").notNull(),
    qualityJson: text("quality_json").notNull(),
    fingerprint: text("fingerprint").notNull(),
    source: text("source").notNull().default("baseline"),
    provider: text("provider").notNull().default("deterministic"),
    model: text("model"),
    promptVersion: text("prompt_version").notNull().default("baseline-v1"),
    status: text("status").notNull().default("published"),
    visibilitySessionId: text("visibility_session_id"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
  },
  (table) => [
    index("idx_joke_candidates_status_quality").on(table.status, table.qualityScore),
    index("idx_joke_candidates_visibility").on(table.visibilitySessionId, table.status),
    index("idx_joke_candidates_mechanism").on(table.mechanismId)
  ]
);

export const impressionEvents = sqliteTable(
  "impression_events",
  {
    id: text("id").primaryKey(),
    sessionId: text("session_id").notNull(),
    jokeId: text("joke_id").notNull(),
    surface: text("surface").notNull().default("feed"),
    position: integer("position").notNull().default(0),
    servedAt: text("served_at").notNull().default(sql`CURRENT_TIMESTAMP`)
  },
  (table) => [
    index("idx_impressions_session_time").on(table.sessionId, table.servedAt),
    index("idx_impressions_joke").on(table.jokeId)
  ]
);

export const feedbackEvents = sqliteTable(
  "feedback_events",
  {
    id: text("id").primaryKey(),
    sessionId: text("session_id").notNull(),
    jokeId: text("joke_id").notNull(),
    vote: text("vote").notNull(),
    reasonCode: text("reason_code"),
    dwellMs: integer("dwell_ms"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
  },
  (table) => [
    index("idx_feedback_session_time").on(table.sessionId, table.createdAt),
    index("idx_feedback_joke_vote").on(table.jokeId, table.vote),
    index("idx_feedback_reason").on(table.reasonCode)
  ]
);

export const pairwiseEvents = sqliteTable(
  "pairwise_events",
  {
    id: text("id").primaryKey(),
    sessionId: text("session_id").notNull(),
    jokeAId: text("joke_a_id").notNull(),
    jokeBId: text("joke_b_id").notNull(),
    winnerId: text("winner_id").notNull(),
    reasonCode: text("reason_code"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
  },
  (table) => [
    index("idx_pairwise_session_time").on(table.sessionId, table.createdAt),
    index("idx_pairwise_winner").on(table.winnerId)
  ]
);

export const generationRuns = sqliteTable(
  "generation_runs",
  {
    id: text("id").primaryKey(),
    sessionId: text("session_id").notNull(),
    scene: text("scene").notNull(),
    audience: text("audience").notNull(),
    tone: text("tone").notNull(),
    provider: text("provider").notNull(),
    model: text("model"),
    promptVersion: text("prompt_version").notNull(),
    status: text("status").notNull(),
    candidateCount: integer("candidate_count").notNull().default(0),
    acceptedCount: integer("accepted_count").notNull().default(0),
    durationMs: integer("duration_ms"),
    traceJson: text("trace_json").notNull().default("{}"),
    errorCode: text("error_code"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    completedAt: text("completed_at")
  },
  (table) => [
    index("idx_generation_session_time").on(table.sessionId, table.createdAt),
    index("idx_generation_status").on(table.status)
  ]
);

export const cultureCards = sqliteTable(
  "culture_cards",
  {
    id: text("id").primaryKey(),
    context: text("context").notNull(),
    audienceJson: text("audience_json").notNull().default("[]"),
    relationshipJson: text("relationship_json").notNull().default("[]"),
    sharedHumanTruth: text("shared_human_truth").notNull(),
    emotionsJson: text("emotions_json").notNull().default("[]"),
    mechanismsJson: text("mechanisms_json").notNull().default("[]"),
    sourceKind: text("source_kind").notNull().default("original"),
    staleAfter: text("stale_after"),
    status: text("status").notNull().default("active"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
  },
  (table) => [
    index("idx_culture_cards_status_stale").on(table.status, table.staleAfter)
  ]
);

export const runtimeMetrics = sqliteTable(
  "runtime_metrics",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    value: real("value").notNull(),
    dimensionsJson: text("dimensions_json").notNull().default("{}"),
    recordedAt: text("recorded_at").notNull().default(sql`CURRENT_TIMESTAMP`)
  },
  (table) => [index("idx_runtime_metrics_name_time").on(table.name, table.recordedAt)]
);

export const wechatAccounts = sqliteTable(
  "wechat_accounts",
  {
    id: text("id").primaryKey(),
    openidHash: text("openid_hash").notNull().unique(),
    unionidHash: text("unionid_hash").unique(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    lastLoginAt: text("last_login_at").notNull().default(sql`CURRENT_TIMESTAMP`)
  },
  (table) => [index("idx_wechat_accounts_unionid").on(table.unionidHash)]
);

export const authSessions = sqliteTable(
  "auth_sessions",
  {
    tokenHash: text("token_hash").primaryKey(),
    userId: text("user_id").notNull(),
    expiresAt: text("expires_at").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    lastSeenAt: text("last_seen_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    revokedAt: text("revoked_at")
  },
  (table) => [
    index("idx_auth_sessions_user").on(table.userId),
    index("idx_auth_sessions_expiry").on(table.expiresAt)
  ]
);
