import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TEMA_COOKIE, temaValido } from "@/lib/tema";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gestão de Projetos — LS Control",
  description: "Sistema de Gestão de Comissionamento e Projetos",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const cookieStore = await cookies();
  const temaCookie = cookieStore.get(TEMA_COOKIE)?.value;
  const escuro = temaValido(temaCookie) && temaCookie === "escuro";

  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased${escuro ? " dark" : ""}`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
