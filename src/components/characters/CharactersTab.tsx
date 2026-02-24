"use client";

import { Character } from "@/src/models/character";
import { useState } from "react";
import CharacterCard from "./CharacterCard";
import ConfirmModal from "../ui/ConfirmModal";

type Props = {
  characters: Character[];
  setCharacters: React.Dispatch<React.SetStateAction<Character[]>>;
  onOpenCharacter: (character: Character | null) => void;
};

export default function CharactersTab({ characters, setCharacters, onOpenCharacter }: Props) {
  const [confirmId, setConfirmId] = useState<string | null>(null);

  function handleDelete(id: string) {
    setCharacters((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 p-6 overflow-y-auto space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium opacity-70">Personagens</span>
        <button onClick={() => onOpenCharacter(null)}>+ Novo</button>
      </div>

      {characters.map((character) => (
        <CharacterCard
          key={character.id}
          character={character}
          onClick={() => onOpenCharacter(character)}
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
    </div>
  );
}
