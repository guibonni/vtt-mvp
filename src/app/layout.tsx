import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/src/components/providers/ThemeProvider";

export const metadata: Metadata = {
  title: "Portal Arcano",
  description: "VTT com fichas modulares e personalizáveis para RPGs de mesa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
