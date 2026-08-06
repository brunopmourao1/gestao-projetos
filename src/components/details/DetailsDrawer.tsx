import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { EspecificacoesTecnicas, MetricaTempoEstagio, ProjetoDetalhado } from "@/types/projeto";
import { TabNavigation } from "./TabNavigation";

// Ver Docs/02-Tecnico/Matriz-Componentes.md, seção 3
// Modal lateral (40% da tela) que não perde o contexto do Kanban ao fundo.
interface DetailsDrawerProps {
  projeto: ProjetoDetalhado | null;
  metricas: MetricaTempoEstagio[] | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEspecificacoesAtualizadas: (espec: EspecificacoesTecnicas) => void;
}

export function DetailsDrawer({
  projeto,
  metricas,
  open,
  onOpenChange,
  onEspecificacoesAtualizadas,
}: DetailsDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[40vw] min-w-[320px] sm:max-w-none px-4">
        <SheetHeader>
          <SheetTitle>{projeto?.nomeMaquina ?? "Projeto"}</SheetTitle>
        </SheetHeader>
        {projeto && (
          <TabNavigation
            projeto={projeto}
            metricas={metricas}
            onEspecificacoesAtualizadas={onEspecificacoesAtualizadas}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
