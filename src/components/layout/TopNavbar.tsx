"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Ver Docs/02-Tecnico/Matriz-Componentes.md, seção 1
// TODO: busca global (HU-03) ainda não implementada.
interface TopNavbarProps {
  nomeMaquinaAtiva: string | null;
  onExportarRelatorio: () => void;
  exportando: boolean;
  erroExportacao: string | null;
}

export function TopNavbar({
  nomeMaquinaAtiva,
  onExportarRelatorio,
  exportando,
  erroExportacao,
}: TopNavbarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b px-4">
      <h1 className="text-lg font-semibold">Gestão de Comissionamento</h1>
      <Input
        placeholder="Buscar máquina..."
        className="max-w-xs"
        disabled
      />
      <div className="relative ml-auto">
        <Button
          disabled={!nomeMaquinaAtiva || exportando}
          onClick={onExportarRelatorio}
        >
          {exportando ? "Exportando..." : "Exportar relatório"}
        </Button>
        {erroExportacao && (
          <p className="absolute top-full right-0 mt-1 whitespace-nowrap text-xs text-destructive">
            {erroExportacao}
          </p>
        )}
      </div>
    </header>
  );
}
