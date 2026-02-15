"use client";

import { rollExpression } from "@/src/utils/dice";
import { DiceResult } from "@/src/utils/dice";

type Props = {
  field: any;
  value: any;
  setValue: (value: any) => void;
  onRoll: (result: DiceResult) => void;
  onSendMessage: (content: string) => void;
};

export default function TemplateField({
  field,
  value,
  setValue,
  onRoll,
  onSendMessage,
}: Props) {
  return (
    <div className="space-y-1">
      <label
        onClick={() => {
          if (value === undefined || value === "") return;
          onSendMessage(`${field.label}: ${value}`);
        }}
        className="block text-xs font-medium opacity-70 cursor-pointer hover:text-[var(--accent)] transition"
      >
        {field.label}
      </label>

      {field.type === "text" && (
        <input
          type="text"
          value={value || ""}
          onChange={(e) => setValue(e.target.value)}
          className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md text-sm"
        />
      )}

      {field.type === "number" && (
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={value || 0}
            onChange={(e) => setValue(Number(e.target.value))}
            className="flex-1 px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md text-sm text-center"
          />

          {field.dice && (
            <button
              type="button"
              onClick={() => {
                const result = rollExpression(field.dice!, value || 0);
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
          value={value || ""}
          onChange={(e) => setValue(e.target.value)}
          className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md text-sm resize-none"
          rows={3}
        />
      )}
    </div>
  );
}
