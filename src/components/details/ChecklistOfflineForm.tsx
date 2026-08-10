"use client";

import { useState } from "react";
import { ChecklistOffline, ITENS_CHECKLIST_OFFLINE, ProjetoDetalhado } from "@/types/projeto";
import { percentualChecklistOffline } from "@/lib/checklist-offline";

interface ChecklistOfflineFormProps {
  projeto: ProjetoDetalhado;
  onChecklistAtualizado: (checklist: ChecklistOffline) => void;
}

// Chaves em camelCase (estado local) -> snake_case (body da API).
const CAMPO_BODY: Record<keyof ChecklistOffline, string> = {
  hardware: "hardware",
  logicaFcFb: "logica_fc_fb",
  ihm: "ihm",
  seguranca: "seguranca",
};

// Ver Docs/01-Produto/Backlog-Historias-Usuario.md — checklist da fase Offline
// (Hardware -> Lógica FC/FB -> IHM -> Segurança), bloqueia avanço até 100%.
export function ChecklistOfflineForm({ projeto, onChecklistAtualizado }: ChecklistOfflineFormProps) {
  const [salvandoChave, setSalvandoChave] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const percentual = percentualChecklistOffline(projeto.checklistOffline);

  async function handleToggle(chave: keyof ChecklistOffline, valor: boolean) {
    setSalvandoChave(chave);
    setErro(null);
    try {
      const resposta = await fetch(`/api/projetos/${projeto.idProjeto}/checklist-offline`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [CAMPO_BODY[chave]]: valor }),
      });
      const dados = await resposta.json();
      if (!resposta.ok) {
        setErro(dados?.erro?.mensagem ?? "Não foi possível atualizar o checklist.");
        return;
      }
      onChecklistAtualizado(dados.checklistOffline as ChecklistOffline);
    } catch {
      setErro("Falha de rede ao atualizar o checklist.");
    } finally {
      setSalvandoChave(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Checklist da Fase Offline</h3>
          <span className="text-sm font-medium text-foreground">{percentual}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full ${percentual === 100 ? "bg-emerald-500" : "bg-primary"}`}
            style={{ width: `${percentual}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Só é possível avançar para &quot;Aguardando Montagem&quot; com as 4 sub-etapas concluídas.
        </p>
      </div>
      <div className="space-y-2">
        {ITENS_CHECKLIST_OFFLINE.map((item) => (
          <label key={item.chave} className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={projeto.checklistOffline[item.chave]}
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
