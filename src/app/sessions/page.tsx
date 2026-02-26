"use client";

import { useEffect, useState } from "react";

type Session = {
  id: string;
  name: string;
  gm: string;
  createdAt: Date;
};

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: "1",
      name: "Crônicas de Valdoria",
      gm: "Você",
      createdAt: new Date(),
    },
    {
      id: "2",
      name: "Sombras de Eldrath",
      gm: "Mestre Kael",
      createdAt: new Date(),
    },
  ]);

  const [isVisible, setIsVisible] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timeout);
  }, []);

  function handleCreateSession() {
    const newSession: Session = {
      id: crypto.randomUUID(),
      name: "Nova Jornada",
      gm: "Você",
      createdAt: new Date(),
    };

    setSessions((prev) => [...prev, newSession]);
  }

  function SidebarItem({
    icon,
    label,
    collapsed,
    active = false,
  }: {
    icon: string;
    label: string;
    collapsed: boolean;
    active?: boolean;
  }) {
    return (
      <button
        className={`
        flex items-center gap-3 px-3 py-2 rounded-lg transition
        ${active
            ? "bg-[var(--accent)]/10 text-[var(--accent-soft)]"
            : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]"
          }
      `}
        title={collapsed ? label : undefined}
      >
        <span className="text-base">{icon}</span>
        {!collapsed && <span>{label}</span>}
      </button>
    );
  }

  return (
    <div className="relative min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden">

      {/* Atmosfera */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-radial from-[var(--accent)]/5 via-transparent to-transparent" />
      </div>

      {/* Noise */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.035] pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>

      <div className="relative z-10 flex h-screen">

        {/* SIDEBAR */}
        <aside
          className={`
    relative
    transition-all duration-300 ease-in-out
    ${isCollapsed ? "w-20" : "w-64"}
    bg-[var(--bg-secondary)]
    border-r border-[var(--border-primary)]
    flex flex-col
    px-4 py-8
  `}
        >
          {/* Toggle */}
          <button
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="
      absolute top-4 right-4
      text-[var(--text-muted)]
      hover:text-[var(--text-primary)]
      transition
    "
          >
            <svg
              className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""
                }`}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          {/* Avatar */}
          <div className="flex items-center gap-3 mb-10 mt-6">
            <div
              className="
        w-10 h-10
        rounded-full
        bg-[var(--accent)]/20
        border border-[var(--accent)]/40
        flex items-center justify-center
        text-sm font-medium
        shadow-[0_0_15px_rgba(124,58,237,0.3)]
      "
            >
              A
            </div>

            {!isCollapsed && (
              <div>
                <div className="text-sm font-medium">Arquimago</div>
                <div className="text-xs text-[var(--text-muted)]">
                  Mestre do Véu
                </div>
              </div>
            )}
          </div>

          {/* Navegação */}
          <nav className="flex flex-col gap-4 text-sm mt-4">
            <SidebarItem
              icon="📜"
              label="Sessões"
              collapsed={isCollapsed}
              active
            />
            <SidebarItem
              icon="👤"
              label="Perfil"
              collapsed={isCollapsed}
            />
            <SidebarItem
              icon="⚙"
              label="Configurações"
              collapsed={isCollapsed}
            />
          </nav>

          <div className="mt-auto text-xs text-[var(--text-muted)]">
            {!isCollapsed && "© Portal Arcano"}
          </div>
        </aside>

        {/* CONTEÚDO PRINCIPAL */}
        <main className="flex-1 overflow-y-auto px-12 py-12">

          <div className="flex justify-between items-center mb-10">
            <h1 className="text-2xl font-semibold tracking-wide">
              Suas Sessões
            </h1>

            <button
              onClick={handleCreateSession}
              className="px-5 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-lg text-sm transition shadow-[0_0_20px_rgba(124,58,237,0.2)]"
            >
              + Criar Sessão
            </button>
          </div>

          <div
            className={`
              grid
              grid-cols-1
              md:grid-cols-2
              xl:grid-cols-3
              gap-8
              transition-all duration-700
              ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
            `}
          >
            {sessions.map((session) => (
              <div
                key={session.id}
                className="
                  bg-[var(--bg-card)]
                  border border-[var(--border-subtle)]
                  rounded-xl
                  p-6
                  transition
                  hover:border-[var(--accent)]/40
                  hover:shadow-[0_0_30px_rgba(124,58,237,0.15)]
                "
              >
                <div className="text-lg font-medium mb-2">
                  {session.name}
                </div>

                <div className="text-xs text-[var(--text-muted)]">
                  Mestre: {session.gm}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}