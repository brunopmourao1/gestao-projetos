import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ProjetoDetalhado } from "@/types/projeto";
import { TabNavigation } from "./TabNavigation";

// Ver Docs/02-Tecnico/Matriz-Componentes.md, seção 3
// Modal lateral (40% da tela) que não perde o contexto do Kanban ao fundo.
interface DetailsDrawerProps {
  projeto: ProjetoDetalhado | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DetailsDrawer({ projeto, open, onOpenChange }: DetailsDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[40vw] min-w-[320px] sm:max-w-none px-4">
        <SheetHeader>
          <SheetTitle>{projeto?.nomeMaquina ?? "Projeto"}</SheetTitle>
        </SheetHeader>
        {projeto && <TabNavigation projeto={projeto} />}
      </SheetContent>
    </Sheet>
  );
}
