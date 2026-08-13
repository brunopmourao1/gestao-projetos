"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { EstadoVazio } from "@/components/estados/EstadoVazio";
import { EstadoErro } from "@/components/estados/EstadoErro";
import { DetailsDrawer } from "@/components/details/DetailsDrawer";
import { NovoProjetoDialog, DadosNovoProjeto } from "@/components/board/NovoProjetoDialog";
import { ResultadoMover } from "@/components/board/ProjectCard";
import { STATUS_VISUAL } from "@/components/board/statusVisual";
import { useProjetoDrawer } from "@/hooks/useProjetoDrawer";
import { AtividadeItem, FluxoEstagio, MetricasDashboard, PrazoCritico } from "@/lib/dashboard";
import { formatarData } from "@/lib/prazo";

export interface DashboardPayload {
  metricas: MetricasDashboard;
  fluxoPorEstagio: FluxoEstagio[];
  prazosCriticos: PrazoCritico[];
  atividadeRecente: AtividadeItem[];
}

interface DashboardClientProps {
  dadosIniciais: DashboardPayload | null;
  erroCarregamento: boolean;
}

export function DashboardClient({ dadosIniciais, erroCarregamento }: DashboardClientProps) {
  const router = useRouter();
  // Sem estado local espelhando a prop: a Visão geral não faz edição
  // otimista própria, ela é sempre a métrica recalculada no servidor — depois
  // de um router.refresh() (edição no drawer, criação de projeto), o Next
  // re-renderiza este client component direto com o `dadosIniciais` novo.
  const dados = dadosIniciais;
  const [busca, setBusca] = useState("");
  const [novoProjetoAberto, setNovoProjetoAberto] = useState(false);

  const drawer = useProjetoDrawer({ onProjetoAtualizado: () => router.refresh() });

  async function handleCriarProjeto(dadosNovo: DadosNovoProjeto): Promise<ResultadoMover> {
    try {
      const resposta = await fetch("/api/projetos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numero: dadosNovo.numero,
          nome_maquina: dadosNovo.nomeMaquina || undefined,
          nome_cliente: dadosNovo.nomeCliente || undefined,
          descricao: dadosNovo.descricao || undefined,
          data_prevista_conclusao: dadosNovo.dataPrevistaConclusao || undefined,
        }),
      });
      const respostaDados = await resposta.json();
      if (!resposta.ok) {
        return { ok: false, mensagem: respostaDados?.erro?.mensagem ?? "Não foi possível criar o projeto." };
      }
      router.refresh();
      return { ok: true };
    } catch {
      return { ok: false, mensagem: "Falha de rede ao criar o projeto." };
    }
  }

  const totalProjetos = dados?.fluxoPorEstagio.reduce((soma, f) => soma + f.quantidade, 0) ?? 0;
  const anoAtual = new Date().getFullYear();

  return (
    <>
      <Topbar
        titulo="Visão geral"
        busca={busca}
        onBuscaChange={setBusca}
        onNovoProjeto={() => setNovoProjetoAberto(true)}
      />

      {erroCarregamento || !dados ? (
        <EstadoErro
          titulo="Não foi possível carregar os projetos"
          descricao="Falha de rede ao consultar a API. Verifique a conexão e tente novamente."
          onTentarNovamente={() => router.refresh()}
        />
      ) : totalProjetos === 0 ? (
        <EstadoVazio
          titulo="Nenhum projeto cadastrado"
          descricao="Crie o primeiro projeto para acompanhar o fluxo de comissionamento, do esquema elétrico à entrega."
          rotuloAcao="Criar projeto"
          onAcao={() => setNovoProjetoAberto(true)}
        />
      ) : (
        <div className="mx-auto flex w-full max-w-[1160px] flex-1 flex-col gap-5 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <CardMetrica
              rotulo="Projetos ativos"
              valor={String(dados.metricas.projetosAtivos)}
              extra="Em andamento no fluxo"
            />
            <CardMetrica
              rotulo="Em atraso"
              valor={String(dados.metricas.emAtraso)}
              extra="Prazo vencido, não entregues"
              destaque={dados.metricas.emAtraso > 0}
            />
            <CardMetrica
              rotulo="Entregues no ano"
              valor={String(dados.metricas.entreguesNoAno)}
              extra={`Concluídos em ${anoAtual}`}
            />
            <CardMetrica
              rotulo="Lead time médio"
              valor={dados.metricas.leadTimeMedioDias !== null ? `${dados.metricas.leadTimeMedioDias}d` : "—"}
              extra="Da criação à entrega"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[2fr_1fr]">
            <div className="rounded-lg border border-border bg-card px-5 py-[18px] shadow-xs">
              <div className="mb-3.5 text-sm font-semibold">Fluxo por estágio</div>
              <div className="flex flex-col gap-2.5">
                {dados.fluxoPorEstagio.map((f) => (
                  <div key={f.status} className="grid grid-cols-[190px_1fr_24px] items-center gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className={`size-[7px] shrink-0 rounded-full ${STATUS_VISUAL[f.status].cor}`} />
                      <span className="truncate text-[13px]">{f.titulo}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-track">
                      <div
                        className={`h-full rounded-full ${STATUS_VISUAL[f.status].cor}`}
                        style={{ width: `${f.percentualBarra}%` }}
                      />
                    </div>
                    <span className="text-right text-[13px] font-semibold tabular-nums">{f.quantidade}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card px-5 py-[18px] shadow-xs">
              <div className="mb-3.5 text-sm font-semibold">Prazos críticos</div>
              {dados.prazosCriticos.length === 0 ? (
                <p className="text-[13px] text-muted-foreground">Nenhum prazo definido nos projetos em andamento.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {dados.prazosCriticos.map((p) => (
                    <button
                      key={p.idProjeto}
                      type="button"
                      onClick={() =>
                        drawer.abrirProjeto({ idProjeto: p.idProjeto, numero: p.numero, nomeMaquina: p.nomeMaquina })
                      }
                      className="-mx-2.5 -my-2 flex flex-col gap-[3px] rounded-md px-2.5 py-2 text-left hover:bg-muted"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[13px] font-semibold tabular-nums">{p.numero}</span>
                        <span
                          className={`text-xs font-medium tabular-nums ${p.atrasado ? "text-destructive-foreground" : "text-muted-foreground"}`}
                        >
                          {formatarData(p.dataPrevistaConclusao)}
                        </span>
                      </div>
                      {p.nomeMaquina && <span className="text-[12.5px] text-muted-foreground">{p.nomeMaquina}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card px-5 py-[18px] shadow-xs">
            <div className="mb-3.5 text-sm font-semibold">Atividade recente</div>
            {dados.atividadeRecente.length === 0 ? (
              <p className="text-[13px] text-muted-foreground">Nenhuma movimentação registrada ainda.</p>
            ) : (
              <div className="flex flex-col">
                {dados.atividadeRecente.map((a) => (
                  <div key={a.idTransicao} className="flex items-baseline gap-3 border-t border-muted py-[9px] first:border-t-0">
                    <span className={`size-1.5 shrink-0 self-center rounded-full ${STATUS_VISUAL[a.status].cor}`} />
                    <span className="flex-1 text-[13px]">{a.texto}</span>
                    <span className="whitespace-nowrap text-xs tabular-nums text-muted-foreground">{a.quando}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
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
        onPendenciaExcluida={drawer.handlePendenciaExcluida}
        onEditarProjeto={drawer.handleEditarProjeto}
        onExcluirProjeto={drawer.handleExcluirProjeto}
        exportando={drawer.exportando}
        erroExportacao={drawer.erroExportacao}
        onExportarRelatorio={drawer.handleExportarRelatorio}
      />
      <NovoProjetoDialog open={novoProjetoAberto} onOpenChange={setNovoProjetoAberto} onCriar={handleCriarProjeto} />
    </>
  );
}

function CardMetrica({
  rotulo,
  valor,
  extra,
  destaque,
}: {
  rotulo: string;
  valor: string;
  extra: string;
  destaque?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border bg-card px-[18px] py-4 shadow-xs">
      <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{rotulo}</span>
      <span
        className={`text-[26px] font-bold tracking-[-0.02em] tabular-nums ${destaque ? "text-destructive-foreground" : ""}`}
      >
        {valor}
      </span>
      <span className="text-xs text-muted-foreground">{extra}</span>
    </div>
  );
}
