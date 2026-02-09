"use client";

import { useEffect, useRef, useState } from "react";
import Tooltip from "../ui/Tooltip";

type RollData = {
  expression: string;
  rolls: number[];
  modifier: number;
  total: number;
};

type Message = {
  id: string;
  author: string;
  content: string;
  type: "text" | "roll";
  rollData?: RollData;
};

function parseRoll(input: string): RollData | null {
  const rollRegex = /(\d+)d(\d+)([+-]\d+)?/i;
  const match = input.match(rollRegex);
  if (!match) return null;

  const quantity = parseInt(match[1]);
  const dice = parseInt(match[2]);
  const modifier = match[3] ? parseInt(match[3]) : 0;

  const rolls: number[] = [];
  for (let i = 0; i < quantity; i++) {
    rolls.push(Math.floor(Math.random() * dice) + 1);
  }

  const total = rolls.reduce((sum, val) => sum + val, 0) + modifier;

  return {
    expression: match[0],
    rolls,
    modifier,
    total,
  };
}

export default function ChatTab() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [showDiceMenu, setShowDiceMenu] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const diceRef = useRef<HTMLDivElement | null>(null);

  function sendRoll(expression: string) {
    const rollData = parseRoll(expression);
    if (!rollData) return;

    const newMessage: Message = {
      id: crypto.randomUUID(),
      author: "Você",
      content: rollData.expression,
      type: "roll",
      rollData,
    };

    setMessages((prev) => [...prev, newMessage]);
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
      if (
        diceRef.current &&
        !diceRef.current.contains(e.target as Node)
      ) {
        setShowDiceMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fechar menu de dados com Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setShowDiceMenu(false);
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Área mensagens */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto p-8 space-y-6"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`rounded-xl p-5 shadow-[0_0_30px_rgba(0,0,0,0.6)] ${
              msg.type === "roll"
                ? "bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-surface)] border border-[var(--accent)]/20"
                : "bg-[var(--bg-card)]"
            }`}
          >
            {msg.type === "roll" && msg.rollData ? (
              <div className="space-y-2">
                <p className="text-[var(--accent-soft)] font-medium">
                  {msg.author} rolou {msg.rollData.expression}
                </p>

                <p className="text-[var(--text-secondary)] text-sm">
                  Dados: [{msg.rollData.rolls.join(", ")}]
                </p>

                <p className="text-[var(--highlight-gold)] text-xl font-semibold">
                  Total: {msg.rollData.total}
                </p>
              </div>
            ) : (
              <p className="text-[var(--text-primary)] break-words">
                {msg.content}
              </p>
            )}
          </div>
        ))}
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
                  <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.3L18.7 7 12 9.7 5.3 7 12 4.3zm-7 4.9l6 2.4v7.1l-6-3.3V9.2zm14 0v6.2l-6 3.3v-7.1l6-2.4z"/>
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
