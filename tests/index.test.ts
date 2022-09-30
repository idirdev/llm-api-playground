import { describe, it, expect } from 'vitest';
import { MODELS, getModelById, getModelsByProvider, PROVIDERS } from '../src/lib/models';

describe('MODELS', () => {
  it('contains a list of models', () => {
    expect(MODELS.length).toBeGreaterThan(0);
  });

  it('each model has required fields', () => {
    for (const model of MODELS) {
      expect(model.id).toBeTruthy();
      expect(model.name).toBeTruthy();
      expect(model.provider).toBeTruthy();
      expect(model.contextWindow).toBeGreaterThan(0);
      expect(model.maxOutput).toBeGreaterThan(0);
      expect(model.inputPricePerMillion).toBeGreaterThanOrEqual(0);
      expect(model.outputPricePerMillion).toBeGreaterThanOrEqual(0);
      expect(model.capabilities.length).toBeGreaterThan(0);
      expect(model.description).toBeTruthy();
    }
  });

  it('all models have chat capability', () => {
    for (const model of MODELS) {
      expect(model.capabilities).toContain('chat');
    }
  });
});

describe('getModelById', () => {
  it('returns the model for a valid id', () => {
    const model = getModelById('gpt-4-turbo');
    expect(model).toBeDefined();
    expect(model!.name).toBe('GPT-4 Turbo');
    expect(model!.provider).toBe('OpenAI');
  });

  it('returns undefined for an invalid id', () => {
    expect(getModelById('nonexistent-model')).toBeUndefined();
  });

  it('finds Claude models', () => {
    const model = getModelById('claude-3-opus');
    expect(model).toBeDefined();
    expect(model!.provider).toBe('Anthropic');
  });
});

describe('getModelsByProvider', () => {
  it('returns OpenAI models', () => {
    const models = getModelsByProvider('OpenAI');
    expect(models.length).toBeGreaterThan(0);
    for (const model of models) {
      expect(model.provider).toBe('OpenAI');
    }
  });

  it('returns Anthropic models', () => {
    const models = getModelsByProvider('Anthropic');
    expect(models.length).toBeGreaterThan(0);
    for (const model of models) {
      expect(model.provider).toBe('Anthropic');
    }
  });

  it('returns empty array for unknown provider', () => {
    expect(getModelsByProvider('Unknown')).toEqual([]);
  });
});

describe('PROVIDERS', () => {
  it('contains a list of unique providers', () => {
    expect(PROVIDERS.length).toBeGreaterThan(0);
    expect(new Set(PROVIDERS).size).toBe(PROVIDERS.length);
  });

  it('includes known providers', () => {
    expect(PROVIDERS).toContain('OpenAI');
    expect(PROVIDERS).toContain('Anthropic');
  });
});
