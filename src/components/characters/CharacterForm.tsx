"use client";

import { CharacterTemplate } from "@/src/models/template";
import { DiceResult, rollExpression } from "@/src/utils/dice";

type Props = {
  isEditMode: boolean;
  name: string;
  setName: (value: string) => void;
  nameError: boolean;
  clearNameError: () => void;
  templates: CharacterTemplate[];
  selectedTemplateId: string;
  setSelectedTemplateId: (id: string) => void;
  values: Record<string, any>;
  setValues: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  onRoll: (result: DiceResult) => void;
  onSendMessage: (content: string) => void;
};

export default function CharacterForm({
  isEditMode,
  name,
  setName,
  nameError,
  clearNameError,
  templates,
  selectedTemplateId,
  setSelectedTemplateId,
  values,
  setValues,
  onRoll,
  onSendMessage,
}: Props) {
  const selectedTemplate = templates.find(
    (t) => t.id === selectedTemplateId
  );

  return (
    <div className="p-6 space-y-6">
      {/* Nome */}
      <div className="space-y-1">
        <label className="text-xs font-medium opacity-70">
          Nome do Personagem
        </label>

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

        {nameError && (
          <span className="text-xs text-red-400">
            O nome é obrigatório.
          </span>
        )}
      </div>

      {/* Template select (somente criação) */}
      {!isEditMode && (
        <select
          value={selectedTemplateId}
          onChange={(e) => setSelectedTemplateId(e.target.value)}
          className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md text-sm"
        >
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
      )}

      {/* Seções */}
      {selectedTemplate?.sections.map((section) => (
        <div key={section.id} className="space-y-4">
          <div className="text-sm font-medium opacity-70 border-b border-[var(--border-subtle)] pb-1">
            {section.title}
          </div>

          <div className="grid grid-cols-12 gap-4">
            {section.fields.map((field) => {
              const safeSpan = Math.min(field.columnSpan || 12, 12);

              return (
                <div
                  key={field.id}
                  style={{
                    gridColumn: `span ${safeSpan} / span ${safeSpan}`,
                  }}
                  className="space-y-1"
                >
                  {/* Label clicável */}
                  <label
                    onClick={() => {
                      const value = values[field.id];
                      if (value === undefined || value === "") return;
                      onSendMessage(`${field.label}: ${value}`);
                    }}
                    className="
                      block text-xs font-medium opacity-70
                      cursor-pointer
                      hover:text-[var(--accent)]
                      transition
                    "
                  >
                    {field.label}
                  </label>

                  {/* TEXT */}
                  {field.type === "text" && (
                    <input
                      type="text"
                      value={values[field.id] || ""}
                      onChange={(e) =>
                        setValues((prev) => ({
                          ...prev,
                          [field.id]: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md text-sm"
                    />
                  )}

                  {/* NUMBER */}
                  {field.type === "number" && (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={values[field.id] || 0}
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
                            const baseValue = values[field.id] || 0;
                            const result = rollExpression(
                              field.dice || "d20",
                              baseValue
                            );
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

                  {/* TEXTAREA */}
                  {field.type === "textarea" && (
                    <textarea
                      value={values[field.id] || ""}
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
