import { COLUNAS_FLUXO } from "@/types/projeto";
import { STATUS_VISUAL } from "@/components/board/statusVisual";

// Skeleton do Board — colunas reais (cabeçalho fixo) com 2 blocos `--muted`
// pulsando no lugar dos cards, nunca texto "Carregando..." (ver README).
export default function CarregandoBoard() {
  return (
    <>
      <header className="flex h-[54px] shrink-0 items-center border-b border-border px-5">
        <h1 className="m-0 text-[15px] font-semibold tracking-[-0.01em]">Board</h1>
      </header>
      <div className="flex flex-1 min-h-0 items-stretch gap-3 overflow-x-auto overflow-y-hidden px-5 py-4">
        {COLUNAS_FLUXO.map(({ status, titulo }) => (
          <div
            key={status}
            className="flex w-[272px] shrink-0 flex-col gap-2 rounded-[10px] bg-col-bg p-2.5"
          >
            <div className="flex items-center gap-2 px-1 py-0.5">
              <span className={`size-2 shrink-0 rounded-full ${STATUS_VISUAL[status].cor}`} />
              <span className="truncate text-[13px] font-semibold">{titulo}</span>
            </div>
            <div className="h-[88px] animate-[pulso_1.4s_ease_infinite] rounded-lg bg-muted" />
            <div
              className="h-[88px] animate-[pulso_1.4s_ease_infinite] rounded-lg bg-muted"
              style={{ animationDelay: "0.2s" }}
            />
          </div>
        ))}
      </div>
    </>
  );
}
