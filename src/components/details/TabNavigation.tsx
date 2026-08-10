import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChecklistOffline,
  COLUNAS_FLUXO,
  EspecificacoesTecnicas,
  MetricaTempoEstagio,
  ProjetoDetalhado,
} from "@/types/projeto";
import type { RelatorioPayload } from "@/lib/relatorio";
import { ParametrosForm } from "./ParametrosForm";
import { ChecklistOfflineForm } from "./ChecklistOfflineForm";
import { PercentualMontagemForm } from "./PercentualMontagemForm";
import { ObservacoesForm } from "./ObservacoesForm";
import { formatarDuracao } from "@/lib/formatacao";
import { estaAtrasado, formatarData } from "@/lib/prazo";

// Ver Docs/02-Tecnico/Matriz-Componentes.md, seção 3
interface TabNavigationProps {
  projeto: ProjetoDetalhado;
  metricas: MetricaTempoEstagio[] | null;
  relatorio: RelatorioPayload | null;
  onEspecificacoesAtualizadas: (espec: EspecificacoesTecnicas) => void;
  onChecklistAtualizado: (checklist: ChecklistOffline) => void;
  onObservacoesAtualizadas: (observacoes: string | null) => void;
  onPercentualMontagemAtualizado: (percentual: number) => void;
}

export function TabNavigation({
  projeto,
  metricas,
  relatorio,
  onEspecificacoesAtualizadas,
  onChecklistAtualizado,
  onObservacoesAtualizadas,
  onPercentualMontagemAtualizado,
}: TabNavigationProps) {
  return (
    <Tabs defaultValue="visao-geral" className="mt-4">
      <TabsList className="w-full">
        <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
        <TabsTrigger value="progresso">Progresso</TabsTrigger>
        <TabsTrigger value="parametros">Parâmetros</TabsTrigger>
        <TabsTrigger value="relatorio">Relatório</TabsTrigger>
      </TabsList>

      {/* HU-04: histórico e anexos de PDFs / HU-05: lead time por estágio */}
      <TabsContent value="visao-geral" className="text-sm text-muted-foreground">
        <div className="mb-3 space-y-1">
          <h4 className="text-xs font-semibold text-foreground">Descrição</h4>
          <p>{projeto.descricao || "Nenhuma descrição informada."}</p>
        </div>
        <div className="mb-3">
          <ObservacoesForm projeto={projeto} onSalvo={onObservacoesAtualizadas} />
        </div>
        <div className="mb-3 space-y-1">
          <h4 className="text-xs font-semibold text-foreground">Data Prevista de Conclusão (etapa atual)</h4>
          {projeto.dataPrevistaConclusao ? (
            <p className={estaAtrasado(projeto.dataPrevistaConclusao) ? "font-medium text-destructive" : ""}>
              {formatarData(projeto.dataPrevistaConclusao)}
              {estaAtrasado(projeto.dataPrevistaConclusao) && " (atrasado)"}
            </p>
          ) : (
            <p>Nenhuma data definida.</p>
          )}
        </div>
        <div className="mb-3 space-y-1">
          <h4 className="text-xs font-semibold text-foreground">Tempo por Estágio</h4>
          {metricas === null ? (
            <p>Carregando...</p>
          ) : (
            <ul className="space-y-0.5">
              {metricas.map((m, i) => (
                <li key={`${m.coluna}-${i}`}>
                  {COLUNAS_FLUXO.find((c) => c.status === m.coluna)?.titulo ?? m.coluna}:{" "}
                  {formatarDuracao(m.tempoPermanenciaHoras)}
                </li>
              ))}
            </ul>
          )}
        </div>
        {projeto.historicoTransicoes.length === 0 ? (
          <p>Nenhuma transição registrada ainda.</p>
        ) : (
          <ul className="space-y-1">
            {projeto.historicoTransicoes.map((h) => (
              <li key={h.idTransicao}>
                {h.colunaOrigem} → {h.colunaDestino} em {h.dataMovimentacao}
              </li>
            ))}
          </ul>
        )}
      </TabsContent>

      <TabsContent value="progresso">
        {projeto.statusAtual === "Offline" && (
          <ChecklistOfflineForm projeto={projeto} onChecklistAtualizado={onChecklistAtualizado} />
        )}
        {projeto.statusAtual === "Montagem" && (
          <PercentualMontagemForm
            projeto={projeto}
            onPercentualAtualizado={onPercentualMontagemAtualizado}
          />
        )}
        {projeto.statusAtual !== "Offline" && projeto.statusAtual !== "Montagem" && (
          <p className="text-sm text-muted-foreground">
            Progresso disponível durante as fases &quot;Projeto Offline&quot; e &quot;Aguardando
            Montagem&quot;.
          </p>
        )}
      </TabsContent>

      {/* HU-06/HU-07: inputs numéricos para dados de comissionamento físico */}
      <TabsContent value="parametros">
        <ParametrosForm projeto={projeto} onSalvo={onEspecificacoesAtualizadas} />
      </TabsContent>

      {/* HU-09: preview visual dos dados enviados ao MotorApresentacao */}
      <TabsContent value="relatorio" className="text-sm text-muted-foreground">
        {relatorio === null ? (
          <p>Carregando...</p>
        ) : (
          <div className="space-y-3">
            <div>
              <h4 className="text-xs font-semibold text-foreground">Especificações Técnicas</h4>
              <ul className="space-y-0.5">
                <li>Link esquema elétrico: {relatorio.especificacoesTecnicas.linkEsquemaEletrico}</li>
                <li>RPM: {relatorio.especificacoesTecnicas.dadosMotores.rpm}</li>
                <li>Fator de redução: {relatorio.especificacoesTecnicas.dadosMotores.fatorReducao}</li>
                <li>
                  Diâmetro engrenagem: {relatorio.especificacoesTecnicas.dadosMotores.diametroEngrenagem}
                </li>
                <li>Part numbers sensores: {relatorio.especificacoesTecnicas.dadosSensores.partNumbers}</li>
                <li>Calibragem: {relatorio.especificacoesTecnicas.dadosSensores.calibragem}</li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-foreground">Histórico de Transições</h4>
              {relatorio.historicoResumido.length === 0 ? (
                <p>Nenhuma transição registrada.</p>
              ) : (
                <ul className="space-y-0.5">
                  {relatorio.historicoResumido.map((h, i) => (
                    <li key={i}>
                      {h.colunaOrigem} → {h.colunaDestino} em {h.dataMovimentacao}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <h4 className="text-xs font-semibold text-foreground">Tempo por Estágio</h4>
              <ul className="space-y-0.5">
                {relatorio.metricasTempo.map((m, i) => (
                  <li key={i}>
                    {m.coluna}: {formatarDuracao(m.tempoPermanenciaHoras)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
