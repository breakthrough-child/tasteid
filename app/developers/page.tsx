import DevConsole from '@/components/DevConsole';
import { SCOPES, SCOPE_LABEL } from '@/lib/domains';

const Code = ({ children }: { children: string }) => <pre className="overflow-auto rounded-xl bg-[#0b0d17] p-4 font-mono text-xs leading-relaxed text-[#f4f0e6]">{children}</pre>;
export default function Developers() {
  const origin = process.env.NEXT_PUBLIC_APP_URL || 'https://YOUR-TASTEID-HOST';
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="stamp">Developers</div>
      <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">Add “Sign in with Taste” in 3 lines.</h1>
      <p className="mt-3 text-mute">OAuth 2.0 authorization code + PKCE under the hood. Users share only the domains they tick. Solve cold start without collecting a single personal detail.</p>
      <Code>{`<script src="${origin}/sdk/tasteid.js"></script>
<div data-tasteid-button data-client-id="reelhouse" data-scopes="taste:film_tv" data-callback="onTaste"></div>
<script>onTaste = ({ api }) => api.recommend({ domain: 'film_tv', candidates: myCatalog }).then(console.log)</script>`}</Code>
      <h2 className="mt-10 font-display text-2xl font-semibold">Try it live</h2>
      <div className="mt-3"><DevConsole /></div>
      <h2 className="mt-10 font-display text-2xl font-semibold">Scopes</h2>
      <ul className="mt-2 grid gap-1 text-sm sm:grid-cols-2">{SCOPES.map((s) => <li key={s}><code className="font-mono text-accent">{s}</code> — {SCOPE_LABEL[s]}</li>)}</ul>
      <h2 className="mt-10 font-display text-2xl font-semibold">Endpoints</h2>
      <Code>{`GET  /authorize?client_id&redirect_uri&scope&state&code_challenge&code_challenge_method=S256
POST /api/oauth/token        {grant_type:"authorization_code", code, client_id, redirect_uri, code_verifier} → 1h JWT
GET  /api/v1/taste           Authorization: Bearer …   → only the scoped sections
POST /api/v1/recommend       {domain, candidates?:[{id,type}], context?:{city}}
                             → re-ranks YOUR catalog by the user's taste (or fresh picks), each with a "why"
POST /api/mcp                MCP (Streamable HTTP, JSON-RPC) — same tools, Bearer-authorised`}</Code>
      <p className="mt-2 text-sm text-mute">Every call re-checks the grant: revoke in My TasteID and the token returns 401 immediately.</p>
      <h2 className="mt-10 font-display text-2xl font-semibold">Connect an AI agent over MCP</h2>
      <p className="mt-2 text-sm text-mute">Obtain a token via the flow above (the console returns one to <code>tok.accessToken</code>), then add TasteID as a remote MCP server. Tools: <code>get_taste_profile</code>, <code>recommend</code>, <code>search_entities</code>, <code>explain</code>.</p>
      <Code>{`claude mcp add --transport http tasteid ${origin}/api/mcp --header "Authorization: Bearer <access_token>"

# or raw JSON-RPC
curl -X POST ${origin}/api/mcp -H "Authorization: Bearer <access_token>" \\
  -H "content-type: application/json" \\
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'`}</Code>
    </div>
  );
}
