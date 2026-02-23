"use client";

import { useState } from "react";

type Props = {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export default function CharacterWindow({ title, children, footer }: Props) {
  const [position, setPosition] = useState({ x: 200, y: 100 });
  const [isMinimized, setIsMinimized] = useState(false);

  function handleMouseDown(e: React.MouseEvent) {
    const startX = e.clientX - position.x;
    const startY = e.clientY - position.y;

    function handleMouseMove(e: MouseEvent) {
      setPosition({
        x: e.clientX - startX,
        y: e.clientY - startY,
      });
    }

    function handleMouseUp() {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }

  return (
    <div
      style={{ top: position.y, left: position.x }}
      className={`
        fixed
        bg-[var(--bg-card)]
        border border-[var(--border-subtle)]
        rounded-xl
        flex flex-col
        z-50
        transition-[width,height] duration-300 ease-in-out
        overflow-hidden
        ${isMinimized ? "w-fit h-auto opacity-95" : "w-[800px] max-h-[90vh] opacity-100"}
        ${isMinimized ? "shadow-[0_0_20px_rgba(0,0,0,0.5)]" : "shadow-[0_0_40px_rgba(0,0,0,0.7)]"}
      `}
    >
      <div
        onMouseDown={handleMouseDown}
        onDoubleClick={() => setIsMinimized((prev) => !prev)}
        className={`
          border-b border-[var(--border-subtle)]
          cursor-move select-none
          flex justify-between items-center
          transition-all duration-300 ease-in-out
          ${isMinimized ? "px-4 py-2" : "p-4"}
        `}
      >
        <div className="text-lg font-medium whitespace-nowrap">
          {title}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation(); // evita disparar drag
            setIsMinimized((prev) => !prev);
          }}
          className="
            ml-4
            opacity-60 hover:opacity-100
            transition
          "
        >
          {isMinimized ? (
            // Ícone expandir
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M7 14l5-5 5 5H7z" />
            </svg>
          ) : (
            // Ícone minimizar
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M7 10l5 5 5-5H7z" />
            </svg>
          )}
        </button>
      </div>

      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>

          {footer && (
            <div className="border-t border-[var(--border-subtle)]">
              {footer}
            </div>
          )}
        </>
      )}

    </div>
  );
}
