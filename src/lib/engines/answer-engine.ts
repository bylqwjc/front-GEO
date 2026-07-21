import type { EngineId } from "@/lib/types";

export interface EngineRunInput {
  prompt: string;
  country: string;
  language: string;
}

export interface EngineCitation {
  title: string;
  url: string;
  domain: string;
}

export interface EngineRunResult {
  engine: EngineId;
  model: string;
  answer: string;
  citations: EngineCitation[];
  executedAt: string;
  rawResponse: unknown;
}

export interface AnswerEngine {
  readonly id: EngineId;
  run(input: EngineRunInput): Promise<EngineRunResult>;
}
