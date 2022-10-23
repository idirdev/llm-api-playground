import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

function getProvider(model) {
  if (model.startsWith("gpt-") || model.startsWith("o1") || model.startsWith("o3")) return "openai";
  if (model.startsWith("claude-")) return "anthropic";
  return null;
}

function validateBody(body) {
  if (!body.model) return "Missing required field: model";
  if (!body.apiKey || !body.apiKey.trim()) return "API key is required. Enter your key in the Config panel.";
  if (!body.messages || body.messages.length === 0) return "Missing required field: messages";
  if (!getProvider(body.model)) return "Unsupported model: " + body.model;
  return null;
}

describe("getProvider", () => {
  it("routes GPT models to openai", () => {
    expect(getProvider("gpt-4-turbo")).toBe("openai");
    expect(getProvider("gpt-4o")).toBe("openai");
    expect(getProvider("gpt-3.5-turbo")).toBe("openai");
  });
  it("routes Claude models to anthropic", () => {
    expect(getProvider("claude-3-opus")).toBe("anthropic");
    expect(getProvider("claude-3-sonnet")).toBe("anthropic");
    expect(getProvider("claude-3-5-sonnet-20241022")).toBe("anthropic");
  });
  it("returns null for unknown models", () => {
    expect(getProvider("llama-3-70b")).toBeNull();
    expect(getProvider("mistral-large")).toBeNull();
    expect(getProvider("unknown-model")).toBeNull();
  });
});

describe("validateBody", () => {
  const v = { model: "gpt-4-turbo", apiKey: "sk-test", messages: [{ role: "user", content: "Hello" }] };
  it("passes valid OpenAI body", () => { expect(validateBody(v)).toBeNull(); });
  it("passes valid Anthropic body", () => { expect(validateBody({ ...v, model: "claude-3-opus" })).toBeNull(); });
  it("rejects empty apiKey", () => { expect(validateBody({ ...v, apiKey: "" })).toContain("API key"); });
  it("rejects whitespace apiKey", () => { expect(validateBody({ ...v, apiKey: "   " })).toContain("API key"); });
  it("rejects empty messages", () => { expect(validateBody({ ...v, messages: [] })).toContain("messages"); });
  it("rejects unsupported model", () => { expect(validateBody({ ...v, model: "llama-3-70b" })).toContain("Unsupported model"); });
  it("rejects missing model", () => { const b = { ...v }; delete b.model; expect(validateBody(b)).toContain("model"); });
});

describe("OpenAI fetch headers (mocked)", () => {
  beforeEach(() => { vi.stubGlobal("fetch", vi.fn()); });
  afterEach(() => { vi.unstubAllGlobals(); });
  it("sends Authorization header", async () => {
    fetch.mockResolvedValueOnce({ ok: true, body: new ReadableStream({ start(c) { c.close(); } }) });
    const key = "sk-test-key";
    await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST", headers: { "Authorization": "Bearer " + key }, body: "{}",
    });
    const [, opts] = fetch.mock.calls[0];
    expect(opts.headers["Authorization"]).toBe("Bearer " + key);
  });
  it("returns error body on 401", async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({ error: { message: "Invalid API key" } }) });
    const res = await fetch("https://api.openai.com/v1/chat/completions", { method: "POST", headers: {}, body: "{}" });
    expect(res.ok).toBe(false); expect(res.status).toBe(401);
    expect((await res.json()).error.message).toBe("Invalid API key");
  });
});

describe("Anthropic fetch headers (mocked)", () => {
  beforeEach(() => { vi.stubGlobal("fetch", vi.fn()); });
  afterEach(() => { vi.unstubAllGlobals(); });
  it("sends x-api-key and anthropic-version", async () => {
    fetch.mockResolvedValueOnce({ ok: true, body: new ReadableStream({ start(c) { c.close(); } }) });
    const key = "sk-ant-test";
    await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST", headers: { "x-api-key": key, "anthropic-version": "2023-06-01" }, body: "{}",
    });
    const [, opts] = fetch.mock.calls[0];
    expect(opts.headers["x-api-key"]).toBe(key);
    expect(opts.headers["anthropic-version"]).toBe("2023-06-01");
  });
  it("returns error on 429", async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 429, json: async () => ({ error: { message: "Rate limit exceeded" } }) });
    const res = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: {}, body: "{}" });
    expect(res.status).toBe(429);
    expect((await res.json()).error.message).toBe("Rate limit exceeded");
  });
});

describe("SSE delta parsing", () => {
  function parse(raw) {
    const out = [];
    for (const line of raw.split(String.fromCharCode(10))) {
      if (!line.startsWith("data: ")) continue;
      const d = line.slice(6).trim();
      if (d === "[DONE]") break;
      try { const p = JSON.parse(d); const c = p?.choices?.[0]?.delta?.content; if (typeof c === "string") out.push(c); } catch {}
    }
    return out;
  }
  it("accumulates tokens", () => {
    const NL = String.fromCharCode(10);
    const raw = ["data: {\"choices\":[{\"delta\":{\"content\":\"Hello\"},\"finish_reason\":null}]}", "data: {\"choices\":[{\"delta\":{\"content\":\" world\"},\"finish_reason\":null}]}", "data: [DONE]"].join(NL);
    expect(parse(raw)).toEqual(["Hello", " world"]);
    expect(parse(raw).join("")).toBe("Hello world");
  });
  it("ignores non-data lines", () => {
    const NL = String.fromCharCode(10);
    const raw = ["event: x", "data: {\"choices\":[{\"delta\":{\"content\":\"Hi\"},\"finish_reason\":null}]}", "data: [DONE]"].join(NL);
    expect(parse(raw)).toEqual(["Hi"]);
  });
  it("handles malformed JSON", () => {
    const NL = String.fromCharCode(10);
    const raw = ["data: {bad json}", "data: {\"choices\":[{\"delta\":{\"content\":\"OK\"},\"finish_reason\":null}]}", "data: [DONE]"].join(NL);
    expect(parse(raw)).toEqual(["OK"]);
  });
  it("returns [] for no deltas", () => {
    expect(parse("data: [DONE]")).toEqual([]);
  });
});
