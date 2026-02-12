"use client";

import { useEffect, useRef, useState } from "react";
import Tooltip from "../ui/Tooltip";
import React from "react";
import { Message } from "@/src/models/chat";
import { useEscapeKey } from "@/src/hooks/useEscapeKey";
import { rollExpression } from "@/src/utils/dice";

type ChatTabProps = {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
};

export default function ChatTab({ messages, setMessages }: ChatTabProps) {
  const [showDiceMenu, setShowDiceMenu] = useState(false);
  const [message, setMessage] = useState("");
  const [, setNow] = useState(Date.now());

  const currentUser = "Você"; // TODO: substituir pelo usuário real quando houver autenticação

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const diceRef = useRef<HTMLDivElement | null>(null);

  function sendRoll(expression: string) {
    // Separar modificador se existir (ex: 1d20+5)
    const match = expression.match(/^(\d+d\d+)([+-]\d+)?$/);

    if (!match) return;

    const dicePart = match[1];
    const modifier = match[2] ? Number(match[2]) : 0;

    const result = rollExpression(dicePart, modifier);

    if (!result) return;

    const newMessage: Message = {
      id: crypto.randomUUID(),
      author: "Você",
      type: "roll",
      rollData: result,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage("");
    return;
  }

  function rollDice(sides: number) {
    sendRoll(`1d${sides}`);
    setShowDiceMenu(false);
  }

  function handleSend() {
    if (!message.trim()) return;

    if (message.startsWith("/roll")) {
      sendRoll(message.replace("/roll ", ""));
    } else {
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

    setMessage("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      handleSend();
    }
  }

  function formatTimestamp(date: Date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "agora";
    }

    const isSameDay =
      now.getDate() === date.getDate() &&
      now.getMonth() === date.getMonth() &&
      now.getFullYear() === date.getFullYear();

    if (!isSameDay) {
      return (
        date.toLocaleDateString([], {
          day: "2-digit",
          month: "2-digit",
        }) +
        " " +
        date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Scroll automático
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    el.scrollTo({
      top: el.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  // Fechar menu de dados ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (diceRef.current && !diceRef.current.contains(e.target as Node)) {
        setShowDiceMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEscapeKey(true, setShowDiceMenu.bind(null, false));

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 30000); // atualiza a cada 30s

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Área mensagens */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto p-8 space-y-6"
      >
        {messages.map((msg, index) => {
          const isOwn = msg.author === currentUser;
          const isMaster = msg.author === "Mestre";
          const previous = messages[index - 1];
          const isGrouped = previous && previous.author === msg.author;
          const isNewDay =
            !previous ||
            new Date(previous.createdAt).toDateString() !==
              new Date(msg.createdAt).toDateString();

          return (
            <React.Fragment key={msg.id}>
              {isNewDay && (
                <div className="flex items-center justify-center my-6">
                  <div className="flex items-center gap-4 w-full max-w-md">
                    <div className="flex-1 h-px bg-[var(--border-subtle)]" />
                    <span className="text-xs text-[var(--text-muted)]">
                      {new Date(msg.createdAt).toLocaleDateString([], {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </span>
                    <div className="flex-1 h-px bg-[var(--border-subtle)]" />
                  </div>
                </div>
              )}

              <div
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`
                    max-w-[75%]
                    rounded-xl
                    p-4
                    shadow-[0_0_25px_rgba(0,0,0,0.5)]
                    transition
                    ${
                      isOwn
                        ? "bg-[var(--accent)] text-white"
                        : isMaster
                          ? "bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-surface)] border border-[var(--accent)]/20"
                          : "bg-[var(--bg-card)]"
                    }
                    ${isGrouped ? "mt-1" : "mt-4"}
                  `}
                >
                  {!isGrouped && (
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-xs font-medium opacity-80">
                        {msg.author}
                      </span>

                      <span className="text-[10px] font-medium opacity-60">
                        • {formatTimestamp(msg.createdAt)}
                      </span>
                    </div>
                  )}

                  {msg.type === "roll" && msg.rollData ? (
                    <div className="space-y-1">
                      <p className="text-sm opacity-80">
                        Rolou {msg.rollData.expression}
                      </p>

                      <p className="text-sm opacity-80">
                        Dados: [{msg.rollData.rolls.join(", ")}]
                      </p>

                      <p className="text-lg font-semibold">
                        Total: {msg.rollData.total}
                      </p>
                    </div>
                  ) : (
                    <p className="break-words text-sm">{msg.content}</p>
                  )}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Input */}
      <div className="relative p-6 border-t border-[var(--border-primary)] bg-[var(--bg-surface)]">
        <div className="flex gap-3">
          {/* Botão Dados */}
          <div ref={diceRef} className="relative group">
            <Tooltip content="Rolar dado">
              {/* Botão */}
              <button
                aria-expanded={showDiceMenu}
                onClick={() => setShowDiceMenu((prev) => !prev)}
                className={`px-3 py-2 rounded-lg border transition relative flex items-center justify-center
                  ${
                    showDiceMenu
                      ? "bg-[var(--accent)] border-[var(--accent)] shadow-[0_0_15px_var(--accent)] text-white"
                      : "bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-[var(--accent)]/40"
                  }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.3L18.7 7 12 9.7 5.3 7 12 4.3zm-7 4.9l6 2.4v7.1l-6-3.3V9.2zm14 0v6.2l-6 3.3v-7.1l6-2.4z" />
                </svg>
              </button>
            </Tooltip>

            {/* Dropdown */}
            <div
              className={`absolute bottom-14 left-0 w-28 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.6)] p-3 flex flex-col gap-2 z-50 origin-bottom-left transition-all duration-200
                ${
                  showDiceMenu
                    ? "opacity-100 translate-y-0 scale-100"
                    : "opacity-0 translate-y-2 scale-95 pointer-events-none"
                }`}
            >
              {[4, 6, 8, 12, 20, 100].map((sides) => (
                <button
                  key={sides}
                  onClick={() => rollDice(sides)}
                  className="w-full px-3 py-2 text-sm bg-[var(--bg-surface)] rounded-md hover:bg-[var(--accent)] hover:text-white transition"
                >
                  d{sides}
                </button>
              ))}
            </div>
          </div>

          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Sussurre ao destino..."
            className="flex-1 px-4 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg outline-none focus:border-[var(--accent)]/50 transition text-sm"
          />

          <button
            onClick={handleSend}
            className="px-5 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-lg text-sm transition"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
