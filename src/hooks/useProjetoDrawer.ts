"use client";

import { useState } from "react";
import {
  ChecklistOffline,
  ChecklistOnline,
  MetricaTempoEstagio,
  PendenciaVisita,
  Projeto,
  ProjetoDetalhado,
} from "@/types/projeto";
import type { RelatorioPayload } from "@/lib/relatorio";
import { ResultadoMover } from "@/components/board/ProjectCard";
import { DadosEditarProjeto } from "@/components/board/EditarProjetoDialog";

// Board abre a partir de um Projeto completo (card); a Visão geral abre a
// partir de uma linha de "Prazos críticos" que só tem idProjeto/numero — o
// restante vira placeholder até o fetch completo (abaixo) chegar.
type ProjetoParaAbrir = Pick<Projeto, "idProjeto" | "numero"> & Partial<Projeto>;

function paraDetalhado(projeto: ProjetoParaAbrir): ProjetoDetalhado {
  return {
    idProjeto: projeto.idProjeto,
    numero: projeto.numero,
    nomeMaquina: projeto.nomeMaquina ?? null,
    descricao: projeto.descricao ?? null,
    ordem: projeto.ordem ?? 0,
    dataPrevistaConclusao: projeto.dataPrevistaConclusao ?? null,
    statusAtual: projeto.statusAtual ?? "Esquema_Eletrico",
    dataCriacao: projeto.dataCriacao ?? new Date().toISOString(),
    checklistOffline: projeto.checklistOffline ?? {},
    observacoes: projeto.observacoes ?? null,
    percentualMontagem: projeto.percentualMontagem ?? 0,
    checklistOnline: projeto.checklistOnline ?? {},
    historicoTransicoes: [],
    pendenciasVisitas: [],
  };
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

interface UseProjetoDrawerOptions {
  /** Editar/mover/checklist no drawer também deve refletir na lista visível
   * fora dele (card do Board). O Board patcheia sua lista local; a Visão
   * geral, que não mantém lista otimista, tipicamente passa router.refresh. */
  onProjetoAtualizado?: (projeto: Projeto) => void;
  onProjetoExcluido?: (id: string) => void;
  /** Chamado quando uma pendência é adicionada ou tem o check alternado —
   * o indicador OK/pendências do card (fora do drawer) depende da contagem
   * agregada de /api/pendencias/resumo, não do projeto selecionado. */
  onPendenciasAlteradas?: () => void;
}

// Estado + ações do DetailsDrawer, extraídos de BoardClient pra ser
// reaproveitado também pela Visão geral ("Prazos críticos" abre o mesmo
// drawer). Nenhuma chamada de API muda em relação ao BoardClient original.
export function useProjetoDrawer(options: UseProjetoDrawerOptions = {}) {
  const { onProjetoAtualizado, onProjetoExcluido, onPendenciasAlteradas } = options;
  const [projetoSelecionado, setProjetoSelecionado] = useState<ProjetoDetalhado | null>(null);
  const [metricas, setMetricas] = useState<MetricaTempoEstagio[] | null>(null);
  const [relatorio, setRelatorio] = useState<RelatorioPayload | null>(null);
  const [drawerAberto, setDrawerAberto] = useState(false);
  const [exportando, setExportando] = useState(false);
  const [erroExportacao, setErroExportacao] = useState<string | null>(null);

  async function abrirProjeto(projeto: ProjetoParaAbrir) {
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

  function handleDrawerOpenChange(open: boolean) {
    setDrawerAberto(open);
    if (!open) setProjetoSelecionado(null);
  }

  function handleChecklistAtualizado(checklist: ChecklistOffline) {
    setProjetoSelecionado((atual) => {
      if (!atual) return atual;
      const atualizado = { ...atual, checklistOffline: checklist };
      onProjetoAtualizado?.(atualizado);
      return atualizado;
    });
  }

  function handleChecklistOnlineAtualizado(checklist: ChecklistOnline) {
    setProjetoSelecionado((atual) => {
      if (!atual) return atual;
      const atualizado = { ...atual, checklistOnline: checklist };
      onProjetoAtualizado?.(atualizado);
      return atualizado;
    });
  }

  function handlePercentualMontagemAtualizado(percentual: number) {
    setProjetoSelecionado((atual) => {
      if (!atual) return atual;
      const atualizado = { ...atual, percentualMontagem: percentual };
      onProjetoAtualizado?.(atualizado);
      return atualizado;
    });
  }

  function handleObservacoesAtualizadas(observacoes: string | null) {
    setProjetoSelecionado((atual) => (atual ? { ...atual, observacoes } : atual));
  }

  function handlePendenciaAdicionada(pendencia: PendenciaVisita) {
    setProjetoSelecionado((atual) =>
      atual ? { ...atual, pendenciasVisitas: [pendencia, ...atual.pendenciasVisitas] } : atual
    );
    onPendenciasAlteradas?.();
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
    onPendenciasAlteradas?.();
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
      setProjetoSelecionado((atual) => {
        if (!atual || atual.idProjeto !== id) return atual;
        const mesclado = { ...atual, ...atualizado };
        onProjetoAtualizado?.(mesclado);
        return mesclado;
      });
      return { ok: true };
    } catch {
      return { ok: false, mensagem: "Falha de rede ao editar o projeto." };
    }
  }

  async function handleExcluirProjeto(id: string): Promise<ResultadoMover> {
    try {
      const resposta = await fetch(`/api/projetos/${id}`, { method: "DELETE" });
      if (!resposta.ok) {
        const dados = await resposta.json();
        return { ok: false, mensagem: dados?.erro?.mensagem ?? "Não foi possível excluir o projeto." };
      }
      onProjetoExcluido?.(id);
      onPendenciasAlteradas?.();
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

  return {
    projetoSelecionado,
    metricas,
    relatorio,
    drawerAberto,
    exportando,
    erroExportacao,
    abrirProjeto,
    handleDrawerOpenChange,
    handleChecklistAtualizado,
    handleChecklistOnlineAtualizado,
    handlePercentualMontagemAtualizado,
    handleObservacoesAtualizadas,
    handlePendenciaAdicionada,
    handlePendenciaAtualizada,
    handleEditarProjeto,
    handleExcluirProjeto,
    handleExportarRelatorio,
  };
}
