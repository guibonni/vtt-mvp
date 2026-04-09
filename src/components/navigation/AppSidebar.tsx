"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { clearAuthSession, getAuthUserName } from "@/src/services/api";

type SidebarSection = "sessions" | "templates" | "preferences";

type AppSidebarProps = {
  activeSection: SidebarSection;
  subtitle?: string;
};

type SidebarItemProps = {
  icon: string;
  label: string;
  href: string;
  collapsed: boolean;
  active?: boolean;
  onNavigate: (href: string) => void;
};

function SidebarItem({
  icon,
  label,
  href,
  collapsed,
  active = false,
  onNavigate,
}: SidebarItemProps) {
  return (
    <button
      type="button"
      onClick={() => onNavigate(href)}
      className={`
        flex items-center gap-3 rounded-lg px-3 py-2 text-left transition
        ${
          active
            ? "bg-[var(--accent)]/10 text-[var(--accent-soft)]"
            : "text-[var(--text-muted)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]"
        }
      `}
      title={collapsed ? label : undefined}
    >
      <span className="text-base">{icon}</span>
      {!collapsed && <span>{label}</span>}
    </button>
  );
}

export function AppSidebar({
  activeSection,
  subtitle = "Aventureiro",
}: AppSidebarProps) {
  const router = useRouter();
  const currentUser = getAuthUserName() ?? "Voce";
  const [isCollapsed, setIsCollapsed] = useState(false);

  function handleLogout() {
    clearAuthSession();
    router.push("/login");
  }

  return (
    <aside
      className={`
        relative flex flex-col border-r border-[var(--border-primary)] bg-[var(--bg-secondary)] px-4 py-8
        transition-all duration-300 ease-in-out
        ${isCollapsed ? "w-20" : "w-64"}
      `}
    >
      <button
        type="button"
        onClick={() => setIsCollapsed((prev) => !prev)}
        className="absolute top-4 right-4 text-[var(--text-muted)] transition hover:text-[var(--text-primary)]"
      >
        <svg
          className={`h-4 w-4 transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      <div className="mt-6 mb-10 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--accent)]/40 bg-[var(--accent)]/20 text-sm font-medium shadow-[0_0_15px_rgba(124,58,237,0.3)]">
          <span>{currentUser.charAt(0).toUpperCase()}</span>
        </div>

        {!isCollapsed && (
          <div>
            <div className="text-sm font-medium">{currentUser}</div>
            <div className="text-xs text-[var(--text-muted)]">{subtitle}</div>
          </div>
        )}
      </div>

      <nav className="mt-4 flex flex-col gap-4 text-sm">
        <SidebarItem
          icon="S"
          label="Sessões"
          href="/sessions"
          collapsed={isCollapsed}
          active={activeSection === "sessions"}
          onNavigate={router.push}
        />
        <SidebarItem
          icon="T"
          label="Templates"
          href="/templates"
          collapsed={isCollapsed}
          active={activeSection === "templates"}
          onNavigate={router.push}
        />
        <SidebarItem
          icon="P"
          label="Preferências"
          href="/preferences"
          collapsed={isCollapsed}
          active={activeSection === "preferences"}
          onNavigate={router.push}
        />
      </nav>

      <div className="mt-auto">
        <button
          type="button"
          onClick={handleLogout}
          className="mb-3 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-2 text-sm transition hover:border-[var(--accent)]/40"
        >
          Logout
        </button>
      </div>

      <div className="text-xs text-[var(--text-muted)]">
        {!isCollapsed && "Portal Arcano"}
      </div>
    </aside>
  );
}
