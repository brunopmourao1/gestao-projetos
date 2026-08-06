"use client";

import { COLUNAS_FLUXO, Projeto, StatusProjeto } from "@/types/projeto";
import { KanbanColumn } from "./KanbanColumn";
import { ResultadoMover } from "./ProjectCard";

// Ver Docs/02-Tecnico/Matriz-Componentes.md, seção 2
// Componente pai que orquestra as listas (GerenciadorEstadoBoard consome os dados via API).
interface KanbanBoardProps {
  projetos: Projeto[];
  onSelectProjeto?: (projeto: Projeto) => void;
  onMoverProjeto?: (projeto: Projeto, novoStatus: StatusProjeto) => Promise<ResultadoMover>;
}

export function KanbanBoard({ projetos, onSelectProjeto, onMoverProjeto }: KanbanBoardProps) {
  return (
    <div className="flex h-full gap-4 overflow-x-auto p-4">
      {COLUNAS_FLUXO.map(({ status, titulo }, index) => (
        <KanbanColumn
          key={status}
          status={status}
          titulo={titulo}
          projetos={projetos.filter((p) => p.statusAtual === status)}
          onSelectProjeto={onSelectProjeto}
          statusAnterior={COLUNAS_FLUXO[index - 1]?.status}
          statusProxima={COLUNAS_FLUXO[index + 1]?.status}
          onMoverProjeto={onMoverProjeto}
        />
      ))}
    </div>
  );
}
