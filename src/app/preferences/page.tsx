"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  applyTheme,
  ApiError,
  clearAuthSession,
  getAuthUserName,
  getThemeFromPreferences,
  getUserPreferences,
  saveUserPreferences,
  updateUserPreferencesRequest,
  updateUserPreferences,
} from "@/src/services/api";

function SidebarItem({
  icon,
  label,
  href,
  collapsed,
  active = false,
  onNavigate,
}: {
  icon: string;
  label: string;
  href: string;
  collapsed: boolean;
  active?: boolean;
  onNavigate: (href: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onNavigate(href)}
      className={`
        flex items-center gap-3 rounded-lg px-3 py-2 text-left transition
        ${
          active
            ? "bg-[var(--accent)]/10 text-[var(--accent-soft)]"
            : "text-[var(--text-muted)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]"
        }
      `}
      title={collapsed ? label : undefined}
    >
      <span className="text-base">{icon}</span>
      {!collapsed && <span>{label}</span>}
    </button>
  );
}

export default function PreferencesPage() {
  const router = useRouter();
  const currentUser = getAuthUserName() ?? "Voce";

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLightMode, setIsLightMode] = useState(
    () => getThemeFromPreferences(getUserPreferences()) === "light"
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  function handleLogout() {
    clearAuthSession();
    router.push("/login");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSaveMessage(null);

    const nextTheme = isLightMode ? "light" : "dark";
    const preferences = updateUserPreferences((current) => ({
      ...current,
      theme: nextTheme,
    }));

    try {
      const savedPreferences = await updateUserPreferencesRequest(preferences);
      saveUserPreferences(savedPreferences);
      setSaveMessage("Preferencias salvas com sucesso.");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearAuthSession();
        router.push("/login");
        return;
      }

      setError(
        err instanceof Error ? err.message : "Nao foi possivel salvar as preferencias."
      );
    } finally {
      setIsSaving(false);
    }
  }

  function handleToggleTheme() {
    setIsLightMode((prev) => {
      const nextIsLightMode = !prev;
      const nextTheme = nextIsLightMode ? "light" : "dark";
      const preferences = updateUserPreferences((current) => ({
        ...current,
        theme: nextTheme,
      }));

      applyTheme(getThemeFromPreferences(preferences));
      setError(null);
      setSaveMessage(null);

      return nextIsLightMode;
    });
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-radial from-[var(--accent)]/5 via-transparent to-transparent" />
      </div>

      <svg
        className="absolute inset-0 h-full w-full opacity-[0.035] pointer-events-none"
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

      <div className="relative z-10 flex min-h-screen">
        <aside
          className={`
            relative flex flex-col border-r border-[var(--border-primary)] bg-[var(--bg-secondary)] px-4 py-8
            transition-all duration-300 ease-in-out
            ${isCollapsed ? "w-20" : "w-64"}
          `}
        >
          <button
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="absolute top-4 right-4 text-[var(--text-muted)] transition hover:text-[var(--text-primary)]"
          >
            <svg
              className={`h-4 w-4 transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <div className="mt-6 mb-10 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--accent)]/40 bg-[var(--accent)]/20 text-sm font-medium shadow-[0_0_15px_rgba(124,58,237,0.3)]">
              <span>{currentUser.charAt(0).toUpperCase()}</span>
            </div>

            {!isCollapsed && (
              <div>
                <div className="text-sm font-medium">{currentUser}</div>
                <div className="text-xs text-[var(--text-muted)]">Aventureiro</div>
              </div>
            )}
          </div>

          <nav className="mt-4 flex flex-col gap-4 text-sm">
            <SidebarItem
              icon="S"
              label="Sessoes"
              href="/sessions"
              collapsed={isCollapsed}
              onNavigate={router.push}
            />
            <SidebarItem
              icon="T"
              label="Templates"
              href="/templates"
              collapsed={isCollapsed}
              onNavigate={router.push}
            />
            <SidebarItem
              icon="P"
              label="Preferencias"
              href="/preferences"
              collapsed={isCollapsed}
              active
              onNavigate={router.push}
            />
          </nav>

          <div className="mt-auto">
            <button
              type="button"
              onClick={handleLogout}
              className="mb-3 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-2 text-sm transition hover:border-[var(--accent)]/40"
            >
              Logout
            </button>
          </div>

          <div className="text-xs text-[var(--text-muted)]">
            {!isCollapsed && "Portal Arcano"}
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto px-6 py-8 md:px-10 md:py-10 xl:px-12 xl:py-12">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent-soft)]">
                Ajustes pessoais
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-wide">
                Preferencias
              </h1>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Defina como a interface deve aparecer para voce.
              </p>
            </div>

            <form
              onSubmit={handleSave}
              className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]/85 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
            >
              <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-medium">Modo claro</h2>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      Ative para usar a interface com fundo claro. Se estiver desligado, o tema escuro sera usado.
                    </p>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={isLightMode}
                    onClick={handleToggleTheme}
                    className={`relative h-8 w-14 rounded-full border transition ${
                      isLightMode
                        ? "border-[var(--accent)] bg-[var(--accent)]"
                        : "border-[var(--border-subtle)] bg-[var(--bg-surface)]"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                        isLightMode ? "left-8" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between gap-4">
                <div className="text-sm text-[var(--text-muted)]">
                  {error ??
                    saveMessage ??
                    "As alteracoes visuais sao aplicadas na hora. Clique em salvar para persistir na API."}
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-2xl bg-[var(--accent)] px-5 py-3 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)] hover:shadow-[0_0_24px_rgba(124,58,237,0.24)]"
                >
                  {isSaving ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
