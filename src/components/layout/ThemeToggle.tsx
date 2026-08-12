"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { TEMA_COOKIE, type Tema } from "@/lib/tema";

interface ThemeToggleProps {
  temaInicial: Tema;
}

// Segmented Claro|Escuro — aplica a classe `dark` no <html> na hora (sem
// esperar navegação) e persiste em cookie (lido no server em layout.tsx,
// evita FOUC) e em localStorage.
export function ThemeToggle({ temaInicial }: ThemeToggleProps) {
  const [tema, setTema] = useState<Tema>(temaInicial);

  function aplicar(novoTema: Tema) {
    setTema(novoTema);
    document.documentElement.classList.toggle("dark", novoTema === "escuro");
    document.cookie = `${TEMA_COOKIE}=${novoTema}; path=/; max-age=31536000; samesite=lax`;
    try {
      localStorage.setItem(TEMA_COOKIE, novoTema);
    } catch {
      // localStorage indisponível (ex.: navegação privada) — cookie já basta.
    }
  }

  return (
    <div className="flex h-7 overflow-hidden rounded-md border border-border" role="group" aria-label="Tema da interface">
      <button
        type="button"
        aria-label="Tema claro"
        aria-pressed={tema === "claro"}
        onClick={() => aplicar("claro")}
        className={cn(
          "flex-1 text-xs font-medium",
          tema === "claro" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted"
        )}
      >
        Claro
      </button>
      <button
        type="button"
        aria-label="Tema escuro"
        aria-pressed={tema === "escuro"}
        onClick={() => aplicar("escuro")}
        className={cn(
          "flex-1 text-xs font-medium",
          tema === "escuro" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted"
        )}
      >
        Escuro
      </button>
    </div>
  );
}
