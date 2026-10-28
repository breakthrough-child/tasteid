import { DOMAINS } from '../domains';
import { explain, recommend, scopedTaste, search } from '../taste/service';

export const TOOLS = [
  { name: 'get_taste_profile', description: "Get the user's TasteID: archetype, taste DNA tags and top entities per domain (only domains the user has granted).", input_schema: { type: 'object', properties: {}, additionalProperties: false } },
  { name: 'recommend', description: "Personalised picks for the user in a domain, via Qloo's taste graph. Pass context.city for dining.", input_schema: { type: 'object', properties: { domain: { type: 'string', enum: [...DOMAINS] }, context: { type: 'object', properties: { city: { type: 'string' } } } }, required: ['domain'] } },
  { name: 'search_entities', description: 'Look up an entity (artist, movie, tv_show, place, brand, book, podcast, video_game, destination) by name.', input_schema: { type: 'object', properties: { query: { type: 'string' }, type: { type: 'string' } }, required: ['query', 'type'] } },
  { name: 'explain', description: 'Explain why an entity fits this user’s taste.', input_schema: { type: 'object', properties: { entity_id: { type: 'string' }, type: { type: 'string' } }, required: ['entity_id'] } },
];

export type ToolCtx = { passportId: string; scopes: string[] };
export async function runTool(ctx: ToolCtx, name: string, input: any): Promise<unknown> {
  try {
    if (name === 'get_taste_profile') return (await scopedTaste(ctx.passportId, ctx.scopes)) ?? { error: 'no profile' };
    if (name === 'recommend') { const r: any = await recommend(ctx.passportId, ctx.scopes, { domain: input.domain, context: input.context }); return r; }
    if (name === 'search_entities') return (await search(String(input.query), String(input.type))).map((e) => ({ id: e.id, name: e.name, type: e.type }));
    if (name === 'explain') return (await explain(ctx.passportId, String(input.entity_id), input.type)) ?? { error: 'not found' };
    return { error: `unknown tool ${name}` };
  } catch (e: any) { return { error: 'The taste graph is temporarily unavailable.', detail: String(e?.message || e) }; }
}
