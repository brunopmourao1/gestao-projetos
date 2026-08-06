import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { EspecificacoesTecnicas, MetricaTempoEstagio, ProjetoDetalhado } from "@/types/projeto";
import type { RelatorioPayload } from "@/lib/relatorio";
import { TabNavigation } from "./TabNavigation";
import { EditarProjetoDialog, DadosEditarProjeto } from "@/components/board/EditarProjetoDialog";
import { ExcluirProjetoDialog } from "@/components/board/ExcluirProjetoDialog";
import { ResultadoMover } from "@/components/board/ProjectCard";

// Ver Docs/02-Tecnico/Matriz-Componentes.md, seção 3
// Modal lateral (40% da tela) que não perde o contexto do Kanban ao fundo.
interface DetailsDrawerProps {
  projeto: ProjetoDetalhado | null;
  metricas: MetricaTempoEstagio[] | null;
  relatorio: RelatorioPayload | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEspecificacoesAtualizadas: (espec: EspecificacoesTecnicas) => void;
  onEditarProjeto: (id: string, dados: DadosEditarProjeto) => Promise<ResultadoMover>;
  onExcluirProjeto: (id: string) => Promise<ResultadoMover>;
}

export function DetailsDrawer({
  projeto,
  metricas,
  relatorio,
  open,
  onOpenChange,
  onEspecificacoesAtualizadas,
  onEditarProjeto,
  onExcluirProjeto,
}: DetailsDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[40vw] min-w-[320px] sm:max-w-none px-4">
        <SheetHeader>
          <div className="flex items-center justify-between gap-2 pr-8">
            <SheetTitle>
              {projeto
                ? projeto.nomeMaquina
                  ? `${projeto.numero} — ${projeto.nomeMaquina}`
                  : projeto.numero
                : "Projeto"}
            </SheetTitle>
            {projeto && (
              <div className="flex gap-2">
                <EditarProjetoDialog projeto={projeto} onEditar={onEditarProjeto} />
                <ExcluirProjetoDialog projeto={projeto} onExcluir={onExcluirProjeto} />
              </div>
            )}
          </div>
        </SheetHeader>
        {projeto && (
          <TabNavigation
            projeto={projeto}
            metricas={metricas}
            relatorio={relatorio}
            onEspecificacoesAtualizadas={onEspecificacoesAtualizadas}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
