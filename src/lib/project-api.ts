import { z } from "zod"

import { apiRequest } from "@/lib/api-client"

const competitorSchema = z.object({ id: z.string(), name: z.string() })
const countsSchema = z.object({
  sourcePages: z.number(),
  queryOpportunities: z.number(),
  audits: z.number(),
  optimizationTasks: z.number(),
})
const crawlPageSchema = z.object({
  url: z.string(),
  statusCode: z.number().nullable(),
  errorCode: z.string().nullable(),
  success: z.boolean(),
})
const crawlSchema = z.object({
  id: z.string(),
  brandId: z.string(),
  status: z.enum(["QUEUED", "RUNNING", "COMPLETED", "PARTIAL", "FAILED", "CANCELLED"]),
  requestedUrl: z.string(),
  maxPages: z.number(),
  discoveredPages: z.number(),
  completedPages: z.number(),
  failedPages: z.number(),
  errorMessage: z.string().nullable(),
  pages: z.array(crawlPageSchema).default([]),
  createdAt: z.string(),
  startedAt: z.string().nullable(),
  completedAt: z.string().nullable(),
})
const entityProfileSchema = z.object({
  id: z.string(),
  brandId: z.string(),
  version: z.number(),
  status: z.enum(["DRAFT", "CONFIRMED"]),
  officialName: z.string(),
  companyName: z.string().nullable(),
  aliases: z.unknown(),
  definition: z.string().nullable(),
  audiences: z.unknown().nullable(),
  useCases: z.unknown().nullable(),
  features: z.unknown().nullable(),
  supported: z.unknown().nullable(),
  pricing: z.unknown().nullable(),
  verifiedFacts: z.unknown().nullable(),
  evidence: z.unknown().nullable(),
  confirmedAt: z.string().nullable(),
  createdAt: z.string(),
})
const projectSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  domain: z.string(),
  description: z.string().nullable(),
  category: z.string().nullable(),
  audience: z.string().nullable(),
  market: z.string().nullable(),
  countries: z.unknown().nullable(),
  languages: z.unknown().nullable(),
  conversionGoal: z.string().nullable(),
  status: z.enum(["CONFIGURING", "READY", "RUNNING", "OPTIMIZING", "RETEST_READY", "ARCHIVED"]),
  archivedAt: z.string().nullable(),
  competitors: z.array(competitorSchema),
  crawlRuns: z.array(crawlSchema),
  entityProfiles: z.array(entityProfileSchema),
  _count: countsSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
})

