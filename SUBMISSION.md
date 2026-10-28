# TasteID — Devpost submission text

## Inspiration
Every new app, streaming service and AI assistant greets you with the same generic cold-start screen, then slowly learns what you already know about yourself. We asked: why isn't taste portable? "Sign in with Google" solved identity. Nothing solves taste — and agents make it urgent, because an AI concierge is only as good as what it knows about you.

## What it does
TasteID is an anonymous, user-owned taste passport. In ~60 seconds you name things you love; Qloo's taste graph expands them across music, film & TV, dining, brands, books, podcasts, games and travel, producing a shareable passport card with a "taste archetype". Any app or agent can then add **Sign in with Taste** (OAuth 2.0 + PKCE) and personalize from the first second. Users tick exactly which domains to share, see every connected app, and revoke instantly. No name, no email, no history — ever.
Three fictional demo apps (Reelhouse, Forkful, Threadline) show a before/after of their own catalogs, and an agent playground compares a plain AI to one using TasteID through real tool calls (also exposed as a remote MCP server).

## How we built it
Next.js 15 (App Router) + TypeScript + Tailwind on Vercel; Supabase Postgres for passports, grants, auth codes and a 24h Qloo cache; `jose` for JWTs; a dependency-free drop-in JS SDK; Anthropic tool-calling for the agent; a hand-written MCP (Streamable HTTP JSON-RPC) endpoint.

## Qloo-powered features
- `/search` to resolve anything the user names to a taste-graph entity
- `/v2/insights` per domain from the user's seeds (cross-domain expansion)
- `filter.results.entities` to re-rank **an app's own catalog** against a user's taste — the core cold-start solution
- `filter.location.query` for city-aware dining
- `feature.explainability` for "why this?" lines the agent and apps display
- `urn:tag` for taste DNA and archetypes, `urn:demographics` for skew

## Challenges
Qloo silently ignores unsupported params, so we built a per-`filter.type` allowlist; designing consent so the OAuth flow feels like "Sign in with Google" but for taste; keeping demos honest by integrating only through the public SDK/API; and respecting the public-repo data rule by resolving catalogs at runtime and caching server-side only.

## Accomplishments
A complete, deployable identity layer for taste: PKCE OAuth, per-domain consent, live revocation, an SDK, an MCP server, three working demo apps and an agent comparison — with graceful degradation when Qloo is unreachable.

## What's next
Free for users. Apps pay per connected user to eliminate cold start; agent builders pay for API/MCP access. Next: more domains and scopes, refresh tokens, third-party client registration, on-device taste updates, and signed "taste attestations" for agent-to-agent handoff.
