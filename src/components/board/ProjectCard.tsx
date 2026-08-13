import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { StickyNote } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ChecklistItemConfig, Projeto } from "@/types/projeto";
import { estaAtrasado, formatarData } from "@/lib/prazo";
import { percentualChecklist } from "@/lib/checklist";

export type ResultadoMover = { ok: true } | { ok: false; mensagem: string };

// Ver Docs/02-Tecnico/Matriz-Componentes.md, seção 2
interface ProjectCardProps {
  projeto: Projeto;
  itensOffline?: ChecklistItemConfig[];
  itensOnline?: ChecklistItemConfig[];
  /** Pendências de visita em aberto (fases Tryout/Entregue) — indicador
   * rápido OK/pendências no card, pra não precisar abrir o drawer só pra
   * saber. `undefined` enquanto o resumo ainda não carregou. */
  pendenciasAbertas?: number;
  onClick?: (projeto: Projeto) => void;
}

export function ProjectCard({
  projeto,
  itensOffline = [],
  itensOnline = [],
  pendenciasAbertas,
  onClick,
}: ProjectCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: projeto.idProjeto,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const atrasado = estaAtrasado(projeto.dataPrevistaConclusao);
  const checklistDaFase =
    projeto.statusAtual === "Offline"
      ? projeto.checklistOffline
      : projeto.statusAtual === "Online"
        ? projeto.checklistOnline
        : null;
  const itensDaFase =
    projeto.statusAtual === "Offline" ? itensOffline : projeto.statusAtual === "Online" ? itensOnline : [];
  // Sem itens configurados pra fase ainda -> nada pra mostrar (evita 0/0).
  const itensChecklist = checklistDaFase !== null && itensDaFase.length > 0 ? itensDaFase : null;
  const percentualFase =
    itensChecklist !== null
      ? percentualChecklist(itensChecklist, checklistDaFase!)
      : projeto.statusAtual === "Montagem"
        ? projeto.percentualMontagem
        : null;
  const concluidos = itensChecklist?.filter((item) => checklistDaFase![item.chave]).length ?? null;
  const rotuloProgresso =
    itensChecklist !== null ? `${percentualFase}% · ${concluidos}/${itensChecklist.length} itens` : `${percentualFase}% montagem`;

  const temObservacao = Boolean(projeto.observacoes?.trim());
  const acompanhaPendencias = projeto.statusAtual === "Tryout" || projeto.statusAtual === "Entregue";
  const totalPendenciasAbertas = pendenciasAbertas ?? 0;
  const temPendenciasAbertas = totalPendenciasAbertas > 0;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={() => onClick?.(projeto)} className="cursor-grab active:cursor-grabbing">
      <Card
        className="gap-0 rounded-lg border-border bg-card p-0 shadow-xs ring-0 transition-[border-color,box-shadow] duration-150 hover:border-[color-mix(in_oklch,var(--foreground)_20%,var(--border))] hover:shadow-sm dark:border-white/15"
      >
        <div className="flex flex-col gap-2 px-3.5 py-3">
          <div className="flex items-center justify-between gap-2">
            <span className="flex min-w-0 items-center gap-1.5">
              {projeto.nomeCliente && (
                <>
                  <span className="truncate text-[12.5px] text-muted-foreground">{projeto.nomeCliente}</span>
                  <span className="shrink-0 text-muted-foreground">·</span>
                </>
              )}
              <span className="shrink-0 text-[13px] font-semibold tabular-nums">{projeto.numero}</span>
              {temObservacao && (
                <span role="img" aria-label="Possui observação" title="Possui observação">
                  <StickyNote className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                </span>
              )}
            </span>
            {atrasado && (
              <span className="inline-flex items-center gap-[5px] rounded-full bg-destructive/10 py-0.5 pr-2 pl-[7px] text-[11px] font-semibold text-destructive-foreground">
                <span className="size-[5px] shrink-0 rounded-full bg-destructive" />
                Atrasado
              </span>
            )}
          </div>
          {projeto.nomeMaquina && (
            <p className="text-[12.5px] leading-[1.4] text-muted-foreground">{projeto.nomeMaquina}</p>
          )}
          {percentualFase !== null ? (
            <div className="flex flex-col gap-1">
              <div className="h-1 overflow-hidden rounded-full bg-track">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-200 ease-out"
                  style={{ width: `${percentualFase}%` }}
                />
              </div>
              <div className="flex justify-between text-[11.5px] tabular-nums text-muted-foreground">
                <span>{rotuloProgresso}</span>
                {projeto.dataPrevistaConclusao && (
                  <span className={atrasado ? "font-medium text-destructive-foreground" : undefined}>
                    {formatarData(projeto.dataPrevistaConclusao)}
                  </span>
                )}
              </div>
            </div>
          ) : (
            (acompanhaPendencias || projeto.dataPrevistaConclusao) && (
              <div className="flex items-center justify-between gap-2 text-[11.5px] tabular-nums">
                {acompanhaPendencias ? (
                  <span
                    className={`inline-flex items-center gap-[5px] rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      temPendenciasAbertas
                        ? "bg-destructive/10 text-destructive-foreground"
                        : "bg-status-entregue/12 text-status-entregue-foreground"
                    }`}
                  >
                    <span
                      className={`size-[5px] shrink-0 rounded-full ${temPendenciasAbertas ? "bg-destructive" : "bg-status-entregue"}`}
                    />
                    {temPendenciasAbertas
                      ? `${totalPendenciasAbertas} pendência${totalPendenciasAbertas === 1 ? "" : "s"}`
                      : "OK"}
                  </span>
                ) : (
                  <span />
                )}
                {projeto.dataPrevistaConclusao && (
                  <span className={atrasado ? "font-medium text-destructive-foreground" : "text-muted-foreground"}>
                    {formatarData(projeto.dataPrevistaConclusao)}
                  </span>
                )}
              </div>
            )
          )}
        </div>
      </Card>
    </div>
  );
}
