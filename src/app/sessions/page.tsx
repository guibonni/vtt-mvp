"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ApiError,
  clearAuthSession,
  createSession,
  getAuthUserName,
  joinSession,
  listSessions,
  SessionSummary,
} from "@/src/services/api";

export default function SessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentUser = getAuthUserName() ?? "Voce";

  const [selectedSession, setSelectedSession] = useState<SessionSummary | null>(null);
  const [sessionPassword, setSessionPassword] = useState("");
  const [sessionToDelete, setSessionToDelete] = useState<SessionSummary | null>(null);
  const [openSessionMenuId, setOpenSessionMenuId] = useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newSessionName, setNewSessionName] = useState("");
  const [newSessionPassword, setNewSessionPassword] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    function handleOutsideMenuClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.closest("[data-session-menu-root]")) return;
      setOpenSessionMenuId(null);
    }

    document.addEventListener("mousedown", handleOutsideMenuClick);
    return () =>
      document.removeEventListener("mousedown", handleOutsideMenuClick);
  }, []);

  useEffect(() => {
    async function loadSessions() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await listSessions();
        setSessions(data);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          clearAuthSession();
          router.push("/login");
          return;
        }
        setError(err instanceof Error ? err.message : "Falha ao carregar sessoes.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadSessions();
  }, [router]);

  async function handleCreateSession() {
    if (!newSessionName.trim()) return;

    try {
      const session = await createSession({
        name: newSessionName.trim(),
        password: newSessionPassword.trim() || undefined,
      });

      setSessions((prev) => [...prev, session]);
      setIsCreateModalOpen(false);
      setNewSessionName("");
      setNewSessionPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao criar sessão.");
    }
  }

  function handleOpenCreateSessionModal() {
    setIsCreateModalOpen(true);
  }

  function handleCloseCreateSessionModal() {
    setIsCreateModalOpen(false);
    setNewSessionName("");
    setNewSessionPassword("");
  }

  function handleOpenSession(session: SessionSummary) {
    setOpenSessionMenuId(null);
    setSelectedSession(session);
    setSessionPassword("");
  }

  function handleCloseSessionPrompt() {
    setSelectedSession(null);
    setSessionPassword("");
  }

  async function handleEnterSession() {
    if (!selectedSession) return;

    try {
      await joinSession({
        sessionId: selectedSession.id,
        password: sessionPassword.trim() || undefined,
      });
      router.push(`/sessions/${selectedSession.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao entrar na sessao.");
    }
  }

  function handleLogout() {
    clearAuthSession();
    router.push("/login");
  }

  function handleOpenDeleteSessionModal(session: SessionSummary) {
    setSessionToDelete(session);
  }

  function handleCloseDeleteSessionModal() {
    setSessionToDelete(null);
  }

  function handleConfirmDeleteSession() {
    if (!sessionToDelete) return;
    setSessions((prev) => prev.filter((s) => s.id !== sessionToDelete.id));
    setSessionToDelete(null);
  }

  function SidebarItem({
    icon,
    label,
    collapsed,
    active = false,
  }: {
    icon: string;
    label: string;
    collapsed: boolean;
    active?: boolean;
  }) {
    return (
      <button
        className={`
        flex items-center gap-3 px-3 py-2 rounded-lg transition
        ${
          active
            ? "bg-[var(--accent)]/10 text-[var(--accent-soft)]"
            : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]"
        }
      `}
        title={collapsed ? label : undefined}
      >
        <span className="text-base">{icon}</span>
        {!collapsed && <span>{label}</span>}
      </button>
    );
  }

  return (
    <div className="relative min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-radial from-[var(--accent)]/5 via-transparent to-transparent" />
      </div>

      <svg
        className="absolute inset-0 w-full h-full opacity-[0.035] pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="noiseFilter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>

      <div className="relative z-10 flex h-screen">
        <aside
          className={`
            relative
            transition-all duration-300 ease-in-out
            ${isCollapsed ? "w-20" : "w-64"}
            bg-[var(--bg-secondary)]
            border-r border-[var(--border-primary)]
            flex flex-col
            px-4 py-8
          `}
        >
          <button
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
          >
            <svg
              className={`w-4 h-4 transition-transform duration-300 ${
                isCollapsed ? "rotate-180" : ""
              }`}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <div className="flex items-center gap-3 mb-10 mt-6">
            <div className="w-10 h-10 rounded-full bg-[var(--accent)]/20 border border-[var(--accent)]/40 flex items-center justify-center text-sm font-medium shadow-[0_0_15px_rgba(124,58,237,0.3)]">
              A
            </div>

            {!isCollapsed && (
              <div>
                <div className="text-sm font-medium">{currentUser}</div>
                <div className="text-xs text-[var(--text-muted)]">Aventureiro</div>
              </div>
            )}
          </div>

          <nav className="flex flex-col gap-4 text-sm mt-4">
            <SidebarItem icon="S" label="Sessões" collapsed={isCollapsed} active />
            <SidebarItem icon="P" label="Perfil" collapsed={isCollapsed} />
            <SidebarItem icon="C" label="Configurações" collapsed={isCollapsed} />
          </nav>

          <div className="mt-auto">
            <button
              onClick={handleLogout}
              className="w-full mb-3 px-4 py-2 text-sm rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--accent)]/40 transition"
            >
              Logout
            </button>
          </div>

          <div className="text-xs text-[var(--text-muted)]">
            {!isCollapsed && "Portal Arcano"}
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto px-12 py-12">
          <div className="flex justify-between items-center mb-10">
            <h1 className="text-2xl font-semibold tracking-wide">Suas Sessões</h1>

            <button
              onClick={handleOpenCreateSessionModal}
              className="px-5 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-lg text-sm transition shadow-[0_0_20px_rgba(124,58,237,0.2)]"
            >
              + Criar Sessão
            </button>
          </div>

          {error && <div className="mb-6 text-sm text-red-400">{error}</div>}
          {isLoading && <div className="text-sm text-[var(--text-muted)]">Carregando...</div>}

          <div
            className={`
              grid
              grid-cols-1
              md:grid-cols-2
              xl:grid-cols-3
              gap-8
              transition-all duration-700
              ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
            `}
          >
            {sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => handleOpenSession(session)}
                className="relative bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-6 transition cursor-pointer hover:border-[var(--accent)]/40 hover:shadow-[0_0_30px_rgba(124,58,237,0.15)]"
              >
                {session.gm === currentUser && (
                  <div className="absolute top-3 right-3">
                    <div className="relative" data-session-menu-root>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenSessionMenuId((prev) =>
                            prev === session.id ? null : session.id
                          );
                        }}
                        aria-label={`Abrir menu da sessao ${session.name}`}
                        title="Opcoes"
                        className="p-1.5 rounded-md border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--accent)]/40 transition"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-4 h-4"
                        >
                          <path d="M12 7a2 2 0 110-4 2 2 0 010 4zm0 7a2 2 0 110-4 2 2 0 010 4zm0 7a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>

                      {openSessionMenuId === session.id && (
                        <div className="absolute right-0 top-9 z-20 min-w-[150px] rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-1 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                          <span className="block px-3 py-2 text-xs text-[var(--text-muted)]">
                            Sem ações disponíveis
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="text-lg font-medium mb-2 pr-10">{session.name}</div>

                <div className="text-xs text-[var(--text-muted)]">Mestre: {session.gm}</div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"
            onClick={handleCloseSessionPrompt}
          />

          <div className="relative w-full max-w-md rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 shadow-[0_0_40px_rgba(0,0,0,0.7)]">
            <h2 className="text-lg font-semibold">Entrar na sessão</h2>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Digite a senha da sessão &quot;{selectedSession.name}&quot;.
            </p>

            <input
              type="password"
              value={sessionPassword}
              onChange={(e) => setSessionPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleEnterSession();
              }}
              placeholder="Senha da sessão"
              className="mt-4 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-2.5 text-sm outline-none transition focus:border-[var(--accent)]"
            />

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handleCloseSessionPrompt}
                className="px-4 py-2 text-sm rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 transition"
              >
                Cancelar
              </button>

              <button
                onClick={() => void handleEnterSession()}
                className="px-4 py-2 text-sm rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] transition"
              >
                Entrar
              </button>
            </div>
          </div>
        </div>
      )}

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"
            onClick={handleCloseCreateSessionModal}
          />

          <div className="relative w-full max-w-md rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 shadow-[0_0_40px_rgba(0,0,0,0.7)]">
            <h2 className="text-lg font-semibold">Criar sessão</h2>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Preencha os dados para criar uma nova sessão.
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider text-[var(--text-muted)]">
                  Nome da sessão
                </label>
                <input
                  type="text"
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                  placeholder="Ex: Ruinas de Eldoria"
                  className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-2.5 text-sm outline-none transition focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider text-[var(--text-muted)]">
                  Senha da sessão
                </label>
                <input
                  type="password"
                  value={newSessionPassword}
                  onChange={(e) => setNewSessionPassword(e.target.value)}
                  placeholder="Defina uma senha (opcional)"
                  className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-2.5 text-sm outline-none transition focus:border-[var(--accent)]"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handleCloseCreateSessionModal}
                className="px-4 py-2 text-sm rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 transition"
              >
                Cancelar
              </button>

              <button
                onClick={() => void handleCreateSession()}
                className="px-4 py-2 text-sm rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] transition disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={!newSessionName.trim()}
              >
                Criar
              </button>
            </div>
          </div>
        </div>
      )}

      {sessionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"
            onClick={handleCloseDeleteSessionModal}
          />

          <div className="relative w-full max-w-md rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 shadow-[0_0_40px_rgba(0,0,0,0.7)]">
            <h2 className="text-lg font-semibold">Excluir sessao</h2>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Tem certeza que deseja excluir "{sessionToDelete.name}"?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handleCloseDeleteSessionModal}
                className="px-4 py-2 text-sm rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDeleteSession}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 hover:bg-red-500 transition"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
