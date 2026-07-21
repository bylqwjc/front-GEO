export type EngineId = "chatgpt" | "perplexity" | "gemini";

export type AuditStatus = "completed" | "running" | "scheduled";

export type TaskStatus = "todo" | "doing" | "done";

export interface VoiceShare {
  brand: string;
  value: number;
  color: string;
}

export interface PromptResult {
  id: string;
  engine: EngineId;
  prompt: string;
  mentioned: boolean;
  recommended: boolean;
  position: number | null;
  citation: string | null;
  summary: string;
}

export interface CitationOpportunity {
  domain: string;
  category: string;
  competitorCitations: number;
  brandCitations: number;
  authority: "高" | "中";
}

export interface ActionTask {
  id: string;
  title: string;
  evidence: string;
  impact: "高" | "中" | "低";
  status: TaskStatus;
  owner: string;
  due: string;
  category: string;
}
