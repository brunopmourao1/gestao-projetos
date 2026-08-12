"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Topbar } from "@/components/layout/Topbar";
import { EstadoErro } from "@/components/estados/EstadoErro";
import { NovoProjetoDialog, DadosNovoProjeto } from "@/components/board/NovoProjetoDialog";
import { ResultadoMover } from "@/components/board/ProjectCard";
import { STATUS_VISUAL } from "@/components/board/statusVisual";
import { ChecklistItemConfig, FaseChecklist } from "@/types/projeto";

const TITULO_FASE: Record<FaseChecklist, string> = {
  Offline: "Fase Offline",
  Online: "Fase Online",
};

const STATUS_DA_FASE: Record<FaseChecklist, "Offline" | "Online"> = {
  Offline: "Offline",
  Online: "Online",
};

// Tela de configuração dos itens dos checklists de Offline/Online (add,
// editar rótulo, excluir). Percentual de cada item é sempre 100/N (N = itens
// da fase), calculado em src/lib/checklist.ts — nunca armazenado aqui. Ver HU-20.
export function ChecklistConfigManager() {
  const router = useRouter();
  const [itens, setItens] = useState<ChecklistItemConfig[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [novoProjetoAberto, setNovoProjetoAberto] = useState(false);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    setErro(null);
    try {
      const resposta = await fetch("/api/configuracoes/checklist");
      const dados = await resposta.json();
      if (resposta.ok) {
        setItens(dados);
      } else {
        setErro("Não foi possível carregar a configuração.");
      }
    } catch {
      setErro("Falha de rede ao carregar a configuração.");
    }
  }

  async function handleCriarProjeto(dadosNovo: DadosNovoProjeto): Promise<ResultadoMover> {
    try {
      const resposta = await fetch("/api/projetos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numero: dadosNovo.numero,
          nome_maquina: dadosNovo.nomeMaquina || undefined,
          descricao: dadosNovo.descricao || undefined,
          data_prevista_conclusao: dadosNovo.dataPrevistaConclusao || undefined,
        }),
      });
      const dados = await resposta.json();
      if (!resposta.ok) {
        return { ok: false, mensagem: dados?.erro?.mensagem ?? "Não foi possível criar o projeto." };
      }
      router.refresh();
      return { ok: true };
    } catch {
      return { ok: false, mensagem: "Falha de rede ao criar o projeto." };
    }
  }

  return (
    <>
      <Topbar
        titulo="Configurações"
        busca={busca}
        onBuscaChange={setBusca}
        onNovoProjeto={() => setNovoProjetoAberto(true)}
      />

      <div className="mx-auto flex w-full max-w-[980px] flex-1 flex-col gap-4 overflow-y-auto p-6">
        <div>
          <div className="text-lg font-semibold tracking-[-0.01em]">Checklists de fase</div>
          <p className="mt-1 max-w-[560px] text-[13px] leading-[1.5] text-muted-foreground">
            Itens verificados nas fases Offline e Online. O peso de cada item é sempre 100% dividido pelo
            número de itens da fase.
          </p>
        </div>

        {erro ? (
          <EstadoErro titulo="Não foi possível carregar a configuração" descricao={erro} onTentarNovamente={carregar} />
        ) : itens === null ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {[0, 1].map((i) => (
              <Skeleton key={i} className="h-72" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {(["Offline", "Online"] as FaseChecklist[]).map((fase) => (
              <ListaFase
                key={fase}
                fase={fase}
                itens={itens.filter((i) => i.fase === fase).sort((a, b) => a.ordem - b.ordem)}
                onMudou={carregar}
              />
            ))}
          </div>
        )}
      </div>

      <NovoProjetoDialog open={novoProjetoAberto} onOpenChange={setNovoProjetoAberto} onCriar={handleCriarProjeto} />
    </>
  );
}

function ListaFase({
  fase,
  itens,
  onMudou,
}: {
  fase: FaseChecklist;
  itens: ChecklistItemConfig[];
  onMudou: () => void;
}) {
  const [novoRotulo, setNovoRotulo] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const percentualPorItem = itens.length > 0 ? Math.round(100 / itens.length) : 0;
  const visual = STATUS_VISUAL[STATUS_DA_FASE[fase]];

  async function handleAdicionar(e: React.FormEvent) {
    e.preventDefault();
    if (!novoRotulo.trim()) return;
    setSalvando(true);
    setErro(null);
    try {
      const resposta = await fetch("/api/configuracoes/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fase, rotulo: novoRotulo.trim() }),
      });
      const dados = await resposta.json();
      if (!resposta.ok) {
        setErro(dados?.erro?.mensagem ?? "Não foi possível adicionar o item.");
        return;
      }
      setNovoRotulo("");
      onMudou();
    } catch {
      setErro("Falha de rede ao adicionar o item.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="self-start overflow-hidden rounded-lg border border-border bg-card shadow-xs">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3.5">
        <span className={`size-[7px] shrink-0 rounded-full ${visual.cor}`} />
        <span className="text-[13.5px] font-semibold">{TITULO_FASE[fase]}</span>
        <span className="ml-auto text-xs tabular-nums text-muted-foreground">{percentualPorItem}% por item</span>
      </div>
      <div className="flex flex-col">
        {itens.length === 0 ? (
          <p className="px-4 py-3.5 text-[13px] text-muted-foreground">Nenhum item configurado ainda.</p>
        ) : (
          itens.map((item) => <ItemLinha key={item.idItem} item={item} onMudou={onMudou} />)
        )}
        <form onSubmit={handleAdicionar} className="flex gap-2 px-4 py-3">
          <Input
            value={novoRotulo}
            onChange={(e) => setNovoRotulo(e.target.value)}
            placeholder="Novo item do checklist…"
            aria-label={`Novo item ${fase}`}
            className="h-8 flex-1 text-[13px]"
          />
          <Button type="submit" variant="outline" disabled={salvando || !novoRotulo.trim()} className="h-8 px-3 text-[13px]">
            Adicionar
          </Button>
        </form>
        {erro && <p className="px-4 pb-3 text-[13px] text-destructive-foreground">{erro}</p>}
      </div>
    </div>
  );
}

function ItemLinha({ item, onMudou }: { item: ChecklistItemConfig; onMudou: () => void }) {
  const [editando, setEditando] = useState(false);
  const [rotulo, setRotulo] = useState(item.rotulo);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSalvarRotulo() {
    if (!rotulo.trim() || rotulo.trim() === item.rotulo) {
      setEditando(false);
      setRotulo(item.rotulo);
      return;
    }
    setSalvando(true);
    setErro(null);
    try {
      const resposta = await fetch(`/api/configuracoes/checklist/${item.idItem}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rotulo: rotulo.trim() }),
      });
      if (!resposta.ok) {
        const dados = await resposta.json();
        setErro(dados?.erro?.mensagem ?? "Não foi possível renomear o item.");
        return;
      }
      setEditando(false);
      onMudou();
    } catch {
      setErro("Falha de rede ao renomear o item.");
    } finally {
      setSalvando(false);
    }
  }

  async function handleExcluir() {
    setSalvando(true);
    setErro(null);
    try {
      const resposta = await fetch(`/api/configuracoes/checklist/${item.idItem}`, { method: "DELETE" });
      if (!resposta.ok) {
        const dados = await resposta.json();
        setErro(dados?.erro?.mensagem ?? "Não foi possível excluir o item.");
        return;
      }
      onMudou();
    } catch {
      setErro("Falha de rede ao excluir o item.");
    } finally {
      setSalvando(false);
      setConfirmandoExclusao(false);
    }
  }

  return (
    <div className="flex flex-col border-b border-muted last:border-b-0">
      <div className="group flex items-center gap-2.5 px-4 py-2.5 hover:bg-muted">
        <span aria-hidden="true" className="cursor-grab text-xs tracking-[1px] text-muted-foreground">
          ⠿
        </span>
        {editando ? (
          <>
            <Input
              value={rotulo}
              onChange={(e) => setRotulo(e.target.value)}
              className="h-8 flex-1 text-[13px]"
              autoFocus
            />
            <Button size="sm" variant="outline" disabled={salvando} onClick={handleSalvarRotulo} className="h-7 px-2.5 text-xs">
              Salvar
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2.5 text-xs"
              onClick={() => {
                setEditando(false);
                setRotulo(item.rotulo);
              }}
            >
              Cancelar
            </Button>
          </>
        ) : (
          <>
            <span className="flex-1 text-[13px]">{item.rotulo}</span>
            <button
              type="button"
              aria-label="Editar item"
              onClick={() => setEditando(true)}
              className="rounded px-2 py-[3px] text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              Editar
            </button>
            {confirmandoExclusao ? (
              <>
                <button
                  type="button"
                  disabled={salvando}
                  onClick={handleExcluir}
                  className="rounded px-2 py-[3px] text-xs font-medium text-destructive-foreground hover:bg-destructive/15"
                >
                  Confirmar
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmandoExclusao(false)}
                  className="rounded px-2 py-[3px] text-xs text-muted-foreground hover:bg-muted"
                >
                  Cancelar
                </button>
              </>
            ) : (
              <button
                type="button"
                aria-label="Excluir item"
                onClick={() => setConfirmandoExclusao(true)}
                className="rounded px-2 py-[3px] text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive-foreground"
              >
                Excluir
              </button>
            )}
          </>
        )}
      </div>
      {erro && <p className="px-4 pb-2 text-xs text-destructive-foreground">{erro}</p>}
    </div>
  );
}
