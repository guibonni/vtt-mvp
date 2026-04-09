"use client";

import { useEffect } from "react";
import { applyTheme, getThemeFromPreferences, getUserPreferences } from "@/src/services/api";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    applyTheme(getThemeFromPreferences(getUserPreferences()));
  }, []);

  return <>{children}</>;
}
