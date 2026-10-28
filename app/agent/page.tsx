import AgentPlayground from '../../components/AgentPlayground';
export default function Page() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="stamp">Agentic</div>
      <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">Same prompt. Two AIs.</h1>
      <p className="mb-8 mt-3 max-w-2xl text-mute">The right pane gets your TasteID through real tool calls (the same ones exposed over MCP). Expand the ⚙ chips to watch it work.</p>
      <AgentPlayground />
    </div>
  );
}
