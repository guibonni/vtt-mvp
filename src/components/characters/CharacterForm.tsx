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
  const selectedTemplate = templates.find((template) => template.id === selectedTemplateId);

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
