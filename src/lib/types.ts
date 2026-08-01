export type EngineId =
  | "chatgpt"
  | "perplexity"
  | "gemini"
  | "deepseek"
  | "doubao"
  | "yuanbao"

export type AuditStatus =
  | "draft"
  | "queued"
  | "running"
  | "waiting_manual"
  | "analyzing"
  | "partial"
  | "completed"
  | "failed"
  | "cancelled"

// Kept until the mock task board is replaced by OptimizationTask records.
export type TaskStatus = "todo" | "doing" | "done"

export type OptimizationTaskStatus =
  | "todo"
  | "in_progress"
  | "blocked"
  | "ready_to_verify"
  | "verified"
  | "rejected"
  | "dismissed"

export type CollectionMethod = "api" | "manual" | "import"

export interface VoiceShare {
  brand: string
  value: number
  color: string
}

export interface PromptResult {
  id: string
  engine: EngineId
  prompt: string
  mentioned: boolean
  recommended: boolean
  position: number | null
  citation: string | null
  summary: string
}

export interface CitationOpportunity {
  domain: string
  category: string
  competitorCitations: number
  brandCitations: number
  authority: "高" | "中"
}

export interface ActionTask {
  id: string
  title: string
  evidence: string
  impact: "高" | "中" | "低"
  status: TaskStatus
  owner: string
  due: string
  category: string
}
