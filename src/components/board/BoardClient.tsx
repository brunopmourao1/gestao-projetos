"use client";

import { useState } from "react";
import { LayoutContainer } from "@/components/layout/LayoutContainer";
import { KanbanBoard } from "@/components/board/KanbanBoard";
import { DetailsDrawer } from "@/components/details/DetailsDrawer";
import { EspecificacoesTecnicas, Projeto, ProjetoDetalhado } from "@/types/projeto";

interface BoardClientProps {
  projetosIniciais: Projeto[];
}

function paraDetalhado(projeto: Projeto): ProjetoDetalhado {
  return { ...projeto, especificacoesTecnicas: null, historicoTransicoes: [] };
}

export function BoardClient({ projetosIniciais }: BoardClientProps) {
  const [projetoSelecionado, setProjetoSelecionado] = useState<ProjetoDetalhado | null>(null);
  const [drawerAberto, setDrawerAberto] = useState(false);

  async function handleSelectProjeto(projeto: Projeto) {
    setProjetoSelecionado(paraDetalhado(projeto));
    setDrawerAberto(true);
    try {
      const resposta = await fetch(`/api/projetos/${projeto.idProjeto}`);
      if (resposta.ok) {
        setProjetoSelecionado(await resposta.json());
      }
    } catch {
      // mantém o placeholder em caso de falha de rede
    }
  }

  function handleEspecificacoesAtualizadas(espec: EspecificacoesTecnicas) {
    setProjetoSelecionado((atual) => (atual ? { ...atual, especificacoesTecnicas: espec } : atual));
  }

  return (
    <LayoutContainer>
      <KanbanBoard projetos={projetosIniciais} onSelectProjeto={handleSelectProjeto} />
      <DetailsDrawer
        projeto={projetoSelecionado}
        open={drawerAberto}
        onOpenChange={setDrawerAberto}
        onEspecificacoesAtualizadas={handleEspecificacoesAtualizadas}
      />
    </LayoutContainer>
  );
}
