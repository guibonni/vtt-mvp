"use client";

type Props = {
  isEditMode: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onDeleteClick: () => void;
};

export default function CharacterFooter({
  isEditMode,
  onClose,
  onSubmit,
  onDeleteClick,
}: Props) {
  return (
    <div className="p-6 border-t border-[var(--border-subtle)] flex justify-between">
      {isEditMode && (
        <button
          onClick={onDeleteClick}
          className="text-sm text-red-400 hover:text-red-500"
        >
          Excluir Personagem
        </button>
      )}

      <div className="flex gap-3 ml-auto">
        <button
          onClick={onClose}
          className="px-3 py-1 text-sm bg-[var(--bg-surface)] rounded-md"
        >
          Cancelar
        </button>

        <button
          onClick={onSubmit}
          className="px-3 py-1 text-sm bg-[var(--accent)] rounded-md"
        >
          Salvar
        </button>
      </div>
    </div>
  );
}
