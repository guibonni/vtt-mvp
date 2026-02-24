"use client";

import SessionHeader from "./SessionHeader";
import MapArea from "./MapArea";
import SidePanel from "./SidePanel";
import { useState } from "react";
import { Character } from "@/src/models/character";
import CharacterModal from "../characters/CharacterModal";
import { templates } from "@/src/data/templates";
import { Message } from "@/src/models/chat";
import { DiceResult } from "@/src/utils/dice";

type OpenCharacterWindow = {
  windowId: string;
  character: Character | null;
  zIndex: number;
};

export default function SessionClient({ sessionId }: { sessionId: string }) {
  const [openWindows, setOpenWindows] = useState<OpenCharacterWindow[]>([]);
  const [topZIndex, setTopZIndex] = useState(100);
  const [messages, setMessages] = useState<Message[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);

  const highestZ = Math.max(...openWindows.map(w => w.zIndex), 0);

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

  function handleCharacterSave(updated: Character) {
    setCharacters((prev) => {
      const exists = prev.find((c) => c.id === updated.id);
      if (exists) {
        return prev.map((c) => (c.id === updated.id ? updated : c));
      }
      return [...prev, updated];
    });
  }

  function handleCharacterDelete(id: string) {
    setCharacters((prev) => prev.filter((c) => c.id !== id));
  }

  function openCharacterWindow(character: Character | null) {
    setOpenWindows((prev) => [
      ...prev,
      {
        windowId: crypto.randomUUID(),
        character,
        zIndex: topZIndex + 1,
      },
    ]);

    setTopZIndex((prev) => prev + 1);
  }

  function closeCharacterWindow(windowId: string) {
    setOpenWindows((prev) =>
      prev.filter((w) => w.windowId !== windowId)
    );
  }

  function bringToFront(windowId: string) {
    setOpenWindows((prev) =>
      prev.map((w) =>
        w.windowId === windowId
          ? { ...w, zIndex: topZIndex + 1 }
          : w
      )
    );

    setTopZIndex((prev) => prev + 1);
  }

  return (
    <div className="h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <SessionHeader sessionId={sessionId} />

      <div className="flex-1 grid grid-cols-[1fr_420px] xl:grid-cols-[1fr_460px] 2xl:grid-cols-[1fr_500px] overflow-hidden">
        <MapArea mapUrl="https://i0.wp.com/2minutetabletop.com/wp-content/uploads/2018/11/Wei-Continent-RPG-World-Map-spring.jpg" />
        <SidePanel
          onOpenCharacter={openCharacterWindow}
          onSendMessage={sendMessage}
          characters={characters}
          setCharacters={setCharacters}
          messages={messages}
          setMessages={setMessages}
        />
        {openWindows.map((window) => (
          <CharacterModal
            key={window.windowId}
            isOpen={true}
            character={window.character}
            templates={templates}
            onClose={() => closeCharacterWindow(window.windowId)}
            onSave={handleCharacterSave}
            onDelete={handleCharacterDelete}
            onRoll={sendRollMessage}
            onSendMessage={sendMessage}
            zIndex={window.zIndex}
            isActive={window.zIndex === highestZ}
            onFocus={() => bringToFront(window.windowId)}
          />
        ))}
      </div>
    </div>
  );
}
