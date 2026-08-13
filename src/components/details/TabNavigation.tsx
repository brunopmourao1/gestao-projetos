"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChecklistOffline,
  ChecklistOnline,
  COLUNAS_FLUXO,
  MetricaTempoEstagio,
  PendenciaVisita,
  ProjetoDetalhado,
} from "@/types/projeto";
import type { RelatorioPayload } from "@/lib/relatorio";
import { ChecklistForm } from "./ChecklistForm";
import { PercentualMontagemForm } from "./PercentualMontagemForm";
import { ObservacoesForm } from "./ObservacoesForm";
import { PendenciasForm } from "./PendenciasForm";
import { formatarDuracao } from "@/lib/formatacao";
import { estaAtrasado, formatarData } from "@/lib/prazo";

// Ver Docs/02-Tecnico/Matriz-Componentes.md, seção 3
interface TabNavigationProps {
  projeto: ProjetoDetalhado;
  metricas: MetricaTempoEstagio[] | null;
  relatorio: RelatorioPayload | null;
  exportando: boolean;
  erroExportacao: string | null;
  onExportarRelatorio: () => void;
  onChecklistAtualizado: (checklist: ChecklistOffline) => void;
  onObservacoesAtualizadas: (observacoes: string | null) => void;
  onPercentualMontagemAtualizado: (percentual: number) => void;
  onChecklistOnlineAtualizado: (checklist: ChecklistOnline) => void;
  onPendenciaAdicionada: (pendencia: PendenciaVisita) => void;
  onPendenciaAtualizada: (pendencia: PendenciaVisita) => void;
  onPendenciaExcluida: (idPendencia: string) => void;
}

const CLASSE_ABA = "flex-none after:bg-primary rounded-none px-3 py-[9px] text-[13px] font-medium";
const CLASSE_ROTULO = "text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground";
const CLASSE_EMPTY = "rounded-lg border border-dashed border-border px-5 py-7 text-center text-[13px] leading-[1.5] text-muted-foreground";

