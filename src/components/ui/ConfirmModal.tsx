"use client";

import { useEscapeKey } from "@/src/hooks/useEscapeKey";

type Props = {
  isOpen: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  isOpen,
  title = "Confirmação",
  description = "Tem certeza que deseja continuar?",
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
}: Props) {
  useEscapeKey(isOpen, onCancel);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-200">
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-6 w-80 shadow-[0_0_40px_rgba(0,0,0,0.7)] space-y-4 transform transition-all duration-200 scale-100">
        <div className="text-lg font-medium">{title}</div>

        <div className="text-sm opacity-80">{description}</div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onCancel}
            className="px-3 py-1 text-sm bg-[var(--bg-surface)] rounded-md hover:opacity-80 transition"
          >
            {cancelLabel}
          </button>

          <button
            onClick={onConfirm}
            className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
