import { NextRequest } from "next/server";

export const runtime = "edge";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatRequestBody {
  messages: ChatMessage[];
  model: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  stream: boolean;
  apiKey: string;
}

function getProvider(model: string): "openai" | "anthropic" | null {
  if (
    model.startsWith("gpt-") ||
    model.startsWith("o1") ||
    model.startsWith("o3")
  ) {
    return "openai";
  }
  if (model.startsWith("claude-")) {
    return "anthropic";
  }
  return null;
}

async function streamOpenAI(
  body: ChatRequestBody,
  apiKey: string
): Promise<Response> {
  const messages: ChatMessage[] = [];
  if (body.systemPrompt) {
    messages.push({ role: "system", content: body.systemPrompt });
  }
  messages.push(...body.messages);

  const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: body.model,
      messages,
      temperature: body.temperature,
      max_tokens: body.maxTokens,
      top_p: body.topP,
      frequency_penalty: body.frequencyPenalty,
      presence_penalty: body.presencePenalty,
      stream: true,
    }),
  });

  if (!openaiRes.ok) {
    const error = await openaiRes.json().catch(() => ({ error: { message: "Unknown error" } }));
    const message = error?.error?.message ?? `OpenAI error ${openaiRes.status}`;
    return new Response(
      JSON.stringify({ error: message }),
      { status: openaiRes.status, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(openaiRes.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

async function streamAnthropic(
  body: ChatRequestBody,
  apiKey: string
): Promise<Response> {
  const anthropicMessages = body.messages.map((m) => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: m.content,
  }));

  const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: body.model,
      system: body.systemPrompt || undefined,
      messages: anthropicMessages,
      temperature: body.temperature,
      max_tokens: body.maxTokens,
      top_p: body.topP,
      stream: true,
    }),
  });

  if (!anthropicRes.ok) {
    const error = await anthropicRes.json().catch(() => ({ error: { message: "Unknown error" } }));
    const message = error?.error?.message ?? `Anthropic error ${anthropicRes.status}`;
    return new Response(
      JSON.stringify({ error: message }),
      { status: anthropicRes.status, headers: { "Content-Type": "application/json" } }
    );
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const transformStream = new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      const text = decoder.decode(chunk, { stream: true });
      const lines = text.split("\n");

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (!data || data === "[DONE]") continue;

        try {
          const parsed = JSON.parse(data);
          if (
            parsed.type === "content_block_delta" &&
            parsed.delta?.type === "text_delta"
          ) {
            const openaiChunk = {
              choices: [
                {
                  delta: { content: parsed.delta.text },
                  finish_reason: null,
                },
              ],
            };
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(openaiChunk)}\n\n`)
            );
          } else if (parsed.type === "message_stop") {
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          }
        } catch {
          // skip malformed lines
        }
      }
    },
  });

  return new Response(anthropicRes.body!.pipeThrough(transformStream), {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

export async function POST(req: NextRequest): Promise<Response> {
  let body: ChatRequestBody;

  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { model, apiKey, messages } = body;

  if (!model) {
    return new Response(
      JSON.stringify({ error: "Missing required field: model" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!apiKey || !apiKey.trim()) {
    return new Response(
      JSON.stringify({ error: "API key is required. Enter your key in the Config panel." }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!messages || messages.length === 0) {
    return new Response(
      JSON.stringify({ error: "Missing required field: messages" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const provider = getProvider(model);

  if (!provider) {
    return new Response(
      JSON.stringify({ error: `Unsupported model: ${model}. Supported providers: OpenAI (gpt-*), Anthropic (claude-*).` }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    if (provider === "openai") {
      return await streamOpenAI(body, apiKey.trim());
    } else {
      return await streamAnthropic(body, apiKey.trim());
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected server error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
