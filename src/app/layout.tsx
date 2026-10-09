import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CinePrompt Studio (v8) | VIP Mode 3,000s Movie Director",
  description: "AI Prompt Engineering Studio for 3,000-Second Movies (308 Scenes) with Props, Locations, Cinematography, and 4-Section Production Prompts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="dark">
      <body className="bg-[#090d16] text-slate-100 min-h-screen antialiased selection:bg-amber-500/30 selection:text-amber-200">
        {children}
      </body>
    </html>
  );
}
