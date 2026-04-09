"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/src/components/navigation/AppSidebar";
import {
  applyTheme,
  ApiError,
  clearAuthSession,
  getNotificationSoundFromPreferences,
  getThemeFromPreferences,
  getUserPreferences,
  saveUserPreferences,
  updateUserPreferencesRequest,
  type UserPreferences,
} from "@/src/services/api";
import { playNotificationSound } from "@/src/utils/notificationSound";

export default function PreferencesPage() {
  const router = useRouter();
  const [preferences, setPreferences] = useState<UserPreferences>(
    () => getUserPreferences() ?? {}
  );
  const [isLightMode, setIsLightMode] = useState(
    () => getThemeFromPreferences(getUserPreferences()) === "light"
  );
  const [notificationSound, setNotificationSound] = useState(
    () => getNotificationSoundFromPreferences(getUserPreferences())
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSaveMessage(null);

    const nextTheme = isLightMode ? "light" : "dark";
    const nextPreferences = {
      ...preferences,
      theme: nextTheme,
      notificationSound,
    };

    try {
      const savedPreferences = await updateUserPreferencesRequest(nextPreferences);
      saveUserPreferences(savedPreferences);
      setPreferences(savedPreferences);
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
      const nextPreferences = {
        ...preferences,
        theme: nextTheme,
      };

      setPreferences(nextPreferences);
      applyTheme(getThemeFromPreferences(nextPreferences));
      setError(null);
      setSaveMessage(null);

      return nextIsLightMode;
    });
  }

  function handleNotificationSoundChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const nextNotificationSound = Number(e.target.value);
    setNotificationSound(nextNotificationSound);
    setPreferences((current) => ({
      ...current,
      notificationSound: nextNotificationSound,
    }));
    setError(null);
    setSaveMessage(null);
    playNotificationSound(nextNotificationSound);
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
        <AppSidebar activeSection="preferences" />

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

              <div className="mt-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-medium">Volume da notificacao</h2>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      Ajuste o volume do som reproduzido quando novas mensagens chegam no chat.
                    </p>
                  </div>

                  <div className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-1 text-sm">
                    {notificationSound}%
                  </div>
                </div>

                <div className="mt-4">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={notificationSound}
                    onChange={handleNotificationSoundChange}
                    className="w-full accent-[var(--accent)]"
                  />
                </div>

                <div className="mt-2 flex items-center justify-between text-xs text-[var(--text-muted)]">
                  <span>Silencioso</span>
                  <button
                    type="button"
                    onClick={() => playNotificationSound(notificationSound)}
                    className="text-[var(--accent-soft)] transition hover:text-[var(--text-primary)]"
                  >
                    Ouvir novamente
                  </button>
                  <span>Mais alto</span>
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
