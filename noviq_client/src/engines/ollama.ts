import type {
  ChatMessage,
  InferenceEngine,
  ModelInfo,
  TokenUsage,
} from "../types.js";

export interface InferenceEngineAdapter {
  readonly engine: InferenceEngine;
  ensureReady(model: ModelInfo): Promise<void>;
  streamCompletion(
    model: ModelInfo,
    messages: ChatMessage[],
    options?: { maxTokens?: number },
  ): AsyncGenerator<string, TokenUsage>;
}

export interface OllamaTagsResponse {
  models: Array<{ name: string; model: string }>;
}

export class OllamaEngine implements InferenceEngineAdapter {
  readonly engine = "ollama" as const;

  constructor(private readonly host: string) {}

  async ensureReady(model: ModelInfo): Promise<void> {
    await this.assertReachable();

    const models = await this.listModels();
    const available = models.some(
      (entry) =>
        entry.name === model.ref ||
        entry.model === model.ref ||
        entry.name.startsWith(`${model.ref}:`),
    );

    if (!available) {
      throw new Error(
        `Model "${model.ref}" is not loaded in Ollama. Run: ollama pull ${model.ref}`,
      );
    }
  }

  async *streamCompletion(
    model: ModelInfo,
    messages: ChatMessage[],
    options?: { maxTokens?: number },
  ): AsyncGenerator<string, TokenUsage> {
    const response = await fetch(`${this.host}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: model.ref,
        messages,
        stream: true,
        options: options?.maxTokens
          ? { num_predict: options.maxTokens }
          : undefined,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Ollama request failed (${response.status}): ${body}`);
    }

    if (!response.body) {
      throw new Error("Ollama returned an empty response body.");
    }

    let promptTokens = 0;
    let completionTokens = 0;

    for await (const chunk of readNdjson(response.body)) {
      const message = chunk.message as { content?: string } | undefined;
      if (message?.content) {
        completionTokens += 1;
        yield message.content;
      }

      if (typeof chunk.prompt_eval_count === "number") {
        promptTokens = chunk.prompt_eval_count;
      }
      if (typeof chunk.eval_count === "number") {
        completionTokens = chunk.eval_count;
      }
    }

    return {
      promptTokens,
      completionTokens,
    };
  }

  private async assertReachable(): Promise<void> {
    try {
      const response = await fetch(`${this.host}/api/tags`);
      if (!response.ok) {
        throw new Error(`Ollama responded with ${response.status}`);
      }
    } catch (error) {
      throw new Error(
        `Ollama is not reachable at ${this.host}. Start Ollama before running noviq-worker.`,
        { cause: error },
      );
    }
  }

  private async listModels(): Promise<OllamaTagsResponse["models"]> {
    const response = await fetch(`${this.host}/api/tags`);
    const data = (await response.json()) as OllamaTagsResponse;
    return data.models ?? [];
  }
}

async function* readNdjson(body: ReadableStream<Uint8Array>): AsyncGenerator<
  Record<string, unknown>
> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      yield JSON.parse(trimmed) as Record<string, unknown>;
    }
  }

  const trailing = buffer.trim();
  if (trailing) {
    yield JSON.parse(trailing) as Record<string, unknown>;
  }
}
