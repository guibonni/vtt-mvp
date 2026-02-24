"use client";

import { Character } from "@/src/models/character";
import { useState } from "react";
import CharacterCard from "./CharacterCard";
import ConfirmModal from "../ui/ConfirmModal";
import { useSession } from "../session/SessionContext";
import { useWindowManager } from "@/src/windowing/WindowManagerContext";

export default function CharactersTab() {
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const { characters, templates, setCharacters, saveCharacter, deleteCharacter, sendRoll, sendMessage } = useSession();
  const { openWindow } = useWindowManager();

  function handleDelete(id: string) {
    setCharacters((prev) => prev.filter((c) => c.id !== id));
  }

  function handleOpenCharacter(character: Character | null) {
    openWindow({
      type: "character",
      props: {
        character,
        templates,
        onSave: saveCharacter,
        onDelete: deleteCharacter,
        onRoll: sendRoll,
        onSendMessage: sendMessage,
      },
    });
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 p-6 overflow-y-auto space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium opacity-70">Personagens</span>
        <button onClick={() => handleOpenCharacter(null)}>+ Novo</button>
      </div>

      {characters.map((character) => (
        <CharacterCard
          key={character.id}
          character={character}
          onClick={() => handleOpenCharacter(character)}
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
