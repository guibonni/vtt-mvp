"use client";

import { ReactNode } from "react";

type TooltipPosition = "top" | "bottom" | "left" | "right";

type TooltipProps = {
  content: string;
  children: ReactNode;
  position?: TooltipPosition;
};

export default function Tooltip({
  content,
  children,
  position = "top",
}: TooltipProps) {
  const baseClasses = `
    absolute
    px-3 py-2
    text-sm
    bg-[var(--bg-card)]
    text-[var(--text-secondary)]
    border border-[var(--border-subtle)]
    rounded-lg
    shadow-[0_0_20px_rgba(0,0,0,0.6)]
    opacity-0
    transition-all duration-200
    pointer-events-none
    whitespace-nowrap
    z-50
  `;

  const positionClasses = {
    top: `
      bottom-full left-1/2 -translate-x-1/2 mb-3
      translate-y-2
      group-hover:translate-y-0
      group-hover:opacity-100
    `,
    bottom: `
      top-full left-1/2 -translate-x-1/2 mt-3
      -translate-y-2
      group-hover:translate-y-0
      group-hover:opacity-100
    `,
    left: `
      right-full top-1/2 -translate-y-1/2 mr-3
      translate-x-2
      group-hover:translate-x-0
      group-hover:opacity-100
    `,
    right: `
      left-full top-1/2 -translate-y-1/2 ml-3
      -translate-x-2
      group-hover:translate-x-0
      group-hover:opacity-100
    `,
  };

  return (
    <div className="relative group inline-flex">
      {children}

      <div className={`${baseClasses} ${positionClasses[position]}`}>
        {content}
      </div>
    </div>
  );
}
