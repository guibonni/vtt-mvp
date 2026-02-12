"use client";

import { Character } from "@/src/models/character";
import { useState } from "react";
import CharacterCard from "./CharacterCard";
import ConfirmModal from "../ui/ConfirmModal";
import CharacterModal from "./CharacterModal";
import { CharacterTemplate } from "@/src/models/template";
import { DiceResult } from "@/src/utils/dice";

type Props = {
  characters: Character[];
  setCharacters: React.Dispatch<React.SetStateAction<Character[]>>;
  templates: CharacterTemplate[];
  onRoll: (result: DiceResult) => void;
};


export default function CharactersTab({ characters, setCharacters, templates, onRoll }: Props) {
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  function handleDelete(id: string) {
    setCharacters((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 p-6 overflow-y-auto space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium opacity-70">Personagens</span>

        <button
          onClick={() => {
            setSelectedCharacter(null);
            setIsModalOpen(true);
          }}
          className="px-3 py-1 text-sm bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-md transition"
        >
          + Novo
        </button>
      </div>

      {characters.map((character) => (
        <CharacterCard
          key={character.id}
          character={character}
          onClick={() => {
            setSelectedCharacter(character);
            setIsModalOpen(true);
          }}
        />
      ))}

      <ConfirmModal
        isOpen={!!confirmId}
        title="Excluir Personagem"
        description="Tem certeza que deseja excluir este personagem?"
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        onCancel={() => setConfirmId(null)}
        onConfirm={() => {
          if (confirmId) {
            handleDelete(confirmId);
          }
          setConfirmId(null);
        }}
      />

      <CharacterModal
        isOpen={isModalOpen}
        character={selectedCharacter}
        templates={templates}
        onClose={() => setIsModalOpen(false)}
        onRoll={onRoll}
        onSave={(updated) => {
          setCharacters((prev) => {
            const exists = prev.find((c) => c.id === updated.id);
            if (exists) {
              return prev.map((c) => (c.id === updated.id ? updated : c));
            }
            return [...prev, updated];
          });
        }}
        onDelete={(id) =>
          setCharacters((prev) => prev.filter((c) => c.id !== id))
        }
      />
    </div>
  );
}
