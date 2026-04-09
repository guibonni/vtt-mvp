"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AppSidebar } from "@/src/components/navigation/AppSidebar";
import {
  ApiError,
  clearAuthSession,
  getTemplate,
  getAuthUserId,
  listTemplates,
  TemplateDetails,
  TemplateSummary,
} from "@/src/services/api";

type TemplateTab = "all" | "mine";

const TAB_OPTIONS: { label: string; value: TemplateTab }[] = [
  { label: "Todos os templates", value: "all" },
  { label: "Meus templates", value: "mine" },
];

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function TemplatePreview({
  template,
}: {
  template: TemplateDetails;
}) {
  return (
    <div className="space-y-6">
      {template.sections.map((section) => (
        <div key={section.id} className="space-y-4">
          <div className="border-b border-[var(--border-subtle)] pb-1 text-sm font-medium opacity-70">
            {section.title}
          </div>

          <div className="grid grid-cols-12 gap-4">
            {section.fields.map((field) => {
              const safeSpan = Math.min(field.columnSpan || 12, 12);

              return (
                <div
                  key={field.id}
                  className="space-y-1"
                  style={{ gridColumn: `span ${safeSpan} / span ${safeSpan}` }}
                >
                  <label className="block text-xs font-medium opacity-70">
                    {field.label}
                  </label>

                  {field.type === "text" && (
                    <input
                      type="text"
                      value=""
                      disabled
                      readOnly
                      className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-sm opacity-70"
                    />
                  )}

                  {field.type === "number" && (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={0}
                        disabled
                        readOnly
                        className="flex-1 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-center text-sm opacity-70"
                      />

                      {field.dice && (
                        <button
                          type="button"
                          disabled
                          className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] opacity-40"
                        >
                          🎲
                        </button>
                      )}
                    </div>
                  )}

                  {field.type === "textarea" && (
                    <textarea
                      value=""
                      disabled
                      readOnly
                      rows={3}
                      className="w-full resize-none rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-sm opacity-70"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function TemplatesPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentUserId = getAuthUserId();
  const activeTab = searchParams.get("tab") === "mine" ? "mine" : "all";
  const name = searchParams.get("name") ?? "";

  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<TemplateSummary[]>([]);
  const [searchInput, setSearchInput] = useState(name);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateDetails | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const searchSummary = useMemo(() => {
    if (!name.trim()) return "Exibindo todos os resultados";
    return `Filtrando por "${name.trim()}"`;
  }, [name]);

  useEffect(() => {
    const timeout = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    setSearchInput(name);
  }, [name]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const normalizedInput = searchInput.trim();
      const currentName = searchParams.get("name") ?? "";

      if (normalizedInput === currentName) return;

      if (normalizedInput) {
        params.set("name", normalizedInput);
      } else {
        params.delete("name");
      }

      const nextQuery = params.toString();
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname);
    }, 300);

    return () => clearTimeout(timeout);
  }, [pathname, router, searchInput, searchParams]);

  useEffect(() => {
    async function loadTemplates() {
      setIsLoading(true);
      setError(null);

      const userId = activeTab === "mine" ? currentUserId ?? undefined : undefined;

      try {
        const data = await listTemplates({
          userId,
          name,
        });
        setTemplates(data);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          clearAuthSession();
          router.push("/login");
          return;
        }

        setError(
          err instanceof Error ? err.message : "Falha ao carregar templates."
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadTemplates();
  }, [activeTab, currentUserId, name, router]);

  function updateQueryParam(key: string, value?: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    const nextQuery = params.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname);
  }

  function handleTabChange(tab: TemplateTab) {
    updateQueryParam("tab", tab === "all" ? undefined : tab);
  }

  async function handleOpenTemplatePreview(template: TemplateSummary) {
    setIsPreviewLoading(true);
    setPreviewError(null);
    setSelectedTemplate(null);

    try {
      const data = await getTemplate(template.id);
      setSelectedTemplate(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearAuthSession();
        router.push("/login");
        return;
      }

      setPreviewError(
        err instanceof Error ? err.message : "Falha ao carregar o template."
      );
    } finally {
      setIsPreviewLoading(false);
    }
  }

  function handleCloseTemplatePreview() {
    setSelectedTemplate(null);
    setPreviewError(null);
    setIsPreviewLoading(false);
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
        <AppSidebar activeSection="templates" />

        <main className="flex-1 overflow-y-auto px-6 py-8 md:px-10 md:py-10 xl:px-12 xl:py-12">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent-soft)]">
                  Biblioteca de fichas
                </p>
                <h1 className="mt-2 text-2xl font-semibold tracking-wide md:text-3xl">
                  Templates
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)]">
                  Navegue pelos modelos disponiveis e pelos templates criados por você.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-3 text-sm text-[var(--text-secondary)]">
                  {searchSummary}
                </div>

                <button
                  type="button"
                  onClick={() => router.push("/templates/create")}
                  className="rounded-2xl bg-[var(--accent)] px-5 py-3 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)] hover:shadow-[0_0_24px_rgba(124,58,237,0.24)]"
                >
                  + Novo template
                </button>
              </div>
            </div>

            <section className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]/85 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.25)] md:p-6">
              <div className="flex flex-col gap-4">
                <div className="inline-flex w-full flex-wrap gap-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-1">
                  {TAB_OPTIONS.map((tab) => {
                    const isActive = activeTab === tab.value;

                    return (
                      <button
                        key={tab.value}
                        type="button"
                        onClick={() => handleTabChange(tab.value)}
                        className={`
                          rounded-xl px-4 py-2 text-sm transition
                          ${
                            isActive
                              ? "bg-[var(--accent)] text-white shadow-[0_0_20px_rgba(124,58,237,0.2)]"
                              : "text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]"
                          }
                        `}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-[var(--text-muted)]">
                    Buscar por nome
                  </span>
                  <div className="relative">
                    <input
                      type="search"
                      value={searchInput}
                      onChange={(event) => setSearchInput(event.target.value)}
                      placeholder={
                        activeTab === "mine"
                          ? "Buscar entre os seus templates"
                          : "Buscar entre todos os templates"
                      }
                      className="w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3 pr-12 text-sm outline-none transition focus:border-[var(--accent)]"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[var(--text-muted)]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-4 w-4"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.5 3a7.5 7.5 0 015.964 12.05l4.243 4.243a.75.75 0 11-1.06 1.06l-4.244-4.242A7.5 7.5 0 1110.5 3zm-6 7.5a6 6 0 1112 0 6 6 0 01-12 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </label>
              </div>

              {error && <div className="mt-4 text-sm text-amber-300">{error}</div>}
              {isLoading && (
                <div className="mt-6 text-sm text-[var(--text-muted)]">Carregando templates...</div>
              )}

              {!isLoading && (
                <div
                  className={`
                    mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3
                    transition-all duration-700
                    ${isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}
                  `}
                >
                  {templates.length > 0 ? (
                    templates.map((template) => (
                      <article
                        key={template.id}
                        onClick={() => void handleOpenTemplatePreview(template)}
                        className="cursor-pointer rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 transition hover:border-[var(--accent)]/40 hover:shadow-[0_0_30px_rgba(124,58,237,0.12)]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h2 className="text-lg font-medium">{template.name}</h2>
                            <p className="mt-2 text-sm text-[var(--text-secondary)]">
                              {template.description || "Sem descricao informada."}
                            </p>
                          </div>

                          {template.isOwnedByCurrentUser && (
                            <span className="rounded-full border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.2em] text-[var(--accent-soft)]">
                              Meu
                            </span>
                          )}
                        </div>

                        <div className="mt-5 flex items-center justify-between text-xs text-[var(--text-muted)]">
                          <span>
                            {template.ownerName
                              ? `Criado por ${template.ownerName}`
                              : "Origem nao informada"}
                          </span>
                          <span>{formatDate(template.createdAt)}</span>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="col-span-full rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-surface)] px-6 py-10 text-center">
                      <h2 className="text-lg font-medium">
                        {activeTab === "mine"
                          ? "Voce ainda nao criou templates"
                          : "Nenhum template encontrado"}
                      </h2>
                      <p className="mt-2 text-sm text-[var(--text-secondary)]">
                        {activeTab === "mine"
                          ? "Quando houver templates associados ao seu usuario, eles aparecerao aqui."
                          : "Tente ajustar a busca para encontrar outros resultados."}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      {(selectedTemplate || isPreviewLoading || previewError) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
            onClick={handleCloseTemplatePreview}
          />

          <div className="relative z-10 flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-[0_0_60px_rgba(0,0,0,0.5)]">
            <div className="flex items-start justify-between gap-4 border-b border-[var(--border-subtle)] px-6 py-5">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-[var(--accent-soft)]">
                  Preview do template
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  {selectedTemplate?.name ?? "Carregando template"}
                </h2>
                {selectedTemplate?.description && (
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">
                    {selectedTemplate.description}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleCloseTemplatePreview}
                className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-sm transition hover:border-[var(--accent)]/40"
              >
                Fechar
              </button>
            </div>

            <div className="overflow-y-auto px-6 py-6">
              {previewError && (
                <div className="mb-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
                  {previewError}
                </div>
              )}

              {isPreviewLoading && (
                <div className="text-sm text-[var(--text-muted)]">
                  Carregando visualizacao do template...
                </div>
              )}

              {!isPreviewLoading && selectedTemplate && (
                <TemplatePreview template={selectedTemplate} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TemplatesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--bg-primary)] px-6 py-8 text-sm text-[var(--text-muted)] md:px-10 md:py-10 xl:px-12 xl:py-12">
          Carregando templates...
        </div>
      }
    >
      <TemplatesPageContent />
    </Suspense>
  );
}
