"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { EstadoVazio } from "@/components/estados/EstadoVazio";
import { EstadoErro } from "@/components/estados/EstadoErro";
import { KanbanBoard } from "@/components/board/KanbanBoard";
import { DetailsDrawer } from "@/components/details/DetailsDrawer";
import { ChecklistItemConfig, Projeto, StatusProjeto } from "@/types/projeto";
import { useProjetoDrawer } from "@/hooks/useProjetoDrawer";
import { ResultadoMover } from "./ProjectCard";
import { NovoProjetoDialog, DadosNovoProjeto } from "./NovoProjetoDialog";
import { DataPrevistaDialog } from "./DataPrevistaDialog";

interface BoardClientProps {
  projetosIniciais: Projeto[];
  erroCarregamento: boolean;
}

export function BoardClient({ projetosIniciais, erroCarregamento }: BoardClientProps) {
  const router = useRouter();
  const [projetos, setProjetos] = useState<Projeto[]>(projetosIniciais);
  const [busca, setBusca] = useState("");
  const [erroMovimento, setErroMovimento] = useState<string | null>(null);
  const [projetoParaDefinirPrazo, setProjetoParaDefinirPrazo] = useState<Projeto | null>(null);
  const [itensOffline, setItensOffline] = useState<ChecklistItemConfig[]>([]);
  const [itensOnline, setItensOnline] = useState<ChecklistItemConfig[]>([]);
  const [pendenciasPorProjeto, setPendenciasPorProjeto] = useState<Record<string, number>>({});
  const [novoProjetoAberto, setNovoProjetoAberto] = useState(false);

  function carregarPendenciasResumo() {
    fetch("/api/pendencias/resumo")
      .then((r) => (r.ok ? r.json() : {}))
      .then(setPendenciasPorProjeto)
      .catch(() => {});
  }

  const drawer = useProjetoDrawer({
    onProjetoAtualizado: (projeto) =>
      setProjetos((atual) =>
        atual.map((p) => (p.idProjeto === projeto.idProjeto ? { ...p, ...projeto } : p))
      ),
    onProjetoExcluido: (id) => setProjetos((atual) => atual.filter((p) => p.idProjeto !== id)),
    onPendenciasAlteradas: carregarPendenciasResumo,
  });

  useEffect(() => {
    fetch("/api/configuracoes/checklist")
      .then((r) => (r.ok ? r.json() : []))
      .then((todos: ChecklistItemConfig[]) => {
        setItensOffline(todos.filter((i) => i.fase === "Offline"));
        setItensOnline(todos.filter((i) => i.fase === "Online"));
      })
      .catch(() => {});
    carregarPendenciasResumo();
  }, []);

  const projetosFiltrados = projetos.filter((p) => {
    const buscaNormalizada = busca.trim().toLowerCase();
    return (
      p.numero.toLowerCase().includes(buscaNormalizada) ||
      (p.nomeMaquina?.toLowerCase().includes(buscaNormalizada) ?? false)
    );
  });

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
      return { ok: true };
    } catch {
      return { ok: false, mensagem: "Falha de rede ao salvar a data prevista." };
    }
  }

  return (
    <>
      <Topbar titulo="Board" busca={busca} onBuscaChange={setBusca} onNovoProjeto={() => setNovoProjetoAberto(true)} />

      {erroMovimento && (
        <div className="mx-5 mt-3 flex items-center justify-between gap-3 rounded-lg border border-destructive/35 bg-destructive/8 px-3.5 py-2.5">
          <span className="text-[13px] text-destructive-foreground">{erroMovimento}</span>
          <button
            type="button"
            aria-label="Fechar aviso"
            onClick={() => setErroMovimento(null)}
            className="shrink-0 rounded px-1.5 py-0.5 text-base leading-none text-destructive-foreground hover:bg-destructive/15"
          >
            ×
          </button>
        </div>
      )}

      {erroCarregamento && projetos.length === 0 ? (
        <EstadoErro
          titulo="Não foi possível carregar os projetos"
          descricao="Falha de rede ao consultar a API. Verifique a conexão e tente novamente."
          onTentarNovamente={() => router.refresh()}
        />
      ) : projetos.length === 0 ? (
        <EstadoVazio
          titulo="Nenhum projeto cadastrado"
          descricao="Crie o primeiro projeto para acompanhar o fluxo de comissionamento, do esquema elétrico à entrega."
          rotuloAcao="Criar projeto"
          onAcao={() => setNovoProjetoAberto(true)}
        />
      ) : (
        <KanbanBoard
          projetos={projetosFiltrados}
          itensOffline={itensOffline}
          itensOnline={itensOnline}
          pendenciasPorProjeto={pendenciasPorProjeto}
          onSelectProjeto={drawer.abrirProjeto}
          onMoverProjeto={handleMoverProjeto}
          onReordenarProjeto={handleReordenarProjeto}
        />
      )}

      <DetailsDrawer
        projeto={drawer.projetoSelecionado}
        metricas={drawer.metricas}
        relatorio={drawer.relatorio}
        open={drawer.drawerAberto}
        onOpenChange={drawer.handleDrawerOpenChange}
        onChecklistAtualizado={drawer.handleChecklistAtualizado}
        onObservacoesAtualizadas={drawer.handleObservacoesAtualizadas}
        onPercentualMontagemAtualizado={drawer.handlePercentualMontagemAtualizado}
        onChecklistOnlineAtualizado={drawer.handleChecklistOnlineAtualizado}
        onPendenciaAdicionada={drawer.handlePendenciaAdicionada}
        onPendenciaAtualizada={drawer.handlePendenciaAtualizada}
        onEditarProjeto={drawer.handleEditarProjeto}
        onExcluirProjeto={drawer.handleExcluirProjeto}
        exportando={drawer.exportando}
        erroExportacao={drawer.erroExportacao}
        onExportarRelatorio={drawer.handleExportarRelatorio}
      />
      <NovoProjetoDialog open={novoProjetoAberto} onOpenChange={setNovoProjetoAberto} onCriar={handleCriarProjeto} />
      <DataPrevistaDialog
        projeto={projetoParaDefinirPrazo}
        onSalvar={handleSalvarPrazo}
        onFechar={() => setProjetoParaDefinirPrazo(null)}
      />
    </>
  );
}
