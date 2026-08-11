"use client";

import { useEffect, useState } from "react";
import { LayoutContainer } from "@/components/layout/LayoutContainer";
import { KanbanBoard } from "@/components/board/KanbanBoard";
import { DetailsDrawer } from "@/components/details/DetailsDrawer";
import {
  ChecklistItemConfig,
  ChecklistOffline,
  ChecklistOnline,
  MetricaTempoEstagio,
  PendenciaVisita,
  Projeto,
  ProjetoDetalhado,
  StatusProjeto,
} from "@/types/projeto";
import type { RelatorioPayload } from "@/lib/relatorio";
import { ResultadoMover } from "./ProjectCard";
import { DadosNovoProjeto } from "./NovoProjetoDialog";
import { DadosEditarProjeto } from "./EditarProjetoDialog";
import { DataPrevistaDialog } from "./DataPrevistaDialog";

interface BoardClientProps {
  projetosIniciais: Projeto[];
}

function paraDetalhado(projeto: Projeto): ProjetoDetalhado {
  return { ...projeto, historicoTransicoes: [], pendenciasVisitas: [] };
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
  const [erroMovimento, setErroMovimento] = useState<string | null>(null);
  const [projetoParaDefinirPrazo, setProjetoParaDefinirPrazo] = useState<Projeto | null>(null);
  const [itensOffline, setItensOffline] = useState<ChecklistItemConfig[]>([]);
  const [itensOnline, setItensOnline] = useState<ChecklistItemConfig[]>([]);

  useEffect(() => {
    fetch("/api/configuracoes/checklist")
      .then((r) => (r.ok ? r.json() : []))
      .then((todos: ChecklistItemConfig[]) => {
        setItensOffline(todos.filter((i) => i.fase === "Offline"));
        setItensOnline(todos.filter((i) => i.fase === "Online"));
      })
      .catch(() => {});
  }, []);

  const projetosFiltrados = projetos.filter((p) => {
    const buscaNormalizada = busca.trim().toLowerCase();
    return (
      p.numero.toLowerCase().includes(buscaNormalizada) ||
      (p.nomeMaquina?.toLowerCase().includes(buscaNormalizada) ?? false)
    );
  });

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

  function handleChecklistAtualizado(checklist: ChecklistOffline) {
    setProjetoSelecionado((atual) => (atual ? { ...atual, checklistOffline: checklist } : atual));
    setProjetos((atual) =>
      atual.map((p) =>
        p.idProjeto === projetoSelecionado?.idProjeto ? { ...p, checklistOffline: checklist } : p
      )
    );
  }

  function handleChecklistOnlineAtualizado(checklist: ChecklistOnline) {
    setProjetoSelecionado((atual) => (atual ? { ...atual, checklistOnline: checklist } : atual));
    setProjetos((atual) =>
      atual.map((p) =>
        p.idProjeto === projetoSelecionado?.idProjeto ? { ...p, checklistOnline: checklist } : p
      )
    );
  }

  function handlePendenciaAdicionada(pendencia: PendenciaVisita) {
    setProjetoSelecionado((atual) =>
      atual ? { ...atual, pendenciasVisitas: [pendencia, ...atual.pendenciasVisitas] } : atual
    );
  }

  function handlePendenciaAtualizada(pendencia: PendenciaVisita) {
    setProjetoSelecionado((atual) =>
      atual
        ? {
            ...atual,
            pendenciasVisitas: atual.pendenciasVisitas.map((p) =>
              p.idPendencia === pendencia.idPendencia ? pendencia : p
            ),
          }
        : atual
    );
  }

  function handleObservacoesAtualizadas(observacoes: string | null) {
    setProjetoSelecionado((atual) => (atual ? { ...atual, observacoes } : atual));
  }

  function handlePercentualMontagemAtualizado(percentual: number) {
    setProjetoSelecionado((atual) => (atual ? { ...atual, percentualMontagem: percentual } : atual));
    setProjetos((atual) =>
      atual.map((p) =>
        p.idProjeto === projetoSelecionado?.idProjeto ? { ...p, percentualMontagem: percentual } : p
      )
    );
  }

  async function handleMoverProjeto(
    projeto: Projeto,
    novoStatus: StatusProjeto,
    ordem: number
  ): Promise<ResultadoMover> {
    setErroMovimento(null);
    const resposta = await fetch(`/api/projetos/${projeto.idProjeto}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ novo_status: novoStatus, ordem }),
    });
    const dados = await resposta.json();
    if (!resposta.ok) {
      const detalhesFaltantes = (dados?.erro?.camposFaltantes ?? dados?.erro?.itensFaltantes) as
        | string[]
        | undefined;
      const mensagem = detalhesFaltantes?.length
        ? `${dados.erro.mensagem} (${detalhesFaltantes.join(", ")})`
        : dados?.erro?.mensagem ?? "Não foi possível mover o projeto.";
      setErroMovimento(`${projeto.numero}: ${mensagem}`);
      return { ok: false, mensagem };
    }

    setProjetos((atual) =>
      atual.map((p) =>
        p.idProjeto === projeto.idProjeto ? { ...p, statusAtual: dados.statusAtual, ordem: dados.ordem } : p
      )
    );
    setProjetoParaDefinirPrazo({ ...projeto, statusAtual: dados.statusAtual, ordem: dados.ordem });

    if (projetoSelecionado?.idProjeto === projeto.idProjeto) {
      fetch(`/api/projetos/${projeto.idProjeto}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => d && setProjetoSelecionado(d));
      buscarMetricas(projeto.idProjeto).then((m) => m && setMetricas(m));
      buscarRelatorio(projeto.idProjeto).then((r) => r && setRelatorio(r));
    }

    return { ok: true };
  }

  async function handleReordenarProjeto(projeto: Projeto, novaOrdem: number): Promise<ResultadoMover> {
    setErroMovimento(null);
    try {
      const resposta = await fetch(`/api/projetos/${projeto.idProjeto}/ordem`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ordem: novaOrdem }),
      });
      const dados = await resposta.json();
      if (!resposta.ok) {
        const mensagem = dados?.erro?.mensagem ?? "Não foi possível reordenar o projeto.";
        setErroMovimento(`${projeto.numero}: ${mensagem}`);
        return { ok: false, mensagem };
      }
      setProjetos((atual) =>
        atual.map((p) => (p.idProjeto === projeto.idProjeto ? { ...p, ordem: dados.ordem } : p))
      );
      return { ok: true };
    } catch {
      const mensagem = "Falha de rede ao reordenar o projeto.";
      setErroMovimento(`${projeto.numero}: ${mensagem}`);
      return { ok: false, mensagem };
    }
  }

  async function handleEditarProjeto(id: string, dados: DadosEditarProjeto): Promise<ResultadoMover> {
    try {
      const resposta = await fetch(`/api/projetos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numero: dados.numero,
          nome_maquina: dados.nomeMaquina || undefined,
          descricao: dados.descricao || undefined,
          data_prevista_conclusao: dados.dataPrevistaConclusao || null,
        }),
      });
      const atualizado = await resposta.json();
      if (!resposta.ok) {
        return { ok: false, mensagem: atualizado?.erro?.mensagem ?? "Não foi possível editar o projeto." };
      }
      setProjetos((atual) => atual.map((p) => (p.idProjeto === id ? { ...p, ...atualizado } : p)));
      setProjetoSelecionado((atual) => (atual && atual.idProjeto === id ? { ...atual, ...atualizado } : atual));
      return { ok: true };
    } catch {
      return { ok: false, mensagem: "Falha de rede ao editar o projeto." };
    }
  }

  async function handleCriarProjeto(dadosNovo: DadosNovoProjeto): Promise<ResultadoMover> {
    try {
      const resposta = await fetch("/api/projetos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numero: dadosNovo.numero,
          nome_maquina: dadosNovo.nomeMaquina || undefined,
          descricao: dadosNovo.descricao || undefined,
          data_prevista_conclusao: dadosNovo.dataPrevistaConclusao || undefined,
        }),
      });
      const dados = await resposta.json();
      if (!resposta.ok) {
        return { ok: false, mensagem: dados?.erro?.mensagem ?? "Não foi possível criar o projeto." };
      }
      setProjetos((atual) => [...atual, dados]);
      return { ok: true };
    } catch {
      return { ok: false, mensagem: "Falha de rede ao criar o projeto." };
    }
  }

  async function handleSalvarPrazo(id: string, dataPrevistaConclusao: string): Promise<ResultadoMover> {
    try {
      const resposta = await fetch(`/api/projetos/${id}/data-prevista`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data_prevista_conclusao: dataPrevistaConclusao || null }),
      });
      const atualizado = await resposta.json();
      if (!resposta.ok) {
        return { ok: false, mensagem: atualizado?.erro?.mensagem ?? "Não foi possível salvar a data prevista." };
      }
      setProjetos((atual) => atual.map((p) => (p.idProjeto === id ? { ...p, ...atualizado } : p)));
      setProjetoSelecionado((atual) => (atual && atual.idProjeto === id ? { ...atual, ...atualizado } : atual));
      return { ok: true };
    } catch {
      return { ok: false, mensagem: "Falha de rede ao salvar a data prevista." };
    }
  }

  function handleDrawerOpenChange(open: boolean) {
    setDrawerAberto(open);
    if (!open) setProjetoSelecionado(null);
  }

  async function handleExcluirProjeto(id: string): Promise<ResultadoMover> {
    try {
      const resposta = await fetch(`/api/projetos/${id}`, { method: "DELETE" });
      if (!resposta.ok) {
        const dados = await resposta.json();
        return { ok: false, mensagem: dados?.erro?.mensagem ?? "Não foi possível excluir o projeto." };
      }
      setProjetos((atual) => atual.filter((p) => p.idProjeto !== id));
      setDrawerAberto(false);
      setProjetoSelecionado(null);
      return { ok: true };
    } catch {
      return { ok: false, mensagem: "Falha de rede ao excluir o projeto." };
    }
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
      link.download = `relatorio-${projetoSelecionado.numero.replace(/\s+/g, "-").toLowerCase()}.md`;
      link.click();
    } catch {
      setErroExportacao("Falha de rede ao exportar o relatório.");
    } finally {
      setExportando(false);
    }
  }

  return (
    <LayoutContainer
      numeroAtivo={projetoSelecionado?.numero ?? null}
      onExportarRelatorio={handleExportarRelatorio}
      exportando={exportando}
      erroExportacao={erroExportacao}
      busca={busca}
      onBuscaChange={setBusca}
      onCriarProjeto={handleCriarProjeto}
    >
      {erroMovimento && (
        <div className="mx-4 mt-2 flex items-center justify-between rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <span>{erroMovimento}</span>
          <button type="button" onClick={() => setErroMovimento(null)} className="ml-2 font-medium">
            ×
          </button>
        </div>
      )}
      <KanbanBoard
        projetos={projetosFiltrados}
        itensOffline={itensOffline}
        itensOnline={itensOnline}
        onSelectProjeto={handleSelectProjeto}
        onMoverProjeto={handleMoverProjeto}
        onReordenarProjeto={handleReordenarProjeto}
      />
      <DetailsDrawer
        projeto={projetoSelecionado}
        metricas={metricas}
        relatorio={relatorio}
        open={drawerAberto}
        onOpenChange={handleDrawerOpenChange}
        onChecklistAtualizado={handleChecklistAtualizado}
        onObservacoesAtualizadas={handleObservacoesAtualizadas}
        onPercentualMontagemAtualizado={handlePercentualMontagemAtualizado}
        onChecklistOnlineAtualizado={handleChecklistOnlineAtualizado}
        onPendenciaAdicionada={handlePendenciaAdicionada}
        onPendenciaAtualizada={handlePendenciaAtualizada}
        onEditarProjeto={handleEditarProjeto}
        onExcluirProjeto={handleExcluirProjeto}
      />
      <DataPrevistaDialog
        projeto={projetoParaDefinirPrazo}
        onSalvar={handleSalvarPrazo}
        onFechar={() => setProjetoParaDefinirPrazo(null)}
      />
    </LayoutContainer>
  );
}
