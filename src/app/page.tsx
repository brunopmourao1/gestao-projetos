"use client";

import { useState } from "react";
import { LayoutContainer } from "@/components/layout/LayoutContainer";
import { KanbanBoard } from "@/components/board/KanbanBoard";
import { DetailsDrawer } from "@/components/details/DetailsDrawer";
import { Projeto, ProjetoDetalhado } from "@/types/projeto";

// TODO: substituir por fetch em GET /api/projetos (ver Especificacao-API.md) na Fase 1.
const PROJETOS_PLACEHOLDER: Projeto[] = [];

function paraDetalhado(projeto: Projeto): ProjetoDetalhado {
  return { ...projeto, especificacoesTecnicas: null, historicoTransicoes: [] };
}

export default function Home() {
  const [projetoSelecionado, setProjetoSelecionado] = useState<ProjetoDetalhado | null>(null);
  const [drawerAberto, setDrawerAberto] = useState(false);

  return (
    <LayoutContainer>
      <KanbanBoard
        projetos={PROJETOS_PLACEHOLDER}
        onSelectProjeto={(projeto) => {
          setProjetoSelecionado(paraDetalhado(projeto));
          setDrawerAberto(true);
        }}
      />
      <DetailsDrawer projeto={projetoSelecionado} open={drawerAberto} onOpenChange={setDrawerAberto} />
    </LayoutContainer>
  );
}
