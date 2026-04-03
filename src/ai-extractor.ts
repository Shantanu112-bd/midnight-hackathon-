/**
 * ProofWork AI Extractor
 * Uses Anthropic Claude API to extract workplace promises from meeting transcripts.
 *
 * Features:
 *   - extractPromise(transcript)  — AI-powered promise extraction
 *   - hashPromise(promise)        — deterministic SHA-256 hash for on-chain storage
 *   - Mock mode (MOCK_AI=true)    — returns hardcoded test data without API calls
 *   - Graceful fallback           — returns safe mock data if API fails
 */

import Anthropic from '@anthropic-ai/sdk';
import { createHash } from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// ────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────

/** The structured promise extracted by Claude */
export interface PromiseDetails {
  description: string;
  condition: string;
  reward: string;
  deadline: string;
  promiserRole: 'manager' | 'employee';
  confidence: number;
}

/** Full extraction result returned by extractPromise() */
export interface ExtractionResult {
  hasPromise: boolean;
  promise: PromiseDetails | null;
  rawText: string;
  warningMessage: string | null;
}

// ────────────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────────────

const MODEL = 'claude-sonnet-4-5';

const SYSTEM_PROMPT = `You are a workplace accountability analyst. Your job is to extract explicit, specific promises from meeting transcripts.

RULES — follow these exactly:
1. Be CONSERVATIVE. Only extract explicit, specific, actionable promises.
2. Do NOT extract vague encouragements like "we'll see", "maybe", "I'll try", "let's think about it", "potentially".
3. Only extract commitments that have ALL of:
   - A clear ACTION (what will be done)
   - A clear BENEFICIARY (who benefits)
   - Specificity (not just good intentions)
4. If the transcript has no clear promise, set hasPromise to false.
5. The "promiserRole" must be either "manager" or "employee" — whoever is making the promise.
6. Set "confidence" between 0 and 1: 
   - 0.9-1.0 = explicit written/verbal commitment with specifics
   - 0.7-0.8 = strong verbal commitment but missing some detail
   - 0.5-0.6 = implied but somewhat ambiguous
   - Below 0.5 = do NOT extract (set hasPromise to false)
7. "deadline" should be extracted if mentioned, otherwise "not specified".
8. "condition" is what must happen first (e.g. "after project completion").
9. "reward" is what the employee receives (e.g. "promotion to Senior Engineer").

CRITICAL: Return ONLY valid JSON. No markdown fences, no preamble, no explanation. Just the raw JSON object.

Response schema:
{
  "hasPromise": boolean,
  "promise": {
    "description": string,
    "condition": string,
    "reward": string,
    "deadline": string,
    "promiserRole": "manager" | "employee",
    "confidence": number
  } | null,
  "rawText": string,
  "warningMessage": string | null
}

If hasPromise is false, set promise to null and provide a warningMessage explaining why no promise was found.
Set rawText to the most relevant excerpt from the transcript (max 200 chars).`;

// ────────────────────────────────────────────────────────────────────
// Mock Data
// ────────────────────────────────────────────────────────────────────

const MOCK_PROMISE_RESULT: ExtractionResult = {
  hasPromise: true,
  promise: {
    description: 'Promotion to Senior Engineer after completing the Q3 migration project',
    condition: 'Successful completion of the Q3 database migration project',
    reward: 'Promotion to Senior Engineer with 15% salary increase',
    deadline: 'End of Q3 2025',
    promiserRole: 'manager',
    confidence: 0.92,
  },
  rawText: 'Manager: "Once you finish the Q3 migration, I will put through your promotion to Senior Engineer with a 15% raise."',
  warningMessage: null,
};

const MOCK_NO_PROMISE_RESULT: ExtractionResult = {
  hasPromise: false,
  promise: null,
  rawText: '',
  warningMessage: 'No explicit, actionable workplace promise was found in the provided transcript. The text may contain vague encouragements or general discussion but no specific commitments.',
};

// ────────────────────────────────────────────────────────────────────
// Core: extractPromise
// ────────────────────────────────────────────────────────────────────

/**
 * Extract a workplace promise from a meeting transcript using Claude AI.
 *
 * - If MOCK_AI=true in env, returns hardcoded test data.
 * - If Claude API fails, returns a graceful fallback mock.
 *
 * @param transcript - The meeting transcript text to analyze
 * @returns Structured extraction result
 */
