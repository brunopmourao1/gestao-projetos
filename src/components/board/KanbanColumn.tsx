import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import { Projeto } from "@/types/projeto";
import { ProjectCard } from "./ProjectCard";

// Ver Docs/02-Tecnico/Matriz-Componentes.md, seção 2
// Cor de destaque no cabeçalho indicando criticidade do estágio.
export const CORES_CRITICIDADE: Record<string, string> = {
  Esquema_Eletrico: "border-t-slate-400",
  Offline: "border-t-blue-400",
  Montagem: "border-t-red-500",
  Online: "border-t-green-500",
  Concluido: "border-t-emerald-600",
};

interface KanbanColumnProps {
  status: string;
  titulo: string;
  // Já ordenados por ordem ascendente (menor = mais crítico, topo da coluna).
  projetos: Projeto[];
  onSelectProjeto?: (projeto: Projeto) => void;
}

export function KanbanColumn({ status, titulo, projetos, onSelectProjeto }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id: status });
  const ids = projetos.map((p) => p.idProjeto);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-72 shrink-0 flex-col gap-2 rounded-md border border-t-4 bg-muted/30 p-3",
        CORES_CRITICIDADE[status] ?? "border-t-slate-400"
      )}
    >
      <h2 className="text-sm font-semibold">
        {titulo} <span className="text-muted-foreground">({projetos.length})</span>
      </h2>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className="flex min-h-8 flex-col gap-2">
          {projetos.map((projeto) => (
            <ProjectCard key={projeto.idProjeto} projeto={projeto} onClick={onSelectProjeto} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
