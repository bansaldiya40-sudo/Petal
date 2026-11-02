// server/llmService.js
// Handles real LLM generation, connection testing, secrets management, and telemetry logging.
import fs from 'fs';
import path from 'path';
import { DATA_DIR } from './db.js';

const SECRETS_FILE = path.join(DATA_DIR, 'secrets.json');

// Preferred order of reliable fast models available on Google Generative Language API
const GEMINI_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3.5-flash',
  'gemini-3.6-flash'
];

// In-memory telemetry log buffer (last 50 generation calls)
const callLogs = [];

export function getCallLogs() {
  return [...callLogs];
}

export function getLastCallLog() {
  return callLogs.length > 0 ? callLogs[callLogs.length - 1] : null;
}

export function isSecretKey(k) {
  if (!k) return false;
  return /key|secret|token|password|auth/i.test(k);
}

export function maskSecret(val) {
  if (!val || typeof val !== 'string') return '';
  return '••••••••••••••••';
}

function recordLog(entry) {
  callLogs.push(entry);
  if (callLogs.length > 50) callLogs.shift();
  console.log(
    `[LLM_LOG] ${entry.timestamp} | model: ${entry.model} | latency: ${entry.latencyMs}ms | status: ${entry.status} | tokens: in=${entry.promptTokens || 0}, out=${entry.outputTokens || 0}${entry.error ? ` | error: ${entry.error}` : ''}`
  );
}

// -------------------------------------------------------------
// SECRETS MANAGEMENT (Stored on backend only in <DATA_DIR>/secrets.json)
// -------------------------------------------------------------
export function getSecrets() {
  let secrets = {};
  if (fs.existsSync(SECRETS_FILE)) {
    try {
      secrets = JSON.parse(fs.readFileSync(SECRETS_FILE, 'utf-8'));
    } catch (_) {}
  }

  // Fallback to process.env if not in file
  if (!secrets.geminiKey && process.env.GEMINI_API_KEY) {
    secrets.geminiKey = process.env.GEMINI_API_KEY.trim();
  }
  if (!secrets.claudeKey && process.env.CLAUDE_API_KEY) {
    secrets.claudeKey = process.env.CLAUDE_API_KEY.trim();
  }
  return secrets;
}

export function saveSecrets(updates) {
  const current = getSecrets();
  const merged = { ...current };

  for (const [key, val] of Object.entries(updates)) {
    if (val === '••••••••••••••••' || val === undefined || val === null) {
      // Do not overwrite existing secret with masked placeholder
      continue;
    }
    if (typeof val === 'string' && val.trim().length > 0) {
      merged[key] = val.trim();
    } else if (val === '') {
      delete merged[key];
    }
  }

  fs.writeFileSync(SECRETS_FILE, JSON.stringify(merged, null, 2), 'utf-8');
  return merged;
}

// -------------------------------------------------------------
// TEST AI CONNECTION
// Makes a tiny live request, returns status or friendly sanitized error
// -------------------------------------------------------------
export async function testAiConnection(engine = 'gemini') {
  const secrets = getSecrets();
  const apiKey = engine === 'claude' ? secrets.claudeKey : secrets.geminiKey;

  if (!apiKey || apiKey.trim().length === 0) {
    return {
      connected: false,
      error: `No API key configured for ${engine === 'claude' ? 'Claude' : 'Google Gemini'}. Please enter an API key in Settings.`,
    };
  }

  if (engine === 'gemini') {
    const model = GEMINI_MODELS[0];
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const start = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Respond with exactly: "OK"' }] }],
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const latencyMs = Date.now() - start;

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        const rawMsg = errorJson?.error?.message || res.statusText;
        let friendly = `Connection error (${res.status})`;

        if (res.status === 400 || rawMsg.toLowerCase().includes('api key')) {
          friendly = 'Invalid API key. Please check your Gemini key.';
        } else if (res.status === 429 || rawMsg.toLowerCase().includes('quota')) {
          friendly = 'Quota exceeded or rate-limited by Gemini.';
        } else if (res.status === 404) {
          friendly = `Model ${model} not available on this API version.`;
        } else if (res.status === 503) {
          friendly = 'Gemini service is temporarily busy (503).';
        }

        recordLog({
          timestamp: new Date().toISOString(),
          model,
          task: 'test-connection',
          latencyMs,
          status: 'ERROR',
          error: friendly,
        });

        return { connected: false, error: friendly, status: res.status };
      }

      recordLog({
        timestamp: new Date().toISOString(),
        model,
        task: 'test-connection',
        latencyMs,
        status: 'SUCCESS',
      });

      return {
        connected: true,
        model,
        latencyMs,
      };
    } catch (err) {
      clearTimeout(timeout);
      const isAbort = err.name === 'AbortError';
      const msg = isAbort ? 'Connection timed out (12s).' : `Network error: ${err.message}`;

      recordLog({
        timestamp: new Date().toISOString(),
        model,
        task: 'test-connection',
        latencyMs: Date.now() - start,
        status: 'ERROR',
        error: msg,
      });

      return { connected: false, error: msg };
    }
  }

  return { connected: false, error: `Testing for engine "${engine}" is not supported.` };
}