export async function extractPromise(transcript: string): Promise<ExtractionResult> {
  // ── Guard: empty input ──────────────────────────────────────────
  if (!transcript || transcript.trim().length === 0) {
    return {
      hasPromise: false,
      promise: null,
      rawText: '',
      warningMessage: 'Empty transcript provided. Please provide meeting text to analyze.',
    };
  }

  // ── Mock mode ───────────────────────────────────────────────────
  const isMockMode = process.env.MOCK_AI === 'true' || process.env.MOCK_MODE === 'true';
  if (isMockMode) {
    console.log('🧪 AI Extractor: Mock mode enabled — returning test data');
    // Simulate some processing time
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Return mock data with the actual rawText from transcript
    const result = { ...MOCK_PROMISE_RESULT };
    result.rawText = transcript.substring(0, 200);
    return result;
  }

  // ── Real API call ───────────────────────────────────────────────
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === 'your_anthropic_api_key') {
      console.warn('⚠  No valid ANTHROPIC_API_KEY found — falling back to mock mode');
      return {
        ...MOCK_PROMISE_RESULT,
        rawText: transcript.substring(0, 200),
        warningMessage: 'Running in demo mode (no API key). This is mock data.',
      };
    }

    console.log(`► AI Extractor: Calling ${MODEL}...`);
    const anthropic = new Anthropic({ apiKey });

    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Analyze this meeting transcript and extract any workplace promises:\n\n---\n${transcript}\n---`,
        },
      ],
    });

    // Extract text content from the response
    const responseText = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('');

    console.log(`✓ AI Extractor: Response received (${responseText.length} chars)`);

    // Parse JSON — Claude should return raw JSON per system prompt
    const parsed = parseClaudeResponse(responseText);
    return parsed;
  } catch (error: any) {
    console.error('✗ AI Extractor: Claude API failed:', error.message || error);

    // Graceful fallback — never crash the demo
    return {
      ...MOCK_PROMISE_RESULT,
      rawText: transcript.substring(0, 200),
      warningMessage: `AI extraction failed (${error.message || 'unknown error'}). Showing fallback demo data.`,
    };
  }
}

// ────────────────────────────────────────────────────────────────────
// Response Parsing
// ────────────────────────────────────────────────────────────────────

/**
 * Parse and validate the JSON response from Claude.
 * Handles edge cases like markdown fences, extra text, invalid JSON.
 */
function parseClaudeResponse(raw: string): ExtractionResult {
  let cleaned = raw.trim();

  // Strip markdown code fences if Claude included them despite instructions
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  // Try to find JSON object boundaries if there's extra text
  const jsonStart = cleaned.indexOf('{');
  const jsonEnd = cleaned.lastIndexOf('}');
  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    cleaned = cleaned.slice(jsonStart, jsonEnd + 1);
  }

  try {
    const parsed = JSON.parse(cleaned);

    // Validate and normalize the parsed result
    const result: ExtractionResult = {
      hasPromise: Boolean(parsed.hasPromise),
      promise: null,
      rawText: String(parsed.rawText || ''),
      warningMessage: parsed.warningMessage ? String(parsed.warningMessage) : null,
    };

    if (parsed.hasPromise && parsed.promise) {
      result.promise = {
        description: String(parsed.promise.description || ''),
        condition: String(parsed.promise.condition || 'not specified'),
        reward: String(parsed.promise.reward || 'not specified'),
        deadline: String(parsed.promise.deadline || 'not specified'),
        promiserRole: parsed.promise.promiserRole === 'employee' ? 'employee' : 'manager',
        confidence: Math.min(1, Math.max(0, Number(parsed.promise.confidence) || 0)),
      };

      // If confidence is too low, downgrade to no-promise
      if (result.promise.confidence < 0.5) {
        result.hasPromise = false;
        result.warningMessage = `Promise found but confidence too low (${result.promise.confidence}). Not recording.`;
        result.promise = null;
      }
    }

    return result;
  } catch (parseError: any) {
    console.error('✗ Failed to parse Claude response as JSON:', parseError.message);
    console.error('  Raw response was:', raw.substring(0, 300));

    return {
      ...MOCK_NO_PROMISE_RESULT,
      rawText: raw.substring(0, 200),
      warningMessage: `AI returned unparseable response. Please try again.`,
    };
  }
}

// ────────────────────────────────────────────────────────────────────
// hashPromise — deterministic SHA-256 for on-chain storage
// ────────────────────────────────────────────────────────────────────

/**
 * Create a deterministic SHA-256 hash of a promise object.
 * The hash is used as the on-chain promiseHash in the Compact contract.
 *
 * Fields are sorted and concatenated in a canonical order to ensure
 * the same promise always produces the same hash regardless of
 * object property ordering.
 *
 * @param promise - The structured promise data to hash
 * @returns 64-char lowercase hex SHA-256 hash string
 */
export function hashPromise(promise: PromiseDetails): string {
  // Canonical representation: sorted keys, JSON-stringified values
  const canonical = [
    `condition:${promise.condition}`,
    `confidence:${promise.confidence}`,
    `deadline:${promise.deadline}`,
    `description:${promise.description}`,
    `promiserRole:${promise.promiserRole}`,
    `reward:${promise.reward}`,
  ].join('|');

  return createHash('sha256').update(canonical, 'utf-8').digest('hex');
}

/**
 * Convert a SHA-256 hex hash string to a 32-byte Uint8Array
 * for use with the Compact contract's Bytes<32> type.
 */
export function hashToBytes32(hexHash: string): Uint8Array {
  const clean = hexHash.startsWith('0x') ? hexHash.slice(2) : hexHash;
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    bytes[i] = parseInt(clean.substr(i * 2, 2), 16);
  }
  return bytes;
}

// ────────────────────────────────────────────────────────────────────
// Legacy compat — keep old export name working
// ────────────────────────────────────────────────────────────────────

/** @deprecated Use extractPromise() instead */
export async function extractProofData(input: string): Promise<string> {
  const result = await extractPromise(input);
  if (result.hasPromise && result.promise) {
    return JSON.stringify(result.promise);
  }
  return JSON.stringify({ warning: result.warningMessage, rawText: result.rawText });
}
