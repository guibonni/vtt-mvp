"use client";

import { useEffect, useState } from "react";
import { Character } from "@/src/models/character";
import ConfirmModal from "@/src/components/ui/ConfirmModal";
import { useEscapeKey } from "@/src/hooks/useEscapeKey";

type Props = {
  isOpen: boolean;
  character?: Character | null;
  onClose: () => void;
  onSave: (character: Character) => void;
  onDelete: (id: string) => void;
};

type FormAttribute = {
  id: string;
  name: string;
  value: number;
};

export default function CharacterModal({
  isOpen,
  character,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const isEditMode = !!character;
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [form, setForm] = useState({
    name: "",
    owner: "Você",
    race: "",
    class: "",
  });

  const [attributes, setAttributes] = useState<FormAttribute[]>([]);

  useEscapeKey(isOpen, onClose);

  // Preenche quando abre
  useEffect(() => {
    if (isOpen && character) {
      setForm({
        name: character.name,
        owner: character.owner,
        race: character.race || "",
        class: character.class || "",
      });

      setAttributes(
        character.attributes.map((attr) => ({
          id: crypto.randomUUID(),
          ...attr,
        }))
      );
    }

    if (isOpen && !character) {
      setForm({
        name: "",
        owner: "Você",
        race: "",
        class: "",
      });

      setAttributes([
        {
          id: crypto.randomUUID(),
          name: "Força",
          value: 10,
        },
      ]);
    }
  }, [isOpen, character]);

  function handleSubmit() {
    if (!form.name.trim()) return;

    const updatedCharacter: Character = {
      id: character?.id || crypto.randomUUID(),
      name: form.name,
      owner: form.owner,
      race: form.race,
      class: form.class,
      attributes: attributes.map(({ id, ...rest }) => rest),
      equipment: [],
      actions: [],
      biography: "",
      createdAt: character?.createdAt || new Date(),
    };

    onSave(updatedCharacter);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-6 w-[480px] shadow-[0_0_40px_rgba(0,0,0,0.7)] space-y-4">

          <div className="text-lg font-medium">
            {isEditMode ? "Editar Personagem" : "Criar Personagem"}
          </div>

          <input
            type="text"
            placeholder="Nome"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
            className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md text-sm"
          />

          {/* Botões */}
          <div className="flex justify-between pt-4">
            {isEditMode && (
              <button
                onClick={() => setConfirmDelete(true)}
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
                onClick={handleSubmit}
                className="px-3 py-1 text-sm bg-[var(--accent)] rounded-md"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmDelete}
        title="Excluir Personagem"
        description="Tem certeza que deseja excluir este personagem?"
        confirmLabel="Excluir"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          if (character) {
            onDelete(character.id);
          }
          setConfirmDelete(false);
          onClose();
        }}
      />
    </>
  );
}
