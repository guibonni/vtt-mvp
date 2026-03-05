import Tooltip from "../ui/Tooltip";
import Link from "next/link";

export default function SessionHeader({
  sessionId,
  sessionName,
  onUploadClick,
}: {
  sessionId: string;
  sessionName?: string;
  onUploadClick: () => void;
}) {
  return (
    <header className="h-14 flex items-center justify-between px-8 bg-[var(--bg-secondary)] border-b border-[var(--border-primary)]">
      <h1 className="text-base font-semibold tracking-wide">
        {sessionName ?? `Sessao #${sessionId}`}
      </h1>

      <div className="flex gap-3">
        <Tooltip content="Upload de mapa" position="bottom">
          <button
            onClick={onUploadClick}
            className="px-4 py-1.5 text-sm bg-[var(--accent)] rounded-md hover:bg-[var(--accent-hover)] transition"
          >
            Upload
          </button>
        </Tooltip>

        <Link
          href="/sessions"
          className="px-4 py-1.5 text-sm bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-md hover:border-[var(--accent)]/40 transition"
        >
          Sair
        </Link>
      </div>
    </header>
  );
}
