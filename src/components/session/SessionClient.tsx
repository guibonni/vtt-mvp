"use client";

import SessionHeader from "./SessionHeader";
import MapArea from "./MapArea";
import SidePanel from "./SidePanel";
import { useState } from "react";
import { Character } from "@/src/models/character";
import CharacterModal from "../characters/CharacterModal";
import { templates } from "@/src/data/templates";
import { Message } from "@/src/models/chat";
import { CharacterTemplate } from "@/src/models/template";
import { DiceResult } from "@/src/utils/dice";

export default function SessionClient({ sessionId }: { sessionId: string }) {
  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [availableTemplates] = useState<CharacterTemplate[]>(templates);

  function sendRollMessage(result: DiceResult) {
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        author: "Você",
        type: "roll",
        rollData: result,
        createdAt: new Date(),
      }
    ]);
  }

  function sendMessage(message: string) {
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        author: "Você",
        content: message,
        type: "text",
        createdAt: new Date(),
      },
    ]);
  }

  return (
    <div className="h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <SessionHeader sessionId={sessionId} />

      <div className="flex-1 grid grid-cols-[1fr_420px] xl:grid-cols-[1fr_460px] 2xl:grid-cols-[1fr_500px] overflow-hidden">
        <MapArea mapUrl="https://i0.wp.com/2minutetabletop.com/wp-content/uploads/2018/11/Wei-Continent-RPG-World-Map-spring.jpg"/>
        <SidePanel
          onOpenCharacter={(character) => {
            setEditingCharacter(character);
            setIsCharacterModalOpen(true);
          }}
          onCreateCharacter={() => {
            setEditingCharacter(null);
            setIsCharacterModalOpen(true);
          }}
          onRoll={sendRollMessage}
          onSendMessage={sendMessage}
          characters={characters}
          setCharacters={setCharacters}
          templates={availableTemplates}
          messages={messages}
          setMessages={setMessages}
        />
        <CharacterModal
          isOpen={isCharacterModalOpen}
          character={editingCharacter}
          templates={templates}
          onClose={() => setIsCharacterModalOpen(false)}
          onRoll={sendRollMessage}
          onSendMessage={sendMessage}
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
    </div>
  );
}
