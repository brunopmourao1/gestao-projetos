"use client";

import { useEffect, useState } from "react";
import { ChecklistItemConfig, FaseChecklist, ProjetoDetalhado } from "@/types/projeto";
import { percentualChecklist } from "@/lib/checklist";

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
    return <p className="text-sm text-muted-foreground">Carregando...</p>;
  }

  if (itens.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhum item configurado pra fase {fase}. Adicione itens em Configurações.
      </p>
    );
  }

  const percentual = percentualChecklist(itens, checklist);

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Checklist da Fase {fase}</h3>
          <span className="text-sm font-medium text-foreground">{percentual}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full ${percentual === 100 ? "bg-emerald-500" : "bg-primary"}`}
            style={{ width: `${percentual}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Só é possível avançar para &quot;{PROXIMA_COLUNA[fase]}&quot; com os {itens.length} itens
          concluídos.
        </p>
      </div>
      <div className="space-y-2">
        {itens.map((item) => (
          <label key={item.idItem} className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={Boolean(checklist[item.chave])}
              disabled={salvandoChave === item.chave}
              onChange={(e) => handleToggle(item.chave, e.target.checked)}
              className="h-4 w-4 rounded border-input"
            />
            {item.rotulo}
          </label>
        ))}
      </div>
      {erro && <p className="text-sm text-destructive">{erro}</p>}
    </div>
  );
}
