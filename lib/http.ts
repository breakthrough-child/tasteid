export const json = (body: unknown, status = 200) => Response.json(body, { status });
export const err = (error: string, status = 400, extra: Record<string, unknown> = {}) => Response.json({ error, ...extra }, { status });
export const OPTIONS = () => new Response(null, { status: 204 });
