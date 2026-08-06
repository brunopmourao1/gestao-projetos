"use client";

import { useState } from "react";
import { LayoutContainer } from "@/components/layout/LayoutContainer";
import { KanbanBoard } from "@/components/board/KanbanBoard";
import { DetailsDrawer } from "@/components/details/DetailsDrawer";
import { EspecificacoesTecnicas, Projeto, ProjetoDetalhado, StatusProjeto } from "@/types/projeto";
import { ResultadoMover } from "./ProjectCard";

interface BoardClientProps {
  projetosIniciais: Projeto[];
}

function paraDetalhado(projeto: Projeto): ProjetoDetalhado {
  return { ...projeto, especificacoesTecnicas: null, historicoTransicoes: [] };
}

export function BoardClient({ projetosIniciais }: BoardClientProps) {
  const [projetos, setProjetos] = useState<Projeto[]>(projetosIniciais);
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

  async function handleMoverProjeto(projeto: Projeto, novoStatus: StatusProjeto): Promise<ResultadoMover> {
    const resposta = await fetch(`/api/projetos/${projeto.idProjeto}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ novo_status: novoStatus }),
    });
    const dados = await resposta.json();
    if (!resposta.ok) {
      const camposFaltantes = dados?.erro?.camposFaltantes as string[] | undefined;
      return {
        ok: false,
        mensagem: camposFaltantes?.length
          ? `${dados.erro.mensagem} (${camposFaltantes.join(", ")})`
          : dados?.erro?.mensagem ?? "Não foi possível mover o projeto.",
      };
    }

    setProjetos((atual) =>
      atual.map((p) => (p.idProjeto === projeto.idProjeto ? { ...p, statusAtual: dados.statusAtual } : p))
    );

    if (projetoSelecionado?.idProjeto === projeto.idProjeto) {
      fetch(`/api/projetos/${projeto.idProjeto}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => d && setProjetoSelecionado(d));
    }

    return { ok: true };
  }

  return (
    <LayoutContainer>
      <KanbanBoard
        projetos={projetos}
        onSelectProjeto={handleSelectProjeto}
        onMoverProjeto={handleMoverProjeto}
      />
      <DetailsDrawer
        projeto={projetoSelecionado}
        open={drawerAberto}
        onOpenChange={setDrawerAberto}
        onEspecificacoesAtualizadas={handleEspecificacoesAtualizadas}
      />
    </LayoutContainer>
  );
}
