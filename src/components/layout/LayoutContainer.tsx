import { ReactNode } from "react";
import { TopNavbar } from "./TopNavbar";
import { ResultadoMover } from "@/components/board/ProjectCard";
import { DadosNovoProjeto } from "@/components/board/NovoProjetoDialog";

// Ver Docs/03-Tecnico/Matriz-Componentes.md, seção 1
interface LayoutContainerProps {
  children: ReactNode;
  numeroAtivo: string | null;
  onExportarRelatorio: () => void;
  exportando: boolean;
  erroExportacao: string | null;
  busca: string;
  onBuscaChange: (valor: string) => void;
  onCriarProjeto: (dados: DadosNovoProjeto) => Promise<ResultadoMover>;
}

export function LayoutContainer({
  children,
  numeroAtivo,
  onExportarRelatorio,
  exportando,
  erroExportacao,
  busca,
  onBuscaChange,
  onCriarProjeto,
}: LayoutContainerProps) {
  return (
    <div className="flex h-screen flex-col">
      <TopNavbar
        numeroAtivo={numeroAtivo}
        onExportarRelatorio={onExportarRelatorio}
        exportando={exportando}
        erroExportacao={erroExportacao}
        busca={busca}
        onBuscaChange={onBuscaChange}
        onCriarProjeto={onCriarProjeto}
      />
      <main className="flex-1 overflow-x-auto overflow-y-hidden">{children}</main>
    </div>
  );
}
