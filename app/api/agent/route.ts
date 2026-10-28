import type OpenAI from 'openai';
import { llm, llmEnabled, llmModel } from '@/lib/llm';
import { sessionPassportId } from '../../../lib/auth';
import { SCOPES } from '../../../lib/domains';
import { err, json } from '../../../lib/http';
import { runTool, TOOLS } from '../../../lib/agent/tools';
import { loadPassport } from '../../../lib/taste/service';

export const maxDuration = 60;
const SYS_PLAIN = 'You are a helpful assistant. Answer concisely (under 180 words). You know nothing about the user personally.';
const SYS_TASTE = 'You are a personal concierge with access to the user\'s TasteID (a portable, anonymous taste profile) through tools. Call get_taste_profile first, then recommend/search_entities/explain as needed (max a few calls). Ground every suggestion in their taste and say briefly why. Concise: under 220 words, no preamble.';

export async function POST(req: Request) {
  const { prompt, mode } = await req.json();
  if (!prompt) return err('prompt required');
  if (!llmEnabled()) return json(await fallback(String(prompt), mode));
  const c = llm();
  const tools: OpenAI.ChatCompletionTool[] = TOOLS.map((t) => ({ type: 'function', function: { name: t.name, description: t.description, parameters: t.input_schema as any } }));
  try {
    if (mode === 'plain') {
      const r = await c.chat.completions.create({ model: llmModel(), max_tokens: 500, messages: [{ role: 'system', content: SYS_PLAIN }, { role: 'user', content: prompt }] });
      return json({ text: (r.choices[0]?.message?.content || '').trim(), trace: [] });
    }
    const pid = await sessionPassportId();
    if (!pid) return err('Create your TasteID first.', 401);
    const ctx = { passportId: pid, scopes: SCOPES };
    const messages: OpenAI.ChatCompletionMessageParam[] = [{ role: 'system', content: SYS_TASTE }, { role: 'user', content: prompt }];
    const trace: { tool: string; input: unknown; output: unknown }[] = [];
    for (let step = 0; step < 7; step++) {
      const noTools = trace.length >= 6;
      const r = await c.chat.completions.create({ model: llmModel(), max_tokens: 900, messages, ...(noTools ? {} : { tools }) });
      const msg = r.choices[0]?.message;
      const calls = (msg?.tool_calls || []).filter((t) => t.type === 'function') as OpenAI.ChatCompletionMessageFunctionToolCall[];
      if (!calls.length || noTools) return json({ text: (msg?.content || '').trim(), trace });
      messages.push(msg as any);
      for (const u of calls) {
        let input: any = {}; try { input = JSON.parse(u.function.arguments || '{}'); } catch {}
        const out = trace.length >= 6 ? { error: 'tool budget used' } : await runTool(ctx, u.function.name, input);
        if (trace.length < 6) trace.push({ tool: u.function.name, input, output: out });
        messages.push({ role: 'tool', tool_call_id: u.id, content: JSON.stringify(out).slice(0, 6000) });
      }
    }
    return json({ text: 'I ran out of steps — try a narrower question.', trace });
  } catch (e: any) { return err('The assistant is unavailable right now.', 502, { detail: String(e?.message || e) }); }
}

async function fallback(prompt: string, mode: string) {
  const note = 'Templated answer — LLM_API_KEY is not set, so no live model was called.';
  if (mode === 'plain') return { text: `Here are some popular, generally-liked options for "${prompt}": a well-reviewed local spot, a crowd-pleasing classic, and something trending this week. (I don't know your taste, so these are the same for everyone.)`, trace: [], fallback: note };
  const pid = await sessionPassportId();
  if (!pid) return { text: 'Create your TasteID first.', trace: [], fallback: note };
  const ctx = { passportId: pid, scopes: SCOPES };
  const taste: any = await runTool(ctx, 'get_taste_profile', {});
  const domain = /watch|movie|show|tv/i.test(prompt) ? 'film_tv' : /eat|dinner|saturday|food|restaurant/i.test(prompt) ? 'dining' : /gift|buy|shop/i.test(prompt) ? 'brands' : /playlist|road|music/i.test(prompt) ? 'music' : 'film_tv';
  const rec: any = await runTool(ctx, 'recommend', { domain, context: { city: 'New York' } });
  const items = (rec.items || []).slice(0, 4);
  return {
    text: `As ${taste.archetype?.label || 'someone with great taste'}, try: ${items.map((i: any) => `${i.name} (${i.why})`).join('; ') || 'nothing found yet'}.`,
    trace: [{ tool: 'get_taste_profile', input: {}, output: { archetype: taste.archetype } }, { tool: 'recommend', input: { domain }, output: { count: items.length } }],
    fallback: note,
  };
}
