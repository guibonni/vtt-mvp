import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
