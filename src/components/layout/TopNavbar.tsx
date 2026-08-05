import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Ver Docs/02-Tecnico/Matriz-Componentes.md, seção 1
// TODO: busca global (HU-03) e exportação de relatório (HU-09) ainda não implementadas.
export function TopNavbar() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b px-4">
      <h1 className="text-lg font-semibold">Gestão de Comissionamento</h1>
      <Input
        placeholder="Buscar máquina..."
        className="max-w-xs"
        disabled
      />
      <Button className="ml-auto" disabled>
        Exportar relatório
      </Button>
    </header>
  );
}
