import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  COLUNAS_FLUXO,
  EspecificacoesTecnicas,
  MetricaTempoEstagio,
  ProjetoDetalhado,
} from "@/types/projeto";
import { ParametrosForm } from "./ParametrosForm";
import { formatarDuracao } from "@/lib/formatacao";

// Ver Docs/02-Tecnico/Matriz-Componentes.md, seção 3
interface TabNavigationProps {
  projeto: ProjetoDetalhado;
  metricas: MetricaTempoEstagio[] | null;
  onEspecificacoesAtualizadas: (espec: EspecificacoesTecnicas) => void;
}

export function TabNavigation({ projeto, metricas, onEspecificacoesAtualizadas }: TabNavigationProps) {
  return (
    <Tabs defaultValue="visao-geral" className="mt-4">
      <TabsList className="w-full">
        <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
        <TabsTrigger value="parametros">Parâmetros</TabsTrigger>
        <TabsTrigger value="relatorio">Relatório</TabsTrigger>
      </TabsList>

      {/* HU-04: histórico e anexos de PDFs / HU-05: lead time por estágio */}
      <TabsContent value="visao-geral" className="text-sm text-muted-foreground">
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

      {/* HU-06/HU-07: inputs numéricos para dados de comissionamento físico */}
      <TabsContent value="parametros">
        <ParametrosForm projeto={projeto} onSalvo={onEspecificacoesAtualizadas} />
      </TabsContent>

      {/* HU-09: preview visual dos dados enviados ao MotorApresentacao */}
      <TabsContent value="relatorio" className="text-sm text-muted-foreground">
        <p>TODO: preview do relatório gerado pelo MotorApresentacao.</p>
      </TabsContent>
    </Tabs>
  );
}
