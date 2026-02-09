export default function CharactersTab() {
  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[var(--bg-primary)]">
      <div className="mb-6">
        <span className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">
          Registros
        </span>
      </div>

      <div className="space-y-5">
        <div className="group bg-[var(--bg-card)] rounded-xl p-5 border border-[var(--border-subtle)] shadow-[0_0_30px_rgba(0,0,0,0.6)] transition hover:border-[var(--accent)]/40 cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[var(--text-primary)] font-medium">
              Aelric, o Errante
            </span>
            <span className="text-xs text-[var(--text-muted)]">
              Jogador
            </span>
          </div>

          <div className="text-sm text-[var(--text-secondary)]">
            Humano • Guerreiro
          </div>
        </div>
      </div>
    </div>
  );
}