const snapshotSchema = z.object({
  id: z.string(),
  sourcePageId: z.string(),
  statusCode: z.number().nullable(),
  finalUrl: z.string().nullable(),
  responseTimeMs: z.number().nullable(),
  contentType: z.string().nullable(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  h1: z.string().nullable(),
  body: z.string().nullable(),
  structuredData: z.unknown().nullable(),
  canonical: z.string().nullable(),
  robots: z.unknown().nullable(),
  language: z.string().nullable(),
  internalLinks: z.unknown().nullable(),
  contentFingerprint: z.string().nullable(),
  truncated: z.boolean(),
  errorCode: z.string().nullable(),
  errorMessage: z.string().nullable(),
  crawledAt: z.string(),
})
const sourcePageSchema = z.object({
  id: z.string(),
  brandId: z.string(),
  canonicalUrl: z.string(),
  originalUrl: z.string(),
  pageType: z.string().nullable(),
  snapshots: z.array(snapshotSchema),
  _count: z.object({ snapshots: z.number() }).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

const entityCandidateSchema = z.object({
  officialName: z.string(),
  companyName: z.string().optional(),
  aliases: z.array(z.string()),
  definition: z.string().optional(),
  audiences: z.array(z.string()),
  useCases: z.array(z.string()),
  features: z.array(z.string()),
  supported: z.array(z.record(z.string(), z.unknown())),
  pricing: z.array(z.record(z.string(), z.unknown())),
  verifiedFacts: z.array(z.record(z.string(), z.unknown())),
  evidence: z.array(z.record(z.string(), z.unknown())),
})
const entityWorkspaceSchema = z.object({
  latest: entityProfileSchema.nullable(),
  candidate: entityCandidateSchema,
  sourcePageCount: z.number(),
})

const querySchema = z.object({
  id: z.string(),
  brandId: z.string(),
  text: z.string(),
  normalizedText: z.string(),
  language: z.string(),
  country: z.string(),
  intent: z.enum(["CATEGORY_DISCOVERY", "SCENARIO_SOLUTION", "PAIN_SOLUTION", "PRODUCT_COMPARISON", "PURCHASE_DECISION", "BRAND_VERIFICATION"]),
  funnelStage: z.enum(["AWARENESS", "CONSIDERATION", "DECISION"]),
  businessValue: z.enum(["HIGH", "MEDIUM", "LOW"]),
  valueReason: z.string().nullable(),
  targetAudience: z.string().nullable(),
  isBranded: z.boolean(),
  source: z.string(),
  enabled: z.boolean(),
  version: z.number(),
  pageMappings: z.array(z.unknown()).optional(),
  _count: z.object({ auditPrompts: z.number() }).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

const billingSchema = z.object({
  subscription: z.object({
    id: z.string(),
    name: z.string(),
    status: z.string(),
    totalCredits: z.number(),
    startsAt: z.string(),
    expiresAt: z.string(),
  }).nullable(),
  balance: z.number(),
  ledger: z.array(z.object({
    id: z.string(),
    type: z.string(),
    amount: z.number(),
    balanceAfter: z.number(),
    reason: z.string().nullable(),
    createdAt: z.string(),
  })),
})

export type Project = z.infer<typeof projectSchema>
export type CrawlRun = z.infer<typeof crawlSchema>
export type SourcePage = z.infer<typeof sourcePageSchema>
export type EntityWorkspace = z.infer<typeof entityWorkspaceSchema>
export type QueryOpportunity = z.infer<typeof querySchema>
export type BillingSummary = z.infer<typeof billingSchema>

export type CreateProjectPayload = {
  name: string
  websiteUrl: string
  description?: string
  category?: string
  audience?: string
  market: string
  countries: string[]
  languages: string[]
  conversionGoal?: string
  competitors: string[]
}

export type ConfirmEntityPayload = z.infer<typeof entityCandidateSchema>

export function listProjects() {
  return apiRequest("/projects", {}, z.object({ data: z.array(projectSchema) }))
}

export function getProject(id: string) {
  return apiRequest(`/projects/${id}`, {}, z.object({ data: projectSchema }))
}

export function createProject(payload: CreateProjectPayload) {
  return apiRequest("/projects", { method: "POST", body: JSON.stringify(payload) }, z.object({ data: projectSchema }))
}

export function archiveProject(id: string) {
  return apiRequest(`/projects/${id}`, { method: "DELETE" }, z.object({ data: projectSchema }))
}

export function listCrawls(projectId: string) {
  return apiRequest(`/projects/${projectId}/crawls`, {}, z.object({ data: z.array(crawlSchema) }))
}

export function startCrawl(projectId: string, maxPages = 20) {
  return apiRequest(`/projects/${projectId}/crawls`, { method: "POST", body: JSON.stringify({ maxPages }) }, z.object({ data: crawlSchema }))
}

export function listPages(projectId: string) {
  return apiRequest(`/projects/${projectId}/pages`, {}, z.object({ data: z.array(sourcePageSchema) }))
}

export function createManualPage(projectId: string, payload: { url: string; title?: string; description?: string; h1?: string; body: string; language: string }) {
  return apiRequest(`/projects/${projectId}/pages`, { method: "POST", body: JSON.stringify(payload) }, z.object({ data: snapshotSchema.extend({ sourcePage: sourcePageSchema.omit({ snapshots: true }) }) }))
}

export function getEntityWorkspace(projectId: string) {
  return apiRequest(`/projects/${projectId}/entity`, {}, z.object({ data: entityWorkspaceSchema }))
}

export function confirmEntity(projectId: string, payload: ConfirmEntityPayload) {
  return apiRequest(`/projects/${projectId}/entity`, { method: "POST", body: JSON.stringify(payload) }, z.object({ data: entityProfileSchema }))
}

export function listQueries(projectId: string) {
  return apiRequest(`/projects/${projectId}/queries`, {}, z.object({ data: z.array(querySchema) }))
}

export function generateQueries(projectId: string, count = 24) {
  return apiRequest(`/projects/${projectId}/queries/generate`, { method: "POST", body: JSON.stringify({ count }) }, z.object({ data: z.object({ createdCount: z.number(), data: z.array(querySchema) }) }))
}

export function createQuery(projectId: string, payload: { text: string; language: string; country: string; intent: QueryOpportunity["intent"]; funnelStage: QueryOpportunity["funnelStage"]; businessValue: QueryOpportunity["businessValue"]; isBranded: boolean; enabled: boolean; valueReason?: string }) {
  return apiRequest(`/projects/${projectId}/queries`, { method: "POST", body: JSON.stringify(payload) }, z.object({ data: querySchema }))
}

export function updateQuery(projectId: string, queryId: string, payload: Partial<Pick<QueryOpportunity, "text" | "enabled" | "intent" | "funnelStage" | "businessValue" | "valueReason" | "isBranded">>) {
  return apiRequest(`/projects/${projectId}/queries/${queryId}`, { method: "PATCH", body: JSON.stringify(payload) }, z.object({ data: querySchema }))
}

export function deleteQuery(projectId: string, queryId: string) {
  return apiRequest(`/projects/${projectId}/queries/${queryId}`, { method: "DELETE" }, z.object({ data: z.null() }))
}

export function getBilling() {
  return apiRequest("/billing", {}, z.object({ data: billingSchema }))
}

const manualAnalysisSchema = z.object({
  targetMentioned: z.boolean(),
  targetRecommended: z.boolean(),
  factRisk: z.boolean(),
  confidence: z.number(),
  evidenceQuotes: z.unknown(),
})

const manualAuditCitationSchema = z.object({
  url: z.string(),
  title: z.string().optional(),
})

const manualAuditAnswerSchema = z.object({
  id: z.string(),
  content: z.string(),
  executedAt: z.string(),
  citations: z.array(manualAuditCitationSchema).default([]),
  analysisVersions: z.array(manualAnalysisSchema),
})

const manualAuditTaskSchema = z.object({
  id: z.string(),
  status: z.string(),
  errorCode: z.string().nullable(),
  errorMessage: z.string().nullable(),
  collectionMethod: z.enum(["API", "MANUAL", "IMPORT"]),
  engine: z.enum([
    "CHATGPT",
    "PERPLEXITY",
    "GEMINI",
    "DEEPSEEK",
    "KIMI",
    "DOUBAO",
    "YUANBAO",
  ]),
  platformProduct: z.string().nullable(),
  prompt: z.object({
    id: z.string(),
    text: z.string(),
    position: z.number(),
  }),
  answers: z.array(manualAuditAnswerSchema),
})

const manualAuditSchema = z.object({
  id: z.string(),
  status: z.string(),
  totalTasks: z.number(),
  completedTasks: z.number(),
  failedTasks: z.number(),
  createdAt: z.string(),
  completedAt: z.string().nullable(),
  entityProfileVersion: z.object({ version: z.number() }).nullable(),
  detectionTasks: z.array(manualAuditTaskSchema),
})

export type ManualAudit = z.infer<typeof manualAuditSchema>
export type ManualAuditTask = z.infer<typeof manualAuditTaskSchema>

export type ManualAuditPlatform =
  | "chatgpt"
  | "deepseek"
  | "kimi"
  | "doubao"

export function listProjectAudits(projectId: string) {
  return apiRequest(
    `/projects/${projectId}/audits`,
    {},
    z.object({ data: z.array(manualAuditSchema) }),
  )
}

export function createManualAudit(
  projectId: string,
  count = 5,
  platforms: ManualAuditPlatform[] = ["doubao"],
) {
  return apiRequest(
    `/projects/${projectId}/audits`,
    { method: "POST", body: JSON.stringify({ count, platforms }) },
    z.object({ data: manualAuditSchema }),
  )
}

export function submitManualAuditAnswer(
  projectId: string,
  auditId: string,
  taskId: string,
  content: string,
) {
  return apiRequest(
    `/projects/${projectId}/audits/${auditId}/tasks/${taskId}/answer`,
    { method: "POST", body: JSON.stringify({ content }) },
    z.object({ data: manualAuditSchema }),
  )
}


export function startDoubaoAutomaticCollection(
  projectId: string,
  auditId: string,
) {
  return apiRequest(
    `/projects/${projectId}/audits/${auditId}/collect`,
    { method: 'POST' },
    z.object({ data: manualAuditSchema }),
  )
}

const optimizationTaskStatusSchema = z.enum([
  "TODO",
  "IN_PROGRESS",
  "BLOCKED",
  "READY_TO_VERIFY",
  "VERIFIED",
  "REJECTED",
  "DISMISSED",
])

const taskVerificationSchema = z.object({
  id: z.string(),
  taskId: z.string(),
  submittedUrl: z.string(),
  submittedNote: z.string().nullable(),
  completedAt: z.string().nullable(),
  releaseReference: z.string().nullable(),
  beforeSnapshotId: z.string().nullable(),
  afterSnapshotId: z.string().nullable(),
  checkResults: z.unknown().nullable(),
  status: z.enum(["PENDING", "VERIFIED", "REJECTED", "NEEDS_MANUAL"]),
  verifiedAt: z.string().nullable(),
  createdAt: z.string(),
})

const optimizationTaskSchema = z.object({
  id: z.string(),
  brandId: z.string(),
  sourceAuditId: z.string().nullable(),
  mergeFingerprint: z.string(),
  type: z.enum([
    "TECHNICAL",
    "ENTITY",
    "CONTENT",
    "STRUCTURED_DATA",
    "TRUST",
    "EXTERNAL_SOURCE",
  ]),
  priority: z.enum(["BLOCKER", "HIGH", "MEDIUM", "LOW"]),
  status: optimizationTaskStatusSchema,
  title: z.string(),
  targetUrl: z.string().nullable(),
  suggestedUrl: z.string().nullable(),
  currentProblem: z.string(),
  action: z.string(),
  suggestedPosition: z.string().nullable(),
  contentRequirements: z.unknown().nullable(),
  prohibitedClaims: z.unknown().nullable(),
  acceptanceChecklist: z.unknown(),
  expectedMetrics: z.unknown().nullable(),
  note: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  sourceAudit: z.object({
    id: z.string(),
    status: z.string(),
    createdAt: z.string(),
    completedAt: z.string().nullable(),
  }).nullable(),
  evidence: z.array(z.object({
    id: z.string(),
    type: z.string(),
    sourceId: z.string().nullable(),
    sourceUrl: z.string().nullable(),
    quote: z.string().nullable(),
    metadata: z.unknown().nullable(),
    createdAt: z.string(),
  })),
  verifications: z.array(taskVerificationSchema),
})

export type OptimizationTask = z.infer<typeof optimizationTaskSchema>

export function listOptimizationTasks(projectId: string) {
  return apiRequest(
    `/projects/${projectId}/tasks`,
    {},
    z.object({ data: z.array(optimizationTaskSchema) }),
  )
}

export function generateOptimizationTasks(projectId: string, auditId: string) {
  return apiRequest(
    `/projects/${projectId}/tasks`,
    { method: "POST", body: JSON.stringify({ auditId }) },
    z.object({ data: z.object({
      createdCount: z.number(),
      existingCount: z.number(),
      data: z.array(optimizationTaskSchema),
    }) }),
  )
}

export function updateOptimizationTask(
  projectId: string,
  taskId: string,
  status: OptimizationTask["status"],
) {
  return apiRequest(
    `/projects/${projectId}/tasks/${taskId}`,
    { method: "PATCH", body: JSON.stringify({ status }) },
    z.object({ data: optimizationTaskSchema }),
  )
}

export function submitOptimizationTaskVerification(
  projectId: string,
  taskId: string,
  submittedUrl: string,
) {
  return apiRequest(
    `/projects/${projectId}/tasks/${taskId}/verifications`,
    {
      method: "POST",
      body: JSON.stringify({ submittedUrl }),
    },
    z.object({ data: optimizationTaskSchema }),
  )
}