// -------------------------------------------------------------
// CHECK VIDEO MODEL
// -------------------------------------------------------------
export async function checkVideoModel(modelName) {
  if (!modelName || modelName.trim().length === 0) {
    return { exists: false, message: 'Model name cannot be empty.' };
  }
  const cleanName = modelName.trim();
  const secrets = getSecrets();
  const apiKey = secrets.geminiKey || secrets.videoApiKey;

  if (!apiKey) {
    return { exists: false, message: 'Gemini or Video API key required to verify model.' };
  }

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (!res.ok) {
      // Common models
      if (cleanName.includes('veo') || cleanName.includes('gemini')) {
        return {
          exists: true,
          model: cleanName,
          message: `Model format recognized: ${cleanName}`,
        };
      }
      return { exists: false, message: `Could not verify model (Provider status ${res.status}).` };
    }
    const data = await res.json();
    const models = data?.models || [];
    const found = models.find(
      (m) =>
        m.name === `models/${cleanName}` ||
        m.name === cleanName ||
        m.displayName?.toLowerCase() === cleanName.toLowerCase()
    );

    if (found) {
      return {
        exists: true,
        model: found.name.replace('models/', ''),
        displayName: found.displayName || cleanName,
        message: `Verified: ${found.displayName || found.name}`,
      };
    } else {
      if (cleanName.includes('veo') || cleanName.includes('gemini')) {
        return {
          exists: true,
          model: cleanName,
          message: `Model format valid: ${cleanName}`,
        };
      }
      return {
        exists: false,
        message: `Model "${cleanName}" not found in provider model catalog.`,
      };
    }
  } catch (err) {
    return { exists: false, message: `Check failed: ${err.message}` };
  }
}

// -------------------------------------------------------------
// CALL GEMINI (With auto-fallback on 503/429/timeout)
// -------------------------------------------------------------
export async function callGemini(prompt, systemInstruction = '', options = {}) {
  const secrets = getSecrets();
  const apiKey = secrets.geminiKey;

  if (!apiKey) {
    throw new Error('No Gemini API key configured. Please set your key in Settings.');
  }

  const modelsToTry = options.model ? [options.model, ...GEMINI_MODELS.filter((m) => m !== options.model)] : GEMINI_MODELS;
  let lastError = null;

  for (const model of modelsToTry) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const start = Date.now();
    const timeoutMs = options.timeoutMs || 35000;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const bodyPayload = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: options.temperature ?? 0.25,
        topP: 0.95,
        maxOutputTokens: options.maxOutputTokens ?? 3200,
      },
    };

    if (systemInstruction) {
      bodyPayload.systemInstruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    if (options.jsonMode) {
      bodyPayload.generationConfig.responseMimeType = 'application/json';
    }

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const latencyMs = Date.now() - start;

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const errMsg = errData?.error?.message || `HTTP ${res.status}: ${res.statusText}`;

        recordLog({
          timestamp: new Date().toISOString(),
          model,
          task: options.task || 'generate',
          latencyMs,
          status: 'ERROR',
          error: errMsg,
        });

        // If 503 or 429, try next model
        if (res.status === 503 || res.status === 429) {
          console.warn(`[LLM] Model ${model} returned ${res.status}, falling back to next model...`);
          lastError = new Error(`Model ${model} returned ${res.status}: ${errMsg}`);
          continue;
        }

        throw new Error(`Gemini API Error: ${errMsg}`);
      }

      const data = await res.json();
      const candidate = data?.candidates?.[0];
      const replyText = candidate?.content?.parts?.[0]?.text || '';
      const usage = data?.usageMetadata || {};

      recordLog({
        timestamp: new Date().toISOString(),
        model,
        task: options.task || 'generate',
        promptTokens: usage.promptTokenCount || 0,
        outputTokens: usage.candidatesTokenCount || 0,
        latencyMs,
        status: 'SUCCESS',
      });

      return {
        text: replyText,
        usage,
        latencyMs,
        model,
      };
    } catch (err) {
      clearTimeout(timeout);
      const isAbort = err.name === 'AbortError';
      const message = isAbort ? `Request timed out after ${timeoutMs / 1000}s on ${model}` : err.message;

      lastError = new Error(message);

      if (isAbort) {
        console.warn(`[LLM] Model ${model} timed out, trying fallback model...`);
        continue;
      }
      if (err.message.includes('fetch failed')) {
        continue;
      }
      throw err;
    }
  }

  throw lastError || new Error('All Gemini models failed.');
}
