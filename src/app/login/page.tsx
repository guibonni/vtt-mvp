"use client";

import { useEffect, useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timeout);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    // Simulação de autenticação
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsLoading(false);
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)] px-6 overflow-hidden">

      {/* 🌫 Textura / atmosfera */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-radial from-[var(--accent)]/5 via-transparent to-transparent" />
        {/* Noise SVG Inline */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.035] pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <filter id="noiseFilter">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.8"
              numOctaves="3"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>

          <rect
            width="100%"
            height="100%"
            filter="url(#noiseFilter)"
          />
        </svg>
      </div>

      {/* Glow roxo */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[var(--accent)] opacity-10 blur-[180px] rounded-full pointer-events-none" />

      {/* Card */}
      <div
        className={`
          relative
          w-full
          max-w-md
          bg-[var(--bg-card)]
          border border-[var(--border-subtle)]
          rounded-2xl
          shadow-[0_0_60px_rgba(0,0,0,0.7)]
          p-10
          transform transition-all duration-700 ease-out
          ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
        `}
      >
        {/* Título */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-wide">
            Portal Arcano
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-2">
            Acesse sua sessão
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="
                w-full px-4 py-2.5
                bg-[var(--bg-surface)]
                border border-[var(--border-subtle)]
                rounded-lg text-sm
                outline-none transition
                focus:border-[var(--accent)]
                focus:ring-1 focus:ring-[var(--accent)]/40
              "
            />
          </div>

          {/* Senha */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="
                w-full px-4 py-2.5
                bg-[var(--bg-surface)]
                border border-[var(--border-subtle)]
                rounded-lg text-sm
                outline-none transition
                focus:border-[var(--accent)]
                focus:ring-1 focus:ring-[var(--accent)]/40
              "
            />
          </div>

          {/* Botão */}
          <button
            type="submit"
            disabled={isLoading}
            className={`
              w-full py-2.5 rounded-lg text-sm font-medium
              transition flex items-center justify-center gap-2
              ${isLoading
                ? "bg-[var(--accent)]/70 cursor-not-allowed"
                : "bg-[var(--accent)] hover:bg-[var(--accent-hover)]"}
              shadow-[0_0_20px_rgba(124,58,237,0.2)]
            `}
          >
            {isLoading && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {isLoading ? "Conjurando..." : "Entrar"}
          </button>
        </form>

        {/* Rodapé */}
        <div className="mt-6 text-center text-xs text-[var(--text-muted)]">
          Ainda não possui conta?
          <a href="/register" className="ml-1 text-[var(--accent-soft)] hover:underline">
            Cadastrar
          </a>
        </div>
      </div>
    </div>
  );
}