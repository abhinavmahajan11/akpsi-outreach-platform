import { NextResponse } from 'next/server';

/**
 * POST /api/generate-email
 *
 * Generates a cold outreach email draft via the Anthropic Messages API.
 * Runs server-side ONLY — ANTHROPIC_API_KEY must never reach the browser
 * bundle (unlike NEXT_PUBLIC_SUPABASE_*, which is safe to inline because
 * Supabase Row-Level Security is the real access boundary; here the API
 * key itself IS the credential, so it stays server-only).
 */

const ANTHROPIC_MODEL = 'claude-opus-5';
const ANTHROPIC_VERSION = '2023-06-01';
const REQUEST_TIMEOUT_MS = 30_000;

interface GenerateEmailRequestBody {
  orgName?: string;
  contactName?: string;
  context?: string;
  tone?: string;
}

interface GenerateEmailResult {
  subject: string;
  body: string;
}

const SYSTEM_PROMPT = `You write cold outreach emails on behalf of Alpha Kappa Psi (AKPsi), a professional business fraternity, reaching out to external organizations to explore partnerships (recruiting info sessions, workshops, sponsorships). Write concise, professional emails personalized to the recipient and organization. Respond with a single JSON object containing exactly two string fields, "subject" and "body" — no markdown, no code fences, no commentary outside the JSON object.`;

function buildUserPrompt({
  orgName,
  contactName,
  context,
  tone,
}: Required<Pick<GenerateEmailRequestBody, 'orgName' | 'contactName'>> &
  Pick<GenerateEmailRequestBody, 'context' | 'tone'>): string {
  const firstName = contactName.split(' ')[0] || contactName;
  const toneLabel = tone?.trim() || 'warm-professional';

  return [
    `Write a cold outreach email to ${firstName} at ${orgName} on behalf of AKPsi.`,
    `Tone: ${toneLabel}.`,
    context?.trim() ? `Additional context from the sender: ${context.trim()}` : null,
    'Keep it under ~150 words. Focus on exploring a partnership (recruiting info session, workshop, or sponsorship) and suggest a brief call. Sign off generically — e.g. "[Your Name]" and "[Committee] — AKPsi" — since the sender fills those in themselves.',
  ]
    .filter(Boolean)
    .join('\n');
}

/** Parses the model's JSON output; falls back to raw text as the body if parsing fails. */
function parseEmailResult(rawText: string): GenerateEmailResult {
  try {
    const parsed = JSON.parse(rawText);
    if (typeof parsed.subject === 'string' && typeof parsed.body === 'string') {
      return { subject: parsed.subject, body: parsed.body };
    }
  } catch {
    // Model didn't return valid JSON — fall through to the raw-text fallback.
  }
  return {
    subject: '',
    body: rawText || 'The AI response could not be parsed. Please try again.',
  };
}

export async function POST(request: Request) {
  let payload: GenerateEmailRequestBody;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { orgName, contactName, context, tone } = payload;
  if (!orgName?.trim() || !contactName?.trim()) {
    return NextResponse.json(
      { error: 'orgName and contactName are required.' },
      { status: 400 },
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('generate-email: ANTHROPIC_API_KEY is not set');
    return NextResponse.json(
      { error: 'AI email generation is not configured on the server.' },
      { status: 500 },
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let anthropicRes: Response;
  try {
    anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [
          { role: 'user', content: buildUserPrompt({ orgName, contactName, context, tone }) },
        ],
        // Constrain output to { subject, body } so parsing is reliable; we still
        // parse defensively below since a refusal or hiccup can bypass this.
        output_config: {
          effort: 'low',
          format: {
            type: 'json_schema',
            schema: {
              type: 'object',
              properties: {
                subject: { type: 'string' },
                body: { type: 'string' },
              },
              required: ['subject', 'body'],
              additionalProperties: false,
            },
          },
        },
      }),
      signal: controller.signal,
    });
  } catch (err) {
    const isAbort = err instanceof Error && err.name === 'AbortError';
    console.error('generate-email: request to Anthropic failed', err);
    return NextResponse.json(
      {
        error: isAbort
          ? 'AI generation timed out. Please try again.'
          : 'Could not reach the AI service. Please try again.',
      },
      { status: 502 },
    );
  } finally {
    clearTimeout(timeout);
  }

  if (!anthropicRes.ok) {
    const errBody = await anthropicRes.text().catch(() => '');
    console.error('generate-email: Anthropic API returned', anthropicRes.status, errBody);

    if (anthropicRes.status === 429) {
      return NextResponse.json(
        { error: 'AI service is busy right now. Please try again in a moment.' },
        { status: 429 },
      );
    }
    if (anthropicRes.status === 401 || anthropicRes.status === 403) {
      // Never surface auth details — this means the server's key is wrong, not the user's fault.
      return NextResponse.json(
        { error: 'AI email generation is temporarily unavailable.' },
        { status: 500 },
      );
    }
    return NextResponse.json(
      { error: 'AI email generation failed. Please try again.' },
      { status: 502 },
    );
  }

  const data = await anthropicRes.json();

  if (data.stop_reason === 'refusal') {
    return NextResponse.json(
      { error: 'The AI declined to draft this email. Try adjusting the context.' },
      { status: 422 },
    );
  }

  const textBlock = Array.isArray(data.content)
    ? data.content.find((block: { type?: string }) => block.type === 'text')
    : undefined;
  const rawText: string = textBlock?.text ?? '';

  return NextResponse.json(parseEmailResult(rawText), { status: 200 });
}
