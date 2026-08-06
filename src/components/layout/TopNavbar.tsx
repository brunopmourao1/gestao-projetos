"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NovoProjetoDialog, DadosNovoProjeto } from "@/components/board/NovoProjetoDialog";
import { ResultadoMover } from "@/components/board/ProjectCard";

// Ver Docs/02-Tecnico/Matriz-Componentes.md, seção 1
interface TopNavbarProps {
  numeroAtivo: string | null;
  onExportarRelatorio: () => void;
  exportando: boolean;
  erroExportacao: string | null;
  busca: string;
  onBuscaChange: (valor: string) => void;
  onCriarProjeto: (dados: DadosNovoProjeto) => Promise<ResultadoMover>;
}

export function TopNavbar({
  numeroAtivo,
  onExportarRelatorio,
  exportando,
  erroExportacao,
  busca,
  onBuscaChange,
  onCriarProjeto,
}: TopNavbarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b px-4">
      <h1 className="text-lg font-semibold">Gestão de Comissionamento</h1>
      <Input
        placeholder="Buscar máquina..."
        className="max-w-xs"
        value={busca}
        onChange={(e) => onBuscaChange(e.target.value)}
      />
      <NovoProjetoDialog onCriar={onCriarProjeto} />
      <div className="relative ml-auto">
        <Button
          disabled={!numeroAtivo || exportando}
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