export function TabNavigation({
  projeto,
  metricas,
  relatorio,
  exportando,
  erroExportacao,
  onExportarRelatorio,
  onChecklistAtualizado,
  onObservacoesAtualizadas,
  onPercentualMontagemAtualizado,
  onChecklistOnlineAtualizado,
  onPendenciaAdicionada,
  onPendenciaAtualizada,
  onPendenciaExcluida,
}: TabNavigationProps) {
  const atrasado = estaAtrasado(projeto.dataPrevistaConclusao);

  return (
    <Tabs defaultValue="visao-geral" className="gap-5">
      <TabsList variant="line" className="h-auto w-full justify-start gap-0 border-b border-border p-0">
        <TabsTrigger value="visao-geral" className={CLASSE_ABA}>
          Visão geral
        </TabsTrigger>
        <TabsTrigger value="progresso" className={CLASSE_ABA}>
          Progresso
        </TabsTrigger>
        <TabsTrigger value="pendencias" className={CLASSE_ABA}>
          Pendências
        </TabsTrigger>
        <TabsTrigger value="relatorio" className={CLASSE_ABA}>
          Relatório
        </TabsTrigger>
      </TabsList>

      {/* HU-04: histórico / HU-05: lead time por estágio */}
      <TabsContent value="visao-geral" className="flex flex-col gap-5 pb-8">
        <div className="grid grid-cols-2 gap-3.5">
          <div className="flex flex-col gap-[3px]">
            <span className={CLASSE_ROTULO}>Data prevista</span>
            {projeto.dataPrevistaConclusao ? (
              <span className={`text-sm font-medium tabular-nums ${atrasado ? "text-destructive-foreground" : ""}`}>
                {formatarData(projeto.dataPrevistaConclusao)}
                {atrasado && " — atrasado"}
              </span>
            ) : (
              <span className="text-sm font-medium text-muted-foreground">Nenhuma data definida</span>
            )}
          </div>
          <div className="flex flex-col gap-[3px]">
            <span className={CLASSE_ROTULO}>Criado em</span>
            <span className="text-sm font-medium tabular-nums">{formatarData(projeto.dataCriacao)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className={CLASSE_ROTULO}>Descrição</span>
          <p className="m-0 text-[13.5px] leading-[1.55]">{projeto.descricao || "Nenhuma descrição informada."}</p>
        </div>

        <ObservacoesForm projeto={projeto} onSalvo={onObservacoesAtualizadas} />

        <div className="flex flex-col gap-2">
          <span className={CLASSE_ROTULO}>Tempo por estágio</span>
          {metricas === null ? (
            <div className="flex flex-col gap-2 pt-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" style={{ animationDelay: "0.1s" }} />
            </div>
          ) : (
            <div className="flex flex-col">
              {metricas.map((m, i) => (
                <div key={`${m.coluna}-${i}`} className="flex justify-between border-t border-muted py-[7px] text-[13px]">
                  <span>{COLUNAS_FLUXO.find((c) => c.status === m.coluna)?.titulo ?? m.coluna}</span>
                  <span className="tabular-nums text-muted-foreground">{formatarDuracao(m.tempoPermanenciaHoras)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <span className={CLASSE_ROTULO}>Histórico de transições</span>
          {projeto.historicoTransicoes.length === 0 ? (
            <p className="text-[13px] text-muted-foreground">Nenhuma transição registrada ainda.</p>
          ) : (
            <div className="flex flex-col">
              {projeto.historicoTransicoes.map((h) => (
                <div key={h.idTransicao} className="flex justify-between gap-3 border-t border-muted py-[7px] text-[13px]">
                  <span>
                    {h.colunaOrigem} → {h.colunaDestino}
                  </span>
                  <span className="whitespace-nowrap tabular-nums text-muted-foreground">
                    {formatarData(h.dataMovimentacao)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="progresso" className="pb-8">
        {projeto.statusAtual === "Offline" && (
          <ChecklistForm fase="Offline" projeto={projeto} onChecklistAtualizado={onChecklistAtualizado} />
        )}
        {projeto.statusAtual === "Montagem" && (
          <PercentualMontagemForm projeto={projeto} onPercentualAtualizado={onPercentualMontagemAtualizado} />
        )}
        {projeto.statusAtual === "Online" && (
          <ChecklistForm fase="Online" projeto={projeto} onChecklistAtualizado={onChecklistOnlineAtualizado} />
        )}
        {projeto.statusAtual !== "Offline" &&
          projeto.statusAtual !== "Montagem" &&
          projeto.statusAtual !== "Online" && (
            <div className={CLASSE_EMPTY}>
              O progresso é registrado nas fases Projeto Offline, Montagem e Online (Comissionamento).
            </div>
          )}
      </TabsContent>

      <TabsContent value="pendencias" className="pb-8">
        {projeto.statusAtual === "Tryout" || projeto.statusAtual === "Entregue" ? (
          <PendenciasForm
            projeto={projeto}
            onPendenciaAdicionada={onPendenciaAdicionada}
            onPendenciaAtualizada={onPendenciaAtualizada}
            onPendenciaExcluida={onPendenciaExcluida}
          />
        ) : (
          <div className={CLASSE_EMPTY}>
            Pendências de visitas técnicas ficam disponíveis a partir da fase Tryout com o Cliente.
          </div>
        )}
      </TabsContent>

      {/* HU-09: preview visual dos dados enviados ao MotorApresentacao */}
      <TabsContent value="relatorio" className="flex flex-col gap-4 pb-8">
        {relatorio === null ? (
          <div className="flex flex-col gap-2 rounded-lg border border-border bg-background p-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-full" style={{ animationDelay: "0.1s" }} />
            <Skeleton className="h-4 w-full" style={{ animationDelay: "0.2s" }} />
          </div>
        ) : (
          <div className="flex flex-col gap-2 rounded-lg border border-border bg-background p-4">
            <span className={CLASSE_ROTULO}>Prévia do relatório</span>
            {relatorio.historicoResumido.length === 0 ? (
              <p className="text-[13px] text-muted-foreground">Nenhuma transição registrada.</p>
            ) : (
              relatorio.historicoResumido.map((h, i) => (
                <div key={i} className="flex justify-between gap-3 text-[13px]">
                  <span>
                    {h.colunaOrigem} → {h.colunaDestino}
                  </span>
                  <span className="whitespace-nowrap tabular-nums text-muted-foreground">
                    {formatarData(h.dataMovimentacao)}
                  </span>
                </div>
              ))
            )}
            {relatorio.metricasTempo.map((m, i) => (
              <div key={i} className="flex justify-between gap-3 text-[13px]">
                <span className="text-muted-foreground">{m.coluna}</span>
                <span className="tabular-nums">{formatarDuracao(m.tempoPermanenciaHoras)}</span>
              </div>
            ))}
          </div>
        )}
        <Button onClick={onExportarRelatorio} disabled={exportando} className="h-[34px] text-[13px]">
          {exportando ? "Exportando..." : "Exportar relatório (.md)"}
        </Button>
        {erroExportacao && <p className="text-center text-sm text-destructive-foreground">{erroExportacao}</p>}
        <p className="m-0 text-center text-xs text-muted-foreground">
          A exportação sai do topo da tela e passa a viver aqui, no contexto do projeto.
        </p>
      </TabsContent>
    </Tabs>
  );
}
