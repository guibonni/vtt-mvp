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
        w-[800px]
        bg-[var(--bg-card)]
        border border-[var(--border-subtle)]
        rounded-xl
        shadow-[0_0_40px_rgba(0,0,0,0.7)]
        flex flex-col
        z-50
        transition-all duration-200
        ${isMinimized ? "h-auto" : "max-h-[90vh]"}
      `}
    >
      <div
        onMouseDown={handleMouseDown}
        onDoubleClick={() => setIsMinimized((prev) => !prev)}
        className="p-4 border-b border-[var(--border-subtle)] cursor-move select-none"
      >
        <div className="text-lg font-medium">{title}</div>
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
