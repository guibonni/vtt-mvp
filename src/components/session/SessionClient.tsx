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
  const [mapUrl, setMapUrl] = useState("");
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [mapUrlInput, setMapUrlInput] = useState("");

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

  function handleOpenMapModal() {
    setMapUrlInput(mapUrl);
    setIsMapModalOpen(true);
  }

  function handleCloseMapModal() {
    setIsMapModalOpen(false);
  }

  function handleApplyMapUrl() {
    setMapUrl(mapUrlInput.trim());
    setIsMapModalOpen(false);
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
          <SessionHeader sessionId={sessionId} onUploadClick={handleOpenMapModal} />

          <div className="flex-1 grid grid-cols-[1fr_420px] xl:grid-cols-[1fr_460px] 2xl:grid-cols-[1fr_500px] overflow-hidden">
            <MapArea mapUrl={mapUrl} />

            <SidePanel />
          </div>
          <WindowRenderer />

          {isMapModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
              <div
                className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"
                onClick={handleCloseMapModal}
              />

              <div className="relative w-full max-w-md rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 shadow-[0_0_40px_rgba(0,0,0,0.7)]">
                <h2 className="text-lg font-semibold">Carregar mapa por URL</h2>
                <p className="mt-2 text-sm text-[var(--text-muted)]">
                  Informe o link direto de uma imagem para usar como mapa.
                </p>

                <input
                  type="url"
                  value={mapUrlInput}
                  onChange={(e) => setMapUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleApplyMapUrl();
                  }}
                  placeholder="https://exemplo.com/mapa.jpg"
                  className="mt-4 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-2.5 text-sm outline-none transition focus:border-[var(--accent)]"
                />

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={handleCloseMapModal}
                    className="px-4 py-2 text-sm rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleApplyMapUrl}
                    className="px-4 py-2 text-sm rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] transition"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </WindowManagerProvider>
    </SessionContext.Provider>
  );
}
