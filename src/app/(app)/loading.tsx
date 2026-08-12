// Skeleton da Visão geral — blocos `--muted` com `animation: pulso`, nunca
// texto "Carregando..." (ver README, seção "Estados obrigatórios").
export default function CarregandoVisaoGeral() {
  return (
    <>
      <header className="flex h-[54px] shrink-0 items-center border-b border-border px-5">
        <h1 className="m-0 text-[15px] font-semibold tracking-[-0.01em]">Visão geral</h1>
      </header>
      <div className="mx-auto flex w-full max-w-[1160px] flex-1 flex-col gap-5 overflow-y-auto p-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[92px] animate-[pulso_1.4s_ease_infinite] rounded-lg bg-muted"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[2fr_1fr]">
          <div className="h-[260px] animate-[pulso_1.4s_ease_infinite] rounded-lg bg-muted" />
          <div
            className="h-[260px] animate-[pulso_1.4s_ease_infinite] rounded-lg bg-muted"
            style={{ animationDelay: "0.2s" }}
          />
        </div>
        <div
          className="h-[180px] animate-[pulso_1.4s_ease_infinite] rounded-lg bg-muted"
          style={{ animationDelay: "0.4s" }}
        />
      </div>
    </>
  );
}
