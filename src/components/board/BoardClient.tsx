"use client";

import { useState } from "react";
import { LayoutContainer } from "@/components/layout/LayoutContainer";
import { KanbanBoard } from "@/components/board/KanbanBoard";
import { DetailsDrawer } from "@/components/details/DetailsDrawer";
import {
  EspecificacoesTecnicas,
  MetricaTempoEstagio,
  Projeto,
  ProjetoDetalhado,
  StatusProjeto,
} from "@/types/projeto";
import type { RelatorioPayload } from "@/lib/relatorio";
import { ResultadoMover } from "./ProjectCard";

interface BoardClientProps {
  projetosIniciais: Projeto[];
}

function paraDetalhado(projeto: Projeto): ProjetoDetalhado {
  return { ...projeto, especificacoesTecnicas: null, historicoTransicoes: [] };
}

async function buscarMetricas(idProjeto: string): Promise<MetricaTempoEstagio[] | null> {
  try {
    const resposta = await fetch(`/api/projetos/${idProjeto}/metricas-tempo`);
    if (!resposta.ok) return null;
    const dados = await resposta.json();
    return dados.porEstagio ?? null;
  } catch {
    return null;
  }
}

async function buscarRelatorio(idProjeto: string): Promise<RelatorioPayload | null> {
  try {
    const resposta = await fetch(`/api/projetos/${idProjeto}/relatorio`);
    if (!resposta.ok) return null;
    return await resposta.json();
  } catch {
    return null;
  }
}

export function BoardClient({ projetosIniciais }: BoardClientProps) {
  const [projetos, setProjetos] = useState<Projeto[]>(projetosIniciais);
  const [projetoSelecionado, setProjetoSelecionado] = useState<ProjetoDetalhado | null>(null);
  const [metricas, setMetricas] = useState<MetricaTempoEstagio[] | null>(null);
  const [relatorio, setRelatorio] = useState<RelatorioPayload | null>(null);
  const [drawerAberto, setDrawerAberto] = useState(false);
  const [exportando, setExportando] = useState(false);
  const [erroExportacao, setErroExportacao] = useState<string | null>(null);
  const [busca, setBusca] = useState("");

  const projetosFiltrados = projetos.filter((p) =>
    p.nomeMaquina.toLowerCase().includes(busca.trim().toLowerCase())
  );

  async function handleSelectProjeto(projeto: Projeto) {
    setProjetoSelecionado(paraDetalhado(projeto));
    setMetricas(null);
    setRelatorio(null);
    setDrawerAberto(true);
    try {
      const [resposta, metricasBuscadas, relatorioBuscado] = await Promise.all([
        fetch(`/api/projetos/${projeto.idProjeto}`),
        buscarMetricas(projeto.idProjeto),
        buscarRelatorio(projeto.idProjeto),
      ]);
      if (resposta.ok) {
        setProjetoSelecionado(await resposta.json());
      }
      setMetricas(metricasBuscadas);
      setRelatorio(relatorioBuscado);
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
      buscarMetricas(projeto.idProjeto).then((m) => m && setMetricas(m));
      buscarRelatorio(projeto.idProjeto).then((r) => r && setRelatorio(r));
    }

    return { ok: true };
  }

  async function handleCriarProjeto(nomeMaquina: string): Promise<ResultadoMover> {
    const resposta = await fetch("/api/projetos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome_maquina: nomeMaquina }),
    });
    const dados = await resposta.json();
    if (!resposta.ok) {
      return { ok: false, mensagem: dados?.erro?.mensagem ?? "Não foi possível criar o projeto." };
    }
    setProjetos((atual) => [...atual, dados]);
    return { ok: true };
  }

  function handleDrawerOpenChange(open: boolean) {
    setDrawerAberto(open);
    if (!open) setProjetoSelecionado(null);
  }

  async function handleExportarRelatorio() {
    if (!projetoSelecionado) return;
    setExportando(true);
    setErroExportacao(null);
    try {
      const resposta = await fetch(`/api/projetos/${projetoSelecionado.idProjeto}/relatorio/exportar`, {
        method: "POST",
      });
      const dados = await resposta.json();
      if (!resposta.ok) {
        setErroExportacao(dados?.erro?.mensagem ?? "Não foi possível exportar o relatório.");
        return;
      }
      const link = document.createElement("a");
      link.href = dados.urlDownload;
      link.download = `relatorio-${projetoSelecionado.nomeMaquina.replace(/\s+/g, "-").toLowerCase()}.md`;
      link.click();
    } catch {
      setErroExportacao("Falha de rede ao exportar o relatório.");
    } finally {
      setExportando(false);
    }
  }

  return (
    <LayoutContainer
      nomeMaquinaAtiva={projetoSelecionado?.nomeMaquina ?? null}
      onExportarRelatorio={handleExportarRelatorio}
      exportando={exportando}
      erroExportacao={erroExportacao}
      busca={busca}
      onBuscaChange={setBusca}
      onCriarProjeto={handleCriarProjeto}
    >
      <KanbanBoard
        projetos={projetosFiltrados}
        onSelectProjeto={handleSelectProjeto}
        onMoverProjeto={handleMoverProjeto}
      />
      <DetailsDrawer
        projeto={projetoSelecionado}
        metricas={metricas}
        relatorio={relatorio}
        open={drawerAberto}
        onOpenChange={handleDrawerOpenChange}
        onEspecificacoesAtualizadas={handleEspecificacoesAtualizadas}
      />
    </LayoutContainer>
  );
}
