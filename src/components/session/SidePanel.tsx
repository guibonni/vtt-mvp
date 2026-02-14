"use client";

import { useState } from "react";
import ChatTab from "./ChatTab";
import CharactersTab from "../characters/CharactersTab";
import { Character } from "@/src/models/character";
import { DiceResult } from "@/src/utils/dice";
import { CharacterTemplate } from "@/src/models/template";
import { Message } from "@/src/models/chat";

type Props = {
  onOpenCharacter: (character: Character) => void;
  onCreateCharacter: () => void;
  onRoll: (result: DiceResult) => void;
  characters: Character[];
  setCharacters: React.Dispatch<React.SetStateAction<Character[]>>;
  templates: CharacterTemplate[];
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
};

export default function SidePanel({ onOpenCharacter, onCreateCharacter, onRoll, characters, setCharacters, templates, messages, setMessages }: Props) {
  const [activeTab, setActiveTab] = useState<"chat" | "characters">("chat");

  return (
    <div className="flex flex-col h-full min-h-0 bg-[var(--bg-secondary)] border-l border-[var(--border-primary)]">
      <div className="flex border-b border-[var(--border-primary)]">
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex-1 py-3 text-xs tracking-[0.2em] uppercase transition ${
            activeTab === "chat"
              ? "text-[var(--accent-soft)] border-b-2 border-[var(--accent)]"
              : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
          }`}
        >
          Mensagens
        </button>

        <button
          onClick={() => setActiveTab("characters")}
          className={`flex-1 py-3 text-xs tracking-[0.2em] uppercase transition ${
            activeTab === "characters"
              ? "text-[var(--accent-soft)] border-b-2 border-[var(--accent)]"
              : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
          }`}
        >
          Personagens
        </button>
      </div>

      {activeTab === "chat" ? (
        <ChatTab messages={messages} setMessages={setMessages} />
      ) : (
        <CharactersTab
          characters={characters}
          setCharacters={setCharacters}
          templates={templates}
          onRoll={onRoll}
          onOpenCharacter={onOpenCharacter}
          onCreateCharacter={onCreateCharacter}
        />
      )}
    </div>
  );
}
