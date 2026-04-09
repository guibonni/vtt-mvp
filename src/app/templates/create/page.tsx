"use client";

import type { DragEvent } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ApiError,
  clearAuthSession,
  createTemplate,
  getAuthUserName,
} from "@/src/services/api";
import { FieldType, TemplateField, TemplateSection } from "@/src/models/template";

type BuilderField = TemplateField & {
  isNew?: boolean;
};

type BuilderSection = TemplateSection & {
  fields: BuilderField[];
};

type DragPayload =
  | {
      source: "palette";
      fieldType: FieldType;
    }
    | {
      source: "section";
      sectionId: string;
      fieldId: string;
    };

type ResizeState = {
  sectionId: string;
  fieldId: string;
  startX: number;
  startSpan: number;
  containerWidth: number;
};

const FIELD_LIBRARY: Array<{
  type: FieldType;
  title: string;
  description: string;
  defaultColumnSpan: number;
  defaultDice?: string;
}> = [
  {
    type: "text",
    title: "Texto curto",
    description: "Bom para nome, classe, raça e outros valores simples.",
    defaultColumnSpan: 6,
  },
  {
    type: "number",
    title: "Numero",
    description: "Ideal para atributos, pontos e campos que usam rolagem.",
    defaultColumnSpan: 4,
  },
  {
    type: "textarea",
    title: "Texto longo",
    description: "Use para historia, habilidades e observações.",
    defaultColumnSpan: 12,
  },
];

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function buildField(type: FieldType): BuilderField {
  const config = FIELD_LIBRARY.find((item) => item.type === type);
  const id = createId("field");

  return {
    id,
    label: config?.title ?? "Novo campo",
    type,
    columnSpan: config?.defaultColumnSpan ?? 6,
    dice: config?.defaultDice,
    isNew: true,
  };
}

function buildSection(index: number): BuilderSection {
  return {
    id: createId("section"),
    title: `Nova seção ${index + 1}`,
    fields: [],
  };
}

