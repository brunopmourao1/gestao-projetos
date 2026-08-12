"use client";

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { ChecklistItemConfig, COLUNAS_FLUXO, Projeto, StatusProjeto } from "@/types/projeto";
import { calcularOrdem } from "@/lib/ordenacao";
import { KanbanColumn } from "./KanbanColumn";
import { ProjectCard, ResultadoMover } from "./ProjectCard";

// Ver Docs/02-Tecnico/Matriz-Componentes.md, seção 2
// Componente pai que orquestra as listas (GerenciadorEstadoBoard consome os dados via API).
interface KanbanBoardProps {
  projetos: Projeto[];
  itensOffline: ChecklistItemConfig[];
  itensOnline: ChecklistItemConfig[];
  onSelectProjeto?: (projeto: Projeto) => void;
  onMoverProjeto?: (projeto: Projeto, novoStatus: StatusProjeto, ordem: number) => Promise<ResultadoMover>;
  onReordenarProjeto?: (projeto: Projeto, novaOrdem: number) => Promise<ResultadoMover>;
}

const STATUS_VALIDOS = COLUNAS_FLUXO.map((c) => c.status) as string[];

export function KanbanBoard({
  projetos,
  itensOffline,
  itensOnline,
  onSelectProjeto,
  onMoverProjeto,
  onReordenarProjeto,
}: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const activeProjeto = activeId ? (projetos.find((p) => p.idProjeto === activeId) ?? null) : null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const projetoArrastado = projetos.find((p) => p.idProjeto === active.id);
    if (!projetoArrastado) return;

    const overEhColuna = STATUS_VALIDOS.includes(String(over.id));
    const statusDestino = overEhColuna
      ? (over.id as StatusProjeto)
      : projetos.find((p) => p.idProjeto === over.id)?.statusAtual;
    if (!statusDestino) return;

    const projetosDestino = projetos
      .filter((p) => p.statusAtual === statusDestino && p.idProjeto !== projetoArrastado.idProjeto)
      .sort((a, b) => a.ordem - b.ordem);

    let indiceDestino = projetosDestino.length;
    if (!overEhColuna) {
      const indice = projetosDestino.findIndex((p) => p.idProjeto === over.id);
      if (indice !== -1) indiceDestino = indice;
    }

    const novaOrdem = calcularOrdem(
      projetosDestino.map((p) => p.ordem),
      indiceDestino
    );

    if (statusDestino === projetoArrastado.statusAtual) {
      await onReordenarProjeto?.(projetoArrastado, novaOrdem);
    } else {
      await onMoverProjeto?.(projetoArrastado, statusDestino, novaOrdem);
    }
  }

  return (
    <DndContext
      id="kanban-board"
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex min-h-0 flex-1 items-stretch gap-3 overflow-x-auto overflow-y-hidden px-5 py-4 max-md:snap-x max-md:snap-mandatory">
        {COLUNAS_FLUXO.map(({ status, titulo }) => (
          <KanbanColumn
            key={status}
            status={status}
            titulo={titulo}
            projetos={projetos
              .filter((p) => p.statusAtual === status)
              .sort((a, b) => a.ordem - b.ordem)}
            itensOffline={itensOffline}
            itensOnline={itensOnline}
            onSelectProjeto={onSelectProjeto}
          />
        ))}
      </div>
      <DragOverlay>
        {activeProjeto && (
          <ProjectCard projeto={activeProjeto} itensOffline={itensOffline} itensOnline={itensOnline} />
        )}
      </DragOverlay>
    </DndContext>
  );
}
