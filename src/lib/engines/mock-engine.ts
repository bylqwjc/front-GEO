import type {
  AnswerEngine,
  EngineRunInput,
  EngineRunResult,
} from "@/lib/engines/answer-engine";
import type { EngineId } from "@/lib/types";

export class MockAnswerEngine implements AnswerEngine {
  constructor(public readonly id: EngineId) {}

  async run(input: EngineRunInput): Promise<EngineRunResult> {
    return {
      engine: this.id,
      model: "demo-model",
      answer: `Demo response for: ${input.prompt}`,
      citations: [],
      executedAt: new Date().toISOString(),
      rawResponse: { demo: true, country: input.country, language: input.language },
    };
  }
}
