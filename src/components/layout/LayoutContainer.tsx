import { ReactNode } from "react";
import { TopNavbar } from "./TopNavbar";

// Ver Docs/03-Tecnico/Matriz-Componentes.md, seção 1
interface LayoutContainerProps {
  children: ReactNode;
  nomeMaquinaAtiva: string | null;
  onExportarRelatorio: () => void;
  exportando: boolean;
  erroExportacao: string | null;
  busca: string;
  onBuscaChange: (valor: string) => void;
}

export function LayoutContainer({
  children,
  nomeMaquinaAtiva,
  onExportarRelatorio,
  exportando,
  erroExportacao,
  busca,
  onBuscaChange,
}: LayoutContainerProps) {
  return (
    <div className="flex h-screen flex-col">
      <TopNavbar
        nomeMaquinaAtiva={nomeMaquinaAtiva}
        onExportarRelatorio={onExportarRelatorio}
        exportando={exportando}
        erroExportacao={erroExportacao}
        busca={busca}
        onBuscaChange={onBuscaChange}
      />
      <main className="flex-1 overflow-x-auto overflow-y-hidden">{children}</main>
    </div>
  );
}
