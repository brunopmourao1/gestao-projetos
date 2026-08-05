import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjetoDetalhado } from "@/types/projeto";

// Ver Docs/02-Tecnico/Matriz-Componentes.md, seção 3
interface TabNavigationProps {
  projeto: ProjetoDetalhado;
}

export function TabNavigation({ projeto }: TabNavigationProps) {
  return (
    <Tabs defaultValue="visao-geral" className="mt-4">
      <TabsList className="w-full">
        <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
        <TabsTrigger value="parametros">Parâmetros</TabsTrigger>
        <TabsTrigger value="relatorio">Relatório</TabsTrigger>
      </TabsList>

      {/* HU-04: histórico e anexos de PDFs */}
      <TabsContent value="visao-geral" className="text-sm text-muted-foreground">
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
      <TabsContent value="parametros" className="text-sm text-muted-foreground">
        <p>TODO: formulário de dados_motores e dados_sensores (ver Especificacao-API.md).</p>
      </TabsContent>

      {/* HU-09: preview visual dos dados enviados ao MotorApresentacao */}
      <TabsContent value="relatorio" className="text-sm text-muted-foreground">
        <p>TODO: preview do relatório gerado pelo MotorApresentacao.</p>
      </TabsContent>
    </Tabs>
  );
}
