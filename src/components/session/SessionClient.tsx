"use client";

import SessionHeader from "./SessionHeader";
import MapArea from "./MapArea";
import SidePanel from "./SidePanel";
import { useState } from "react";
import { Character } from "@/src/models/character";
import { Message } from "@/src/models/chat";
import { DiceResult } from "@/src/utils/dice";
import { templates } from "@/src/data/templates";

import { WindowManagerProvider } from "@/src/windowing/WindowManagerContext";
import WindowRenderer from "@/src/windowing/WindowRenderer";
import SessionContext from "./SessionContext";

export default function SessionClient({ sessionId }: { sessionId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);

  function sendRollMessage(result: DiceResult) {
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        author: "Você",
        type: "roll",
        rollData: result,
        createdAt: new Date(),
      },
    ]);
  }

  function sendChatMessage(message: string) {
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
        return prev.map((c) =>
          c.id === updated.id ? updated : c
        );
      }
      return [...prev, updated];
    });
  }

  function handleCharacterDelete(id: string) {
    setCharacters((prev) =>
      prev.filter((c) => c.id !== id)
    );
  }

  return (
    <SessionContext.Provider value={{
      characters,
      templates,
      messages,
      setCharacters,
      setMessages,
      saveCharacter: handleCharacterSave,
      deleteCharacter: handleCharacterDelete,
      sendRoll: sendRollMessage,
      sendMessage: sendChatMessage,
    }}>
      <WindowManagerProvider>
        <div className="h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
          <SessionHeader sessionId={sessionId} />

          <div className="flex-1 grid grid-cols-[1fr_420px] xl:grid-cols-[1fr_460px] 2xl:grid-cols-[1fr_500px] overflow-hidden">
            <MapArea mapUrl="https://i0.wp.com/2minutetabletop.com/wp-content/uploads/2018/11/Wei-Continent-RPG-World-Map-spring.jpg" />

            <SidePanel />
          </div>
          <WindowRenderer />
        </div>
      </WindowManagerProvider>
    </SessionContext.Provider>
  );
}