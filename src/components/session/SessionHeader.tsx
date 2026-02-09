import Tooltip from "../ui/Tooltip";

export default function SessionHeader({
  sessionId,
}: {
  sessionId: string;
}) {
  return (
    <header className="h-14 flex items-center justify-between px-8 bg-[var(--bg-secondary)] border-b border-[var(--border-primary)]">
      <h1 className="text-base font-semibold tracking-wide">
        Sessão #{sessionId}
      </h1>

      <div className="flex gap-3">
        <Tooltip content="Upload de mapa" position="bottom">
          <button className="px-4 py-1.5 text-sm bg-[var(--accent)] rounded-md hover:bg-[var(--accent-hover)] transition">
            Upload
          </button>
        </Tooltip>

        <button className="px-4 py-1.5 text-sm bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-md hover:border-[var(--accent)]/40 transition">
          Sair
        </button>
      </div>
    </header>
  );
}