function moveItem<T>(items: T[], fromIndex: number, toIndex: number) {
  const next = [...items];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

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

export default function CreateTemplatePage() {
  const router = useRouter();
  const currentUser = getAuthUserName() ?? "Voce";

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [sections, setSections] = useState<BuilderSection[]>([
    {
      id: createId("section"),
      title: "Identidade",
      fields: [
        { id: createId("field"), label: "Nome", type: "text", columnSpan: 6 },
        { id: createId("field"), label: "Classe", type: "text", columnSpan: 6 },
      ],
    },
  ]);
  const [draggingFieldId, setDraggingFieldId] = useState<string | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);
  const [resizeState, setResizeState] = useState<ResizeState | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  function handleLogout() {
    clearAuthSession();
    router.push("/login");
  }

  async function handleSaveTemplate() {
    const normalizedName = templateName.trim();

    if (!normalizedName) {
      setSaveError("Informe um nome para o template antes de salvar.");
      return;
    }

    if (sections.length === 0) {
      setSaveError("Adicione pelo menos uma seção antes de salvar.");
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      await createTemplate({
        name: normalizedName,
        data: sections.map((section) => ({
          id: section.id,
          title: section.title.trim() || "Nova seção",
          fields: section.fields.map((field) => ({
            id: field.id,
            label: field.label.trim() || "Novo campo",
            type: field.type,
            columnSpan: field.columnSpan,
            ...(field.dice?.trim() ? { dice: field.dice.trim() } : {}),
          })),
        })),
      });

      router.push("/templates");
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clearAuthSession();
        router.push("/login");
        return;
      }

      setSaveError(
        error instanceof Error ? error.message : "Falha ao salvar o template."
      );
    } finally {
      setIsSaving(false);
    }
  }

  function addSection() {
    setSections((current) => [...current, buildSection(current.length)]);
  }

  function updateSection(sectionId: string, title: string) {
    setSections((current) =>
      current.map((section) =>
        section.id === sectionId ? { ...section, title } : section
      )
    );
  }

  function removeSection(sectionId: string) {
    setSections((current) => current.filter((section) => section.id !== sectionId));
  }

  function moveSection(sectionId: string, direction: -1 | 1) {
    setSections((current) => {
      const index = current.findIndex((section) => section.id === sectionId);
      if (index < 0) return current;

      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) return current;

      return moveItem(current, index, nextIndex);
    });
  }

  function updateField(sectionId: string, fieldId: string, updates: Partial<BuilderField>) {
    setSections((current) =>
      current.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              fields: section.fields.map((field) =>
                field.id === fieldId ? { ...field, ...updates } : field
              ),
            }
          : section
      )
    );
  }

  function removeField(sectionId: string, fieldId: string) {
    setSections((current) =>
      current.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              fields: section.fields.filter((field) => field.id !== fieldId),
            }
          : section
      )
    );
  }

  function addFieldToSection(sectionId: string | undefined, type: FieldType) {
    if (!sectionId) return;

    const field = buildField(type);

    setSections((current) =>
      current.map((section) =>
        section.id === sectionId
          ? { ...section, fields: [...section.fields, field] }
          : section
      )
    );
  }

  function parseDragData(rawData: string): DragPayload | null {
    try {
      return JSON.parse(rawData) as DragPayload;
    } catch {
      return null;
    }
  }

  function handleStartResize(
    event: React.MouseEvent<HTMLButtonElement>,
    sectionId: string,
    fieldId: string,
    startSpan: number
  ) {
    event.preventDefault();
    event.stopPropagation();

    const gridElement = event.currentTarget.closest("[data-fields-grid]");
    if (!(gridElement instanceof HTMLElement)) return;

    setResizeState({
      sectionId,
      fieldId,
      startX: event.clientX,
      startSpan,
      containerWidth: gridElement.getBoundingClientRect().width,
    });
  }

  useEffect(() => {
    if (!resizeState) return;

    function handlePointerMove(event: MouseEvent) {
      const columnWidth = resizeState!.containerWidth / 12;
      if (!columnWidth) return;

      const deltaColumns = Math.round((event.clientX - resizeState!.startX) / columnWidth);
      const nextSpan = Math.max(1, Math.min(12, resizeState!.startSpan + deltaColumns));

      updateField(resizeState!.sectionId, resizeState!.fieldId, {
        columnSpan: nextSpan,
      });
    }

    function handlePointerUp() {
      setResizeState(null);
    }

    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);

    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
    };
  }, [resizeState]);

  function handleDrop(
    event: DragEvent<HTMLElement>,
    targetSectionId: string,
    targetFieldId?: string
  ) {
    event.preventDefault();
    event.stopPropagation();
    const payload = parseDragData(event.dataTransfer.getData("application/json"));

    setDragOverTarget(null);
    setDraggingFieldId(null);

    if (!payload) return;

    if (payload.source === "palette") {
      const newField = buildField(payload.fieldType);

      setSections((current) =>
        current.map((section) => {
          if (section.id !== targetSectionId) return section;

          const insertIndex = targetFieldId
            ? section.fields.findIndex((field) => field.id === targetFieldId)
            : section.fields.length;

          if (insertIndex < 0) {
            return { ...section, fields: [...section.fields, newField] };
          }

          const fields = [...section.fields];
          fields.splice(insertIndex, 0, newField);
          return { ...section, fields };
        })
      );

      return;
    }

    setSections((current) => {
      const sourceSection = current.find(
        (section) => section.id === payload.sectionId
      );
      if (!sourceSection) return current;

      const sourceIndex = sourceSection.fields.findIndex(
        (field) => field.id === payload.fieldId
      );
      if (sourceIndex < 0) return current;

      const draggedField = sourceSection.fields[sourceIndex];

      return current.map((section) => {
        if (section.id === payload.sectionId && section.id === targetSectionId) {
          const currentIndex = section.fields.findIndex(
            (field) => field.id === payload.fieldId
          );
          const targetIndex = targetFieldId
            ? section.fields.findIndex((field) => field.id === targetFieldId)
            : section.fields.length - 1;

          if (currentIndex < 0 || targetIndex < 0 || currentIndex === targetIndex) {
            return section;
          }

          return {
            ...section,
            fields: moveItem(section.fields, currentIndex, targetIndex),
          };
        }

        if (section.id === payload.sectionId) {
          return {
            ...section,
            fields: section.fields.filter((field) => field.id !== payload.fieldId),
          };
        }

        if (section.id === targetSectionId) {
          const fields = [...section.fields];
          const insertIndex = targetFieldId
            ? section.fields.findIndex((field) => field.id === targetFieldId)
            : section.fields.length;

          if (insertIndex < 0) {
            fields.push(draggedField);
          } else {
            fields.splice(insertIndex, 0, draggedField);
          }

          return {
            ...section,
            fields,
          };
        }

        return section;
      });
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
                <div className="text-xs text-[var(--text-muted)]">Criador</div>
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
              active
              onNavigate={router.push}
            />
            <SidebarItem
              icon="P"
              label="Preferencias"
              href="/preferences"
              collapsed={isCollapsed}
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
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <button
                  type="button"
                  onClick={() => router.push("/templates")}
                  className="text-sm text-[var(--accent-soft)] transition hover:text-white"
                >
                  Voltar para templates
                </button>
                <p className="mt-4 text-xs uppercase tracking-[0.3em] text-[var(--accent-soft)]">
                  Construtor visual
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-wide">
                  Criar novo template
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)]">
                  Monte as seções da ficha e arraste campos entre os blocos para
                  desenhar o formulario visualmente.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => void handleSaveTemplate()}
                  disabled={isSaving}
                  className="rounded-2xl bg-[var(--accent)] px-5 py-3 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)] hover:shadow-[0_0_24px_rgba(124,58,237,0.24)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? "Salvando..." : "Finalizar e salvar template"}
                </button>
              </div>
            </div>

            {saveError && (
              <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {saveError}
              </div>
            )}

            <div className="grid gap-6 xl:grid-cols-[1.1fr_1.9fr]">
              <section className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]/85 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
                <h2 className="text-lg font-semibold">Metadados</h2>
                <div className="mt-5 space-y-4">
                  <label className="block">
                    <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-[var(--text-muted)]">
                      Nome do template
                    </span>
                    <input
                      type="text"
                      value={templateName}
                      onChange={(event) => setTemplateName(event.target.value)}
                      className="w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)]"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-[var(--text-muted)]">
                      Descricao
                    </span>
                    <textarea
                      value={templateDescription}
                      onChange={(event) => setTemplateDescription(event.target.value)}
                      placeholder="Explique para que serve esse template"
                      rows={4}
                      className="w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)]"
                    />
                  </label>
                </div>

                <div className="mt-8">
                  <h3 className="text-sm font-medium text-[var(--text-primary)]">
                    Biblioteca de campos
                  </h3>
                  <div className="mt-4 space-y-3">
                    {FIELD_LIBRARY.map((field) => (
                      <div
                        key={field.type}
                        draggable
                        onDragStart={(event) => {
                          const payload: DragPayload = {
                            source: "palette",
                            fieldType: field.type,
                          };
                          event.dataTransfer.setData(
                            "application/json",
                            JSON.stringify(payload)
                          );
                          event.dataTransfer.effectAllowed = "copy";
                        }}
                        className="cursor-grab rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 transition hover:border-[var(--accent)]/40 active:cursor-grabbing"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <h4 className="font-medium">{field.title}</h4>
                          <span className="rounded-full bg-[var(--bg-surface)] px-2 py-1 text-[11px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
                            {field.type}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-[var(--text-secondary)]">
                          {field.description}
                        </p>
                        <button
                          type="button"
                          onClick={() =>
                            addFieldToSection(sections[sections.length - 1]?.id, field.type)
                          }
                          disabled={sections.length === 0}
                          className="mt-3 text-sm text-[var(--accent-soft)] transition hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Adicionar na ultima seção
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]/85 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">Canvas do formulario</h2>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      Arraste campos da biblioteca, reorganize-os e redimensione pela borda direita.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full border border-[var(--border-subtle)] px-3 py-1 text-xs text-[var(--text-muted)]">
                      {sections.length} seções
                    </span>
                    <button
                      type="button"
                      onClick={addSection}
                      className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-2.5 text-sm transition hover:border-[var(--accent)]/40"
                    >
                      + Nova seção
                    </button>
                  </div>
                </div>

                <div className="mt-6 space-y-5">
                  {sections.map((section, index) => (
                    <article
                      key={section.id}
                      onDragOver={(event) => {
                        event.preventDefault();
                        setDragOverTarget(`${section.id}:section`);
                      }}
                      onDragLeave={() =>
                        setDragOverTarget((current) =>
                          current === `${section.id}:section` ? null : current
                        )
                      }
                      onDrop={(event) => handleDrop(event, section.id)}
                      className={`
                        rounded-3xl border bg-[var(--bg-card)] p-5 transition
                        ${
                          dragOverTarget === `${section.id}:section`
                            ? "border-[var(--accent)] shadow-[0_0_30px_rgba(124,58,237,0.2)]"
                            : "border-[var(--border-subtle)]"
                        }
                      `}
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex-1">
                          <label className="block">
                            <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
                              Título da seção
                            </span>
                            <input
                              type="text"
                              value={section.title}
                              onChange={(event) =>
                                updateSection(section.id, event.target.value)
                              }
                              className="w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)]"
                            />
                          </label>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => moveSection(section.id, -1)}
                            disabled={index === 0}
                            className="rounded-xl border border-[var(--border-subtle)] px-3 py-2 text-sm transition hover:border-[var(--accent)]/40 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Subir
                          </button>
                          <button
                            type="button"
                            onClick={() => moveSection(section.id, 1)}
                            disabled={index === sections.length - 1}
                            className="rounded-xl border border-[var(--border-subtle)] px-3 py-2 text-sm transition hover:border-[var(--accent)]/40 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Descer
                          </button>
                          <button
                            type="button"
                            onClick={() => removeSection(section.id)}
                            disabled={sections.length === 1}
                            className="rounded-xl border border-red-500/30 px-3 py-2 text-sm text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Remover
                          </button>
                        </div>
                      </div>

                      <div className="mt-5 grid grid-cols-12 gap-4" data-fields-grid>
                        {section.fields.map((field) => (
                          <div
                            key={field.id}
                            draggable
                            onDragStart={(event) => {
                              const payload: DragPayload = {
                                source: "section",
                                sectionId: section.id,
                                fieldId: field.id,
                              };
                              setDraggingFieldId(field.id);
                              event.dataTransfer.setData(
                                "application/json",
                                JSON.stringify(payload)
                              );
                              event.dataTransfer.effectAllowed = "move";
                            }}
                            onDragEnd={() => {
                              setDraggingFieldId(null);
                              setDragOverTarget(null);
                            }}
                            onDragOver={(event) => {
                              event.preventDefault();
                              setDragOverTarget(`${section.id}:${field.id}`);
                            }}
                            onDragLeave={() =>
                              setDragOverTarget((current) =>
                                current === `${section.id}:${field.id}` ? null : current
                              )
                            }
                            onDrop={(event) => handleDrop(event, section.id, field.id)}
                            className={`
                              relative min-w-0 rounded-2xl border bg-[var(--bg-surface)] p-4 transition
                              ${
                                dragOverTarget === `${section.id}:${field.id}`
                                  ? "border-[var(--accent)]"
                                  : "border-[var(--border-subtle)]"
                              }
                              ${draggingFieldId === field.id ? "opacity-60" : ""}
                            `}
                            style={{
                              gridColumn: `span ${field.columnSpan} / span ${field.columnSpan}`,
                            }}
                          >
                            <div className="mb-3 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <span className="cursor-grab text-[var(--text-muted)]">::</span>
                                <div className="min-w-0">
                                  <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2 transition focus-within:border-[var(--accent)]">
                                    <div className="mb-1 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
                                      <span>Editar nome</span>
                                      <span className="text-[var(--accent-soft)]">✎</span>
                                    </div>
                                    <input
                                      type="text"
                                      value={field.label}
                                      onChange={(event) =>
                                        updateField(section.id, field.id, {
                                          label: event.target.value,
                                          isNew: false,
                                        })
                                      }
                                      className="w-full bg-transparent text-sm font-medium outline-none transition placeholder:text-[var(--text-muted)] focus:text-white"
                                      placeholder="Nome do campo"
                                    />
                                  </div>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeField(section.id, field.id)}
                                className="text-sm text-red-300 transition hover:text-red-200"
                              >
                                Remover
                              </button>
                            </div>

                            <div className="space-y-3">
                              <div className="grid grid-cols-1 gap-3">
                                <label className="block">
                                  <span className="mb-1 block text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                                    Tipo
                                  </span>
                                  <select
                                    value={field.type}
                                    onChange={(event) =>
                                      updateField(section.id, field.id, {
                                        type: event.target.value as FieldType,
                                      })
                                    }
                                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2 text-sm outline-none transition focus:border-[var(--accent)]"
                                  >
                                    {FIELD_LIBRARY.map((option) => (
                                      <option key={option.type} value={option.type}>
                                        {option.title}
                                      </option>
                                    ))}
                                  </select>
                                </label>
                              </div>

                              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3">
                                <div className="mb-1 flex items-center justify-between gap-3">
                                  <span className="block text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                                    Largura atual
                                  </span>
                                  <span className="text-xs text-[var(--accent-soft)]">
                                    {field.columnSpan}/12
                                  </span>
                                </div>
                                <div className="grid grid-cols-12 gap-1">
                                  {Array.from({ length: 12 }, (_, index) => (
                                    <div
                                      key={index}
                                      className={`h-2 rounded-full ${
                                        index < field.columnSpan
                                          ? "bg-[var(--accent)]"
                                          : "bg-[var(--bg-surface)]"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <p className="mt-2 text-xs text-[var(--text-muted)]">
                                  Arraste a alça lateral para ajustar como esse campo ocupa a grade.
                                </p>
                              </div>

                              <label className="block">
                                <span className="mb-1 block text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                                  Dado associado (opcional)
                                </span>
                                <input
                                  type="text"
                                  value={field.dice ?? ""}
                                  onChange={(event) =>
                                    updateField(section.id, field.id, {
                                      dice: event.target.value,
                                    })
                                  }
                                  placeholder="Ex: 1d20"
                                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2 text-sm outline-none transition focus:border-[var(--accent)]"
                                />
                              </label>
                            </div>

                            <button
                              type="button"
                              onMouseDown={(event) =>
                                handleStartResize(event, section.id, field.id, field.columnSpan)
                              }
                              aria-label={`Redimensionar ${field.label}`}
                              title="Arraste para redimensionar"
                              className={`
                                absolute top-3 right-1 bottom-3 w-3 cursor-col-resize rounded-full transition
                                ${
                                  resizeState?.fieldId === field.id
                                    ? "bg-[var(--accent)]/35"
                                    : "bg-transparent hover:bg-[var(--accent)]/20"
                                }
                              `}
                            >
                              <span className="mx-auto block h-full w-[2px] rounded-full bg-[var(--accent)]/60" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {section.fields.length === 0 && (
                        <div className="mt-5 rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-surface)] px-5 py-8 text-center text-sm text-[var(--text-secondary)]">
                          Arraste um campo para ca ou use a biblioteca ao lado.
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </section>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
