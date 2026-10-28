import { llm, llmEnabled, llmModel } from '../llm';
import { DOMAIN_META, type Domain } from '../domains';

const NOUN: Record<Domain, string> = { music: 'Listener', film_tv: 'Cinephile', dining: 'Epicure', brands: 'Curator', books: 'Bookworm', podcasts: 'Wanderer', games: 'Player', travel: 'Explorer' };
const cap = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase());

export async function makeArchetype(dna: string[], lead: Domain, seeds: string[]): Promise<{ label: string; blurb: string }> {
  const rule = {
    label: `The ${cap(dna[0] || 'Open')} ${NOUN[lead]}`,
    blurb: `Drawn to ${dna.slice(0, 3).join(', ') || 'a wide mix of things'}, with a ${DOMAIN_META[lead].label.toLowerCase()} lean.`,
  };
  if (!llmEnabled()) return rule;
  try {
    const r = await llm().chat.completions.create({
      model: llmModel(), max_tokens: 120,
      messages: [{ role: 'user', content: `Taste DNA tags: ${dna.join(', ')}. They love: ${seeds.join(', ')}. Reply as JSON only: {"label":"The ... (2-4 words, evocative)","blurb":"one sentence under 140 chars, second person"}` }],
    }, { timeout: 8000 });
    const t = r.choices[0]?.message?.content || '';
    const j = JSON.parse(t.slice(t.indexOf('{'), t.lastIndexOf('}') + 1));
    return j.label && j.blurb ? j : rule;
  } catch { return rule; }
}
