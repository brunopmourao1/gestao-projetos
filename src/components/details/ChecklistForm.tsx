"use client";

import { useEffect, useState } from "react";
import { ChecklistItemConfig, FaseChecklist, ProjetoDetalhado } from "@/types/projeto";
import { percentualChecklist } from "@/lib/checklist";
import { Skeleton } from "@/components/ui/skeleton";

interface ChecklistFormProps {
  fase: FaseChecklist;
  projeto: ProjetoDetalhado;
  onChecklistAtualizado: (checklist: Record<string, boolean>) => void;
}

const ROTA_PATCH: Record<FaseChecklist, string> = {
  Offline: "checklist-offline",
  Online: "checklist-online",
};

const PROXIMA_COLUNA: Record<FaseChecklist, string> = {
  Offline: "Aguardando Montagem",
  Online: "Tryout com o Cliente",
};

// Checklist de sub-etapas configurável (ver tela de Configurações, HU-20) —
// itens vêm da API em vez de um array fixo. Compartilhado entre Offline e
// Online, cada instância busca a config só da sua fase.
export function ChecklistForm({ fase, projeto, onChecklistAtualizado }: ChecklistFormProps) {
  const [itens, setItens] = useState<ChecklistItemConfig[] | null>(null);
  const [salvandoChave, setSalvandoChave] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const checklist = fase === "Offline" ? projeto.checklistOffline : projeto.checklistOnline;

  useEffect(() => {
    let cancelado = false;
    fetch(`/api/configuracoes/checklist`)
      .then((r) => (r.ok ? r.json() : []))
      .then((todos: ChecklistItemConfig[]) => {
        if (!cancelado) setItens(todos.filter((i) => i.fase === fase));
      })
      .catch(() => {
        if (!cancelado) setItens([]);
      });
    return () => {
      cancelado = true;
    };
  }, [fase]);

  async function handleToggle(chave: string, valor: boolean) {
    setSalvandoChave(chave);
    setErro(null);
    try {
      const resposta = await fetch(`/api/projetos/${projeto.idProjeto}/${ROTA_PATCH[fase]}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [chave]: valor }),
      });
      const dados = await resposta.json();
      if (!resposta.ok) {
        setErro(dados?.erro?.mensagem ?? "Não foi possível atualizar o checklist.");
        return;
      }
      const campo = fase === "Offline" ? "checklistOffline" : "checklistOnline";
      onChecklistAtualizado(dados[campo] as Record<string, boolean>);
    } catch {
      setErro("Falha de rede ao atualizar o checklist.");
    } finally {
      setSalvandoChave(null);
    }
  }

  if (itens === null) {
    return (
      <div className="flex flex-col gap-2.5">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-1.5 w-full" />
        <Skeleton className="h-4 w-full" style={{ animationDelay: "0.1s" }} />
        <Skeleton className="h-4 w-full" style={{ animationDelay: "0.2s" }} />
        <Skeleton className="h-4 w-2/3" style={{ animationDelay: "0.3s" }} />
      </div>
    );
  }

  if (itens.length === 0) {
    return (
      <p className="text-[13px] text-muted-foreground">
        Nenhum item configurado pra fase {fase}. Adicione itens em Configurações.
      </p>
    );
  }

  const percentual = percentualChecklist(itens, checklist);

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold">Checklist da fase {fase}</span>
        <span className="text-[13px] font-semibold tabular-nums text-primary">{percentual}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-track">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-200 ease-out"
          style={{ width: `${percentual}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Só é possível avançar para &quot;{PROXIMA_COLUNA[fase]}&quot; com os {itens.length} itens concluídos.
      </p>
      <div className="mt-1 flex flex-col">
        {itens.map((item) => {
          const concluido = Boolean(checklist[item.chave]);
          return (
            <label
              key={item.idItem}
              className="-mx-2 flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 hover:bg-muted has-disabled:cursor-not-allowed has-disabled:opacity-60"
            >
              <input
                type="checkbox"
                checked={concluido}
                disabled={salvandoChave === item.chave}
                onChange={(e) => handleToggle(item.chave, e.target.checked)}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className="flex size-4 shrink-0 items-center justify-center rounded-[4px] border-[1.5px] border-input text-[11px] leading-none peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring"
              >
                {concluido ? "✓" : ""}
              </span>
              <span className={`text-[13.5px] ${concluido ? "text-muted-foreground" : "text-foreground"}`}>
                {item.rotulo}
              </span>
            </label>
          );
        })}
      </div>
      {erro && <p className="text-sm text-destructive-foreground">{erro}</p>}
    </div>
  );
}
