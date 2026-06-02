// AI mode: Korean profile -> English-optimized AGENTS.md via the OpenAI API.
// Zero dependencies: uses the global fetch (Node 18+).
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

export function resolveModel(model) {
  return model || process.env.OPENAI_MODEL || 'gpt-4o-mini';
}

export function buildAgentsMessages(profile) {
  const system =
    'You are a senior engineer authoring an AGENTS.md file that AI coding agents ' +
    '(Codex, Claude Code, Cursor) will read as project instructions. ' +
    'Output ONLY the AGENTS.md content as English Markdown — no preamble and no surrounding code fences. ' +
    'Translate any Korean input into clear, concise English. ' +
    'Prefer short, concrete, imperative rules. Keep token usage low: no filler.';

  const sections = [
    'Project (name + one-line purpose)',
    'Tech stack',
    'Commands (install, run, test, lint, build)',
    'Conventions',
    'Do NOT (hard constraints)',
    'Security',
    'Definition of done (review checklist)',
    'Current priorities',
  ];

  const user =
    'Create an AGENTS.md for this project. Use these as H2 (`##`) headings where applicable:\n' +
    sections.map((s) => `- ${s}`).join('\n') +
    '\n\nProject profile (JSON; may contain Korean — translate to English):\n' +
    '```json\n' +
    JSON.stringify(profile, null, 2) +
    '\n```';

  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];
}

export async function generateAgentsViaAI(profile, opts = {}) {
  const apiKey = opts.apiKey || process.env.OPENAI_API_KEY;
  const model = resolveModel(opts.model);
  if (!apiKey) {
    throw new Error(
      'OPENAI_API_KEY is not set. Set it to use --ai, or run `agentsmd gen` (template mode) without --ai.'
    );
  }
  let res;
  try {
    res = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: buildAgentsMessages(profile),
        temperature: 0.2,
      }),
    });
  } catch (e) {
    throw new Error(`Network error calling OpenAI: ${e.message}`);
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(
      `OpenAI API error ${res.status}. ${text.slice(0, 300)}\n` +
        '(If the model is wrong, set OPENAI_MODEL to a model your key can access.)'
    );
  }
  const data = await res.json();
  const content = data && data.choices && data.choices[0] && data.choices[0].message
    ? data.choices[0].message.content
    : null;
  if (!content) throw new Error('OpenAI API returned no content.');
  return content.trim() + '\n';
}
