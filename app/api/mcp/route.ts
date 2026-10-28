import { authBearer } from '@/lib/auth';
import { runTool, TOOLS } from '@/lib/agent/tools';
export { OPTIONS } from '@/lib/http';

// Minimal remote MCP server (Streamable HTTP, JSON responses). Authorised by a TasteID bearer token.
const rpc = (id: any, result: unknown) => Response.json({ jsonrpc: '2.0', id, result });
const rpcErr = (id: any, code: number, message: string) => Response.json({ jsonrpc: '2.0', id, error: { code, message } });

export async function POST(req: Request) {
  const ctx = await authBearer(req);
  if (!ctx) return new Response(JSON.stringify({ error: 'invalid_token' }), { status: 401, headers: { 'content-type': 'application/json', 'WWW-Authenticate': 'Bearer' } });
  const m = await req.json().catch(() => null);
  if (!m) return rpcErr(null, -32700, 'Parse error');
  if (m.id === undefined) return new Response(null, { status: 202 }); // notification
  switch (m.method) {
    case 'initialize': return rpc(m.id, { protocolVersion: '2025-03-26', capabilities: { tools: {} }, serverInfo: { name: 'tasteid', version: '0.1.0' } });
    case 'ping': return rpc(m.id, {});
    case 'tools/list': return rpc(m.id, { tools: TOOLS.map((t) => ({ name: t.name, description: t.description, inputSchema: t.input_schema })) });
    case 'tools/call': {
      const out = await runTool({ passportId: ctx.passportId, scopes: ctx.scopes }, m.params?.name, m.params?.arguments || {});
      return rpc(m.id, { content: [{ type: 'text', text: JSON.stringify(out) }], isError: !!(out as any)?.error });
    }
    default: return rpcErr(m.id, -32601, `Method not found: ${m.method}`);
  }
}
export async function GET() { return new Response('TasteID MCP endpoint. POST JSON-RPC with a Bearer token.', { status: 405 }); }
