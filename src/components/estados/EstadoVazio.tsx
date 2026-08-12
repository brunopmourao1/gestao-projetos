import { Button } from "@/components/ui/button";

interface EstadoVazioProps {
  titulo: string;
  descricao: string;
  rotuloAcao?: string;
  onAcao?: () => void;
}

// Estado vazio padrão pra telas de dados (Board, Visão geral) — ver README,
// seção "Estados obrigatórios em TODAS as telas de dados".
export function EstadoVazio({ titulo, descricao, rotuloAcao, onAcao }: EstadoVazioProps) {
  return (
    <div className="m-5 flex flex-1 flex-col items-center justify-center gap-2.5 rounded-xl border border-dashed border-border px-6 py-16 text-center">
      <div
        aria-hidden="true"
        className="flex size-11 items-center justify-center rounded-[10px] bg-accent text-xl font-semibold text-accent-foreground"
      >
        +
      </div>
      <div className="text-[15px] font-semibold">{titulo}</div>
      <div className="max-w-[380px] text-[13px] text-muted-foreground">{descricao}</div>
      {rotuloAcao && onAcao && (
        <Button onClick={onAcao} size="sm" className="mt-1.5 h-8 px-3.5 text-[13px]">
          {rotuloAcao}
        </Button>
      )}
    </div>
  );
}
