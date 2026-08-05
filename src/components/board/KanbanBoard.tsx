"use client";

import { COLUNAS_FLUXO, Projeto } from "@/types/projeto";
import { KanbanColumn } from "./KanbanColumn";

// Ver Docs/02-Tecnico/Matriz-Componentes.md, seção 2
// Componente pai que orquestra as listas (GerenciadorEstadoBoard consome os dados via API).
interface KanbanBoardProps {
  projetos: Projeto[];
  onSelectProjeto?: (projeto: Projeto) => void;
}

export function KanbanBoard({ projetos, onSelectProjeto }: KanbanBoardProps) {
  return (
    <div className="flex h-full gap-4 overflow-x-auto p-4">
      {COLUNAS_FLUXO.map(({ status, titulo }) => (
        <KanbanColumn
          key={status}
          status={status}
          titulo={titulo}
          projetos={projetos.filter((p) => p.statusAtual === status)}
          onSelectProjeto={onSelectProjeto}
        />
      ))}
    </div>
  );
}
