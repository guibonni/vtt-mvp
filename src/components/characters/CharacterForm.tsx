"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CharacterTemplate } from "@/src/models/template";
import { DiceResult, rollExpression } from "@/src/utils/dice";

type Props = {
  isEditMode: boolean;
  activeTemplate?: CharacterTemplate;
  name: string;
  setName: (value: string) => void;
  nameError: boolean;
  clearNameError: () => void;
  templateError: boolean;
  clearTemplateError: () => void;
  templates: CharacterTemplate[];
  selectedTemplateId: string;
  setSelectedTemplateId: (id: string) => void;
  values: Record<string, unknown>;
  setValues: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
  onRoll: (result: DiceResult) => void;
  onSendMessage: (content: string) => void;
};

function asText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asNumber(value: unknown) {
  return typeof value === "number" ? value : 0;
}

export default function CharacterForm({
  isEditMode,
  activeTemplate,
  name,
  setName,
  nameError,
  clearNameError,
  templateError,
  clearTemplateError,
  templates,
  selectedTemplateId,
  setSelectedTemplateId,
  values,
  setValues,
  onRoll,
  onSendMessage,
}: Props) {
  const selectedTemplate =
    (isEditMode ? activeTemplate : undefined) ??
    templates.find((template) => template.id === selectedTemplateId);
  const [templateSearch, setTemplateSearch] = useState("");
  const [isTemplateSelectOpen, setIsTemplateSelectOpen] = useState(false);
  const templateSelectRef = useRef<HTMLDivElement | null>(null);

  const filteredTemplates = useMemo(() => {
    const normalizedSearch = templateSearch.trim().toLowerCase();
    if (!normalizedSearch) return templates;

    return templates.filter((template) =>
      template.name.toLowerCase().includes(normalizedSearch)
    );
  }, [templateSearch, templates]);

  useEffect(() => {
    if (!isTemplateSelectOpen) return;

    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as Node | null;
      if (templateSelectRef.current?.contains(target)) return;
      setIsTemplateSelectOpen(false);
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isTemplateSelectOpen]);

  function handleTemplateSearchChange(value: string) {
    setTemplateSearch(value);
    setSelectedTemplateId("");
    setIsTemplateSelectOpen(true);
    if (templateError) clearTemplateError();
  }

  function handleTemplateSelect(template: CharacterTemplate) {
    setSelectedTemplateId(template.id);
    setTemplateSearch(template.name);
    setIsTemplateSelectOpen(false);
    clearTemplateError();
  }

  function handleToggleTemplateSelect() {
    setIsTemplateSelectOpen((current) => {
      const next = !current;
      if (next) {
        setTemplateSearch("");
      }
      return next;
    });
  }

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-1">
        <label className="text-xs font-medium opacity-70">Nome do Personagem</label>

        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (e.target.value.trim()) clearNameError();
          }}
          className={`
            w-full px-3 py-2
            bg-[var(--bg-surface)]
            border rounded-md text-sm outline-none transition
            ${
              nameError
                ? "border-red-500"
                : "border-[var(--border-subtle)] focus:border-[var(--accent)]/50"
            }
          `}
        />

        {nameError && <span className="text-xs text-red-400">O nome é obrigatório.</span>}
      </div>

      {!isEditMode && (
        <div className="space-y-3" ref={templateSelectRef}>
          <div className="space-y-1">
            <label className="text-xs font-medium opacity-70">Template</label>

            <button
              type="button"
              onClick={handleToggleTemplateSelect}
              className={`
                flex w-full items-center justify-between gap-3 px-3 py-2
                bg-[var(--bg-surface)]
                border rounded-md text-sm outline-none transition text-left
                ${
                  templateError
                    ? "border-red-500"
                    : "border-[var(--border-subtle)] hover:border-[var(--accent)]/50"
                }
              `}
            >
              <span className={selectedTemplate ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}>
                {selectedTemplate?.name ?? "Selecione um template"}
              </span>
              <span
                className={`text-xs text-[var(--text-muted)] transition-transform ${
                  isTemplateSelectOpen ? "rotate-180" : ""
                }`}
              >
                ▼
              </span>
            </button>

            {templateError && (
              <span className="text-xs text-red-400">
                Selecione um template valido para salvar o personagem.
              </span>
            )}
          </div>

          {isTemplateSelectOpen && (
            <div className="space-y-3 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2">
              <input
                type="text"
                value={templateSearch}
                onChange={(e) => handleTemplateSearchChange(e.target.value)}
                placeholder="Digite para filtrar templates"
                className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2 text-sm outline-none transition focus:border-[var(--accent)]/50"
              />

              <div className="max-h-44 space-y-2 overflow-y-auto">
                {filteredTemplates.length > 0 ? (
                  filteredTemplates.map((template) => {
                    const isSelected = template.id === selectedTemplateId;

                    return (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => handleTemplateSelect(template)}
                        className={`
                          w-full rounded-md px-3 py-2 text-left text-sm transition
                          ${
                            isSelected
                              ? "bg-[var(--accent)]/15 text-[var(--accent-soft)]"
                              : "hover:bg-[var(--bg-card)]"
                          }
                        `}
                      >
                        {template.name}
                      </button>
                    );
                  })
                ) : (
                  <div className="px-3 py-2 text-sm text-[var(--text-muted)]">
                    Nenhum template encontrado para essa busca.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {selectedTemplate?.sections.map((section) => (
        <div key={section.id} className="space-y-4">
          <div className="text-sm font-medium opacity-70 border-b border-[var(--border-subtle)] pb-1">
            {section.title}
          </div>

          <div className="grid grid-cols-12 gap-4">
            {section.fields.map((field) => {
              const safeSpan = Math.min(field.columnSpan || 12, 12);
              const value = values[field.id];

              return (
                <div
                  key={field.id}
                  style={{
                    gridColumn: `span ${safeSpan} / span ${safeSpan}`,
                  }}
                  className="space-y-1"
                >
                  <label
                    onClick={() => {
                      if (value === undefined || value === "") return;
                      onSendMessage(`${field.label}: ${String(value)}`);
                    }}
                    className="block text-xs font-medium opacity-70 cursor-pointer hover:text-[var(--accent)] transition"
                  >
                    {field.label}
                  </label>

                  {field.type === "text" && (
                    <input
                      type="text"
                      value={asText(value)}
                      onChange={(e) =>
                        setValues((prev) => ({
                          ...prev,
                          [field.id]: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md text-sm"
                    />
                  )}

                  {field.type === "number" && (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={asNumber(value)}
                        onChange={(e) =>
                          setValues((prev) => ({
                            ...prev,
                            [field.id]: Number(e.target.value),
                          }))
                        }
                        className="flex-1 px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md text-sm text-center"
                      />

                      {field.dice && (
                        <button
                          type="button"
                          onClick={() => {
                            const result = rollExpression(field.dice ?? "d20", asNumber(value));
                            if (!result) return;
                            onRoll(result);
                          }}
                          className="w-8 h-8 flex items-center justify-center rounded-md bg-[var(--bg-surface)] border border-[var(--border-subtle)]"
                        >
                          🎲
                        </button>
                      )}
                    </div>
                  )}

                  {field.type === "textarea" && (
                    <textarea
                      value={asText(value)}
                      onChange={(e) =>
                        setValues((prev) => ({
                          ...prev,
                          [field.id]: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md text-sm resize-none"
                      rows={3}
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
