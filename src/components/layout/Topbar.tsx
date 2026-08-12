"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TopbarProps {
  titulo: string;
  busca: string;
  onBuscaChange: (valor: string) => void;
  onNovoProjeto: () => void;
}

// Topbar simplificada — mesmo cabeçalho (título + busca + Novo projeto) em
// todas as telas da casca (app). "Exportar relatório" saiu daqui e migrou
// pra aba Relatório do drawer (ver DetailsDrawer).
export function Topbar({ titulo, busca, onBuscaChange, onNovoProjeto }: TopbarProps) {
  return (
    <header className="flex h-[54px] shrink-0 items-center gap-3 border-b border-border px-5">
      <h1 className="m-0 text-[15px] font-semibold tracking-[-0.01em]">{titulo}</h1>
      <div className="ml-auto flex items-center gap-2.5">
        <Input
          value={busca}
          onChange={(e) => onBuscaChange(e.target.value)}
          placeholder="Buscar número ou máquina…"
          aria-label="Buscar projetos"
          className="h-8 w-60 text-[13px]"
        />
        <Button onClick={onNovoProjeto} size="sm" className="h-8 px-3.5 text-[13px]">
          Novo projeto
        </Button>
      </div>
    </header>
  );
}
