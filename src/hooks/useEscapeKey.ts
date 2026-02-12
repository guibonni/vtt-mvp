"use client";

import { useEffect } from "react";

export function useEscapeKey(
  isActive: boolean,
  onEscape: () => void
) {
  useEffect(() => {
    if (!isActive) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onEscape();
      }
    }

    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, [isActive, onEscape]);
}
