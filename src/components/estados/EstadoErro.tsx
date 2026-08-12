import { Button } from "@/components/ui/button";

interface EstadoErroProps {
  titulo: string;
  descricao: string;
  onTentarNovamente: () => void;
}

// Painel de erro padrão pra telas de dados — ver README, seção "Estados
// obrigatórios em TODAS as telas de dados".
export function EstadoErro({ titulo, descricao, onTentarNovamente }: EstadoErroProps) {
  return (
    <div className="m-5 flex items-center justify-between gap-4 rounded-lg border border-destructive/35 bg-destructive/8 px-6 py-5">
      <div>
        <div className="text-sm font-semibold text-destructive-foreground">{titulo}</div>
        <div className="mt-0.5 text-[13px] text-muted-foreground">{descricao}</div>
      </div>
      <Button variant="outline" onClick={onTentarNovamente} className="h-8 shrink-0 px-3.5 text-[13px]">
        Tentar novamente
      </Button>
    </div>
  );
}
