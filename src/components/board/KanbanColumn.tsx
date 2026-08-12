import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ChecklistItemConfig, Projeto, StatusProjeto } from "@/types/projeto";
import { STATUS_VISUAL } from "./statusVisual";
import { ProjectCard } from "./ProjectCard";

interface KanbanColumnProps {
  status: StatusProjeto;
  titulo: string;
  // Já ordenados por ordem ascendente (menor = mais crítico, topo da coluna).
  projetos: Projeto[];
  itensOffline: ChecklistItemConfig[];
  itensOnline: ChecklistItemConfig[];
  pendenciasPorProjeto: Record<string, number>;
  onSelectProjeto?: (projeto: Projeto) => void;
}

export function KanbanColumn({
  status,
  titulo,
  projetos,
  itensOffline,
  itensOnline,
  pendenciasPorProjeto,
  onSelectProjeto,
}: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id: status });
  const ids = projetos.map((p) => p.idProjeto);

  return (
    <div
      ref={setNodeRef}
      className="flex w-[272px] shrink-0 flex-col gap-2 overflow-y-auto rounded-[10px] bg-col-bg p-2.5 max-md:snap-start"
    >
      <div className="flex items-center gap-2 px-1 py-0.5">
        <span className={`size-2 shrink-0 rounded-full ${STATUS_VISUAL[status].cor}`} />
        <span className="truncate text-[13px] font-semibold">{titulo}</span>
        <span className="text-xs tabular-nums text-muted-foreground">{projetos.length}</span>
      </div>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className="flex min-h-8 flex-col gap-2">
          {projetos.map((projeto) => (
            <ProjectCard
              key={projeto.idProjeto}
              projeto={projeto}
              itensOffline={itensOffline}
              itensOnline={itensOnline}
              pendenciasAbertas={pendenciasPorProjeto[projeto.idProjeto]}
              onClick={onSelectProjeto}
            />
          ))}
        </div>
      </SortableContext>
      {projetos.length === 0 && (
        <div className="rounded-lg border border-dashed border-border px-3 py-5 text-center text-xs text-muted-foreground">
          Nenhum projeto neste estágio
        </div>
      )}
    </div>
  );
}
