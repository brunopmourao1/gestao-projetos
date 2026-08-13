import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  ChecklistOffline,
  ChecklistOnline,
  COLUNAS_FLUXO,
  MetricaTempoEstagio,
  PendenciaVisita,
  ProjetoDetalhado,
} from "@/types/projeto";
import type { RelatorioPayload } from "@/lib/relatorio";
import { STATUS_VISUAL } from "@/components/board/statusVisual";
import { TabNavigation } from "./TabNavigation";
import { EditarProjetoDialog, DadosEditarProjeto } from "@/components/board/EditarProjetoDialog";
import { ExcluirProjetoDialog } from "@/components/board/ExcluirProjetoDialog";
import { ResultadoMover } from "@/components/board/ProjectCard";

// Ver Docs/02-Tecnico/Matriz-Componentes.md, seção 3
// Modal lateral que não perde o contexto do Kanban/Visão geral ao fundo.
interface DetailsDrawerProps {
  projeto: ProjetoDetalhado | null;
  metricas: MetricaTempoEstagio[] | null;
  relatorio: RelatorioPayload | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChecklistAtualizado: (checklist: ChecklistOffline) => void;
  onObservacoesAtualizadas: (observacoes: string | null) => void;
  onPercentualMontagemAtualizado: (percentual: number) => void;
  onChecklistOnlineAtualizado: (checklist: ChecklistOnline) => void;
  onPendenciaAdicionada: (pendencia: PendenciaVisita) => void;
  onPendenciaAtualizada: (pendencia: PendenciaVisita) => void;
  onPendenciaExcluida: (idPendencia: string) => void;
  onEditarProjeto: (id: string, dados: DadosEditarProjeto) => Promise<ResultadoMover>;
  onExcluirProjeto: (id: string) => Promise<ResultadoMover>;
  exportando: boolean;
  erroExportacao: string | null;
  onExportarRelatorio: () => void;
}

export function DetailsDrawer({
  projeto,
  metricas,
  relatorio,
  open,
  onOpenChange,
  onChecklistAtualizado,
  onObservacoesAtualizadas,
  onPercentualMontagemAtualizado,
  onChecklistOnlineAtualizado,
  onPendenciaAdicionada,
  onPendenciaAtualizada,
  onPendenciaExcluida,
  onEditarProjeto,
  onExcluirProjeto,
  exportando,
  erroExportacao,
  onExportarRelatorio,
}: DetailsDrawerProps) {
  const visual = projeto ? STATUS_VISUAL[projeto.statusAtual] : null;
  const statusLabel = projeto
    ? (COLUNAS_FLUXO.find((c) => c.status === projeto.statusAtual)?.titulo ?? projeto.statusAtual)
    : "";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        aria-describedby={undefined}
        className="gap-0 overflow-y-auto p-0 data-[side=right]:sm:max-w-[min(480px,92vw)]"
      >
        <SheetTitle className="sr-only">{projeto ? `Projeto ${projeto.numero}` : "Detalhes do projeto"}</SheetTitle>
        {projeto && visual && (
          <div className="flex flex-col gap-3 px-6 pt-5">
            <div className="flex items-start justify-between gap-3 pr-8">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-[17px] font-semibold tracking-[-0.01em] tabular-nums">{projeto.numero}</span>
                  <span
                    className={`inline-flex items-center gap-[5px] rounded-full py-0.5 pr-2.5 pl-2 text-[11px] font-medium ${visual.badgeBg} ${visual.badgeText}`}
                  >
                    <span className={`size-[5px] shrink-0 rounded-full ${visual.cor}`} />
                    {statusLabel}
                  </span>
                </div>
                {projeto.nomeMaquina && (
                  <span className="text-[13.5px] text-muted-foreground">{projeto.nomeMaquina}</span>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <EditarProjetoDialog projeto={projeto} onEditar={onEditarProjeto} />
                <ExcluirProjetoDialog projeto={projeto} onExcluir={onExcluirProjeto} />
              </div>
            </div>
            <TabNavigation
              projeto={projeto}
              metricas={metricas}
              relatorio={relatorio}
              exportando={exportando}
              erroExportacao={erroExportacao}
              onExportarRelatorio={onExportarRelatorio}
              onChecklistAtualizado={onChecklistAtualizado}
              onObservacoesAtualizadas={onObservacoesAtualizadas}
              onPercentualMontagemAtualizado={onPercentualMontagemAtualizado}
              onChecklistOnlineAtualizado={onChecklistOnlineAtualizado}
              onPendenciaAdicionada={onPendenciaAdicionada}
              onPendenciaAtualizada={onPendenciaAtualizada}
              onPendenciaExcluida={onPendenciaExcluida}
            />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
