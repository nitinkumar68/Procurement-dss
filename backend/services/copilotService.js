/**
 * copilotService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Isolated AI justification engine for ProcureSmart DSS.
 *
 * Responsibilities:
 *   1. Build a precision system prompt for corporate procurement reasoning.
 *   2. Call OpenAI Chat Completions (or Azure OpenAI via compatible base URL).
 *   3. Parse and validate the structured JSON response.
 *   4. Return a graceful heuristic fallback if the API is unavailable.
 *
 * Exports:
 *   generateCopilotJustification(inputData, recommendedModel, allocationFit)
 *     → Promise<string>  (the justification text)
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const OpenAI = require('openai');

// ── Lazy-init client (only created when a real key is present) ────────────────
let _client = null;

function getClient() {
  if (_client) return _client;

  const apiKey = process.env.OPENAI_API_KEY;

  // Azure OpenAI path
  const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const azureKey      = process.env.AZURE_OPENAI_KEY;

  if (azureEndpoint && azureKey) {
    _client = new OpenAI({
      apiKey:  azureKey,
      baseURL: `${azureEndpoint.replace(/\/$/, '')}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o-mini'}`,
      defaultQuery: { 'api-version': '2024-02-01' },
      defaultHeaders: { 'api-key': azureKey },
    });
    console.log('[Copilot] Azure OpenAI client initialised.');
    return _client;
  }

  // Standard OpenAI path
  if (apiKey && !apiKey.startsWith('sk-your-')) {
    _client = new OpenAI({ apiKey });
    console.log('[Copilot] OpenAI client initialised (model: %s).', process.env.OPENAI_MODEL || 'gpt-4o-mini');
    return _client;
  }

  // No valid key — will use fallback
  console.warn('[Copilot] No valid OPENAI_API_KEY found. Falling back to heuristic justification.');
  return null;
}

// ── System prompt ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `
You are ProcureSmart Copilot, a precision corporate procurement decision assistant
embedded inside an enterprise Decision Support System (DSS).

Your sole responsibility is to generate a structured, board-level strategic
justification for a procurement model recommendation that has already been
determined by the system's rule engine.

STRICT OUTPUT RULES:
1. Respond with ONLY a valid JSON object — no markdown, no backticks, no extra text.
2. The JSON must have exactly one key: "justification"
3. The value must be a single flowing paragraph of 2 to 4 sentences.
4. Tone: formal, analytical, corporate. Never casual.
5. Always reference the specific input parameters provided (budget, timeline,
   supplier density, material type). Do NOT invent numbers or facts.
6. Do NOT repeat the model name as a heading — weave it into the prose naturally.
7. End with a decisive, confident conclusion — this is a strategic recommendation.

EXAMPLE OUTPUT FORMAT:
{"justification": "Given the constrained vendor pool of a single qualified supplier..."}
`.trim();

// ── User prompt builder ───────────────────────────────────────────────────────
function buildUserPrompt(inputData, recommendedModel, allocationFit) {
  const budgetFormatted = new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(inputData.projectCapitalAllocation);

  return `
PROCUREMENT ASSESSMENT DATA:
─────────────────────────────
Recommended Model     : ${recommendedModel}
System Fit Score      : ${allocationFit}%
Budget Allocation     : ${budgetFormatted}
Supplier Density      : ${inputData.supplierDensity}
Delivery Timeline     : ${inputData.allocationTimeline}
Material Type         : ${inputData.materialClassification}
Pricing Matrix Status : ${inputData.pricingMatrixStatus}
─────────────────────────────

Generate the strategic justification JSON for why this procurement model was
selected given the above parameters.
`.trim();
}

// ── Heuristic fallback (used when AI is unavailable) ─────────────────────────
function heuristicFallback(inputData, recommendedModel, allocationFit) {
  const budgetFormatted = new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(inputData.projectCapitalAllocation);

  const scenarios = {
    'SOLE-SOURCE': `With only a single qualified vendor available for this contract, competitive bidding frameworks are structurally invalid. The system recommends initiating a transparent direct negotiation leveraging the full ${budgetFormatted} budget allocation, ensuring contractual compliance while eliminating artificial competition overhead. This approach maintains procurement integrity and accelerates time-to-contract under sole-source regulatory guidelines.`,

    'DUTCH': `Given the critically urgent delivery horizon of the ${inputData.allocationTimeline.toLowerCase()} classification, the Dutch Reverse Auction framework was selected to enforce immediate price convergence. The descending-price clock mechanism compels vendors to commit at their true cost floor within the ${budgetFormatted} budget envelope, bypassing the extended deliberation cycles that standard auction formats require. This model achieves ${allocationFit}% alignment with the operational timeline mandate.`,

    'JAPANESE': `The highly specialised and proprietary nature of the required materials necessitates a structured multi-round sealed bidding protocol to maintain cohort anonymity and prevent collusion among a limited vendor set. The Japanese Reverse Auction framework applies sequential declining target prices within the ${budgetFormatted} allocation, ensuring that technically complex procurement maintains compliance and price discovery integrity across all bidding rounds. System logic weight validates this model at ${allocationFit}%.`,

    'ENGLISH': `Given the ${budgetFormatted} allocation budget, broad market availability across multiple qualified suppliers, and a standard processing timeline, the English Reverse Auction framework delivers maximum competitive downward price pressure. By enforcing strict rank-only visibility, the protocol prevents bid-shadowing behaviours and compels each supplier to competitively undercut their own internal cost floor to achieve and maintain Rank #1 status. This model achieves a ${allocationFit}% system logic alignment score.`,
  };

  // Determine which scenario key applies
  const key = Object.keys(scenarios).find(k => recommendedModel.includes(k)) || 'ENGLISH';
  return scenarios[key];
}

// ── Main export ───────────────────────────────────────────────────────────────
async function generateCopilotJustification(inputData, recommendedModel, allocationFit) {
  const client = getClient();

  // No client → return heuristic immediately
  if (!client) {
    return heuristicFallback(inputData, recommendedModel, allocationFit);
  }

  const model   = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const userMsg = buildUserPrompt(inputData, recommendedModel, allocationFit);

  try {
    const completion = await client.chat.completions.create({
      model,
      temperature:      0.4,   // Low — consistent, professional, not creative
      max_tokens:       300,   // 2-4 sentences is plenty
      response_format:  { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: userMsg },
      ],
    });

    const raw  = completion.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(raw);

    if (!parsed.justification || typeof parsed.justification !== 'string') {
      throw new Error('AI response missing "justification" field.');
    }

    console.log('[Copilot] AI justification generated successfully (%d tokens used).',
      completion.usage?.total_tokens ?? '?');

    return parsed.justification.trim();

  } catch (err) {
    // Log the real error but never surface it to the client
    console.error('[Copilot] AI call failed — using heuristic fallback. Reason:', err.message);
    return heuristicFallback(inputData, recommendedModel, allocationFit);
  }
}

module.exports = { generateCopilotJustification };
