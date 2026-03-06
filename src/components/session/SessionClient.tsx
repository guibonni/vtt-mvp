"use client";

import SessionHeader from "./SessionHeader";
import MapArea from "./MapArea";
import SidePanel from "./SidePanel";
import { useCallback, useEffect, useState } from "react";
import { Character } from "@/src/models/character";
import { Message } from "@/src/models/chat";
import { DiceResult } from "@/src/utils/dice";
import { templates } from "@/src/data/templates";
import {
  ApiError,
  createCharacter,
  getSession,
  listCharacters,
  listMessages,
  removeCharacter,
  sendRollMessage,
  sendTextMessage,
  updateCharacter,
} from "@/src/services/api";

import { WindowManagerProvider } from "@/src/windowing/WindowManagerContext";
import WindowRenderer from "@/src/windowing/WindowRenderer";
import SessionContext from "./SessionContext";
import { useSessionSocket } from "@/src/services/socket";

export default function SessionClient({ sessionId }: { sessionId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [sessionName, setSessionName] = useState<string>();
  const [error, setError] = useState<string | null>(null);
  const [mapUrl, setMapUrl] = useState("");
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [mapUrlInput, setMapUrlInput] = useState("");

  const upsertMessage = useCallback((message: Message) => {
    setMessages((prev) => {
      const index = prev.findIndex((item) => item.id === message.id);
      if (index === -1) return [...prev, message];

      const existing = prev[index];
      const merged: Message = {
        ...existing,
        ...message,
        authorId: message.authorId ?? existing.authorId,
        author: message.author || existing.author,
        content: message.content ?? existing.content,
        rollData: message.rollData ?? existing.rollData,
      };

      const next = [...prev];
      next[index] = merged;
      return next;
    });
  }, []);

  const handleRealtimeMessage = useCallback(
    (message: Message) => {
      upsertMessage(message);
    },
    [upsertMessage]
  );

  useSessionSocket(sessionId, handleRealtimeMessage);

  useEffect(() => {
    async function loadSessionData() {
      setError(null);

      try {
        const [session, loadedCharacters, loadedMessages] = await Promise.all([
          getSession(sessionId),
          listCharacters(sessionId),
          listMessages(sessionId),
        ]);

        setSessionName(session.name);
        setCharacters(loadedCharacters);
        setMessages(loadedMessages);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
          return;
        }
        setError("Falha ao carregar dados da sessao.");
      }
    }

    void loadSessionData();
  }, [sessionId]);

  function sendRoll(result: DiceResult) {
    void (async () => {
      try {
        const created = await sendRollMessage(sessionId, result);
        upsertMessage(created);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Falha ao enviar rolagem.");
      }
    })();
  }

  function sendMessage(message: string) {
    void (async () => {
      try {
        const created = await sendTextMessage(sessionId, message);
        upsertMessage(created);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Falha ao enviar mensagem.");
      }
    })();
  }

  function saveCharacter(updated: Character) {
    void (async () => {
      try {
        const exists = characters.some((character) => character.id === updated.id);
        const response = exists
          ? await updateCharacter(sessionId, updated.id, { data: updated.values })
          : await createCharacter(sessionId, {
              name: updated.name,
              template: updated.templateId,
              data: updated.values,
            });

        setCharacters((prev) => {
          const found = prev.some((character) => character.id === response.id);
          if (found) {
            return prev.map((character) =>
              character.id === response.id ? response : character
            );
          }
          return [...prev, response];
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Falha ao salvar personagem.");
      }
    })();
  }

  function deleteCharacter(id: string) {
    void (async () => {
      try {
        await removeCharacter(sessionId, id);
        setCharacters((prev) => prev.filter((character) => character.id !== id));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Falha ao remover personagem.");
      }
    })();
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
    <SessionContext.Provider
      value={{
        characters,
        templates,
        messages,
        setCharacters,
        setMessages,
        saveCharacter,
        deleteCharacter,
        sendRoll,
        sendMessage,
      }}
    >
      <WindowManagerProvider>
        <div className="h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
          <SessionHeader
            sessionId={sessionId}
            sessionName={sessionName}
            onUploadClick={handleOpenMapModal}
          />

          {error && (
            <div className="px-8 py-2 text-sm text-red-400 border-b border-[var(--border-primary)]">
              {error}
            </div>
          )}

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
