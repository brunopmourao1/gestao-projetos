"use client";

import { useState } from "react";
import { ProjetoDetalhado } from "@/types/projeto";

interface PercentualMontagemFormProps {
  projeto: ProjetoDetalhado;
  onPercentualAtualizado: (percentual: number) => void;
}

// Progresso manual (sem checklist, sem bloqueio) da fase "Montagem" — ver
// HU-17. Ajustado livremente pelo usuário conforme recebe informação em
// reunião sobre o andamento da montagem física da máquina.
export function PercentualMontagemForm({ projeto, onPercentualAtualizado }: PercentualMontagemFormProps) {
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleChange(valor: number) {
    setSalvando(true);
    setErro(null);
    try {
      const resposta = await fetch(`/api/projetos/${projeto.idProjeto}/percentual-montagem`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ percentual: valor }),
      });
      const dados = await resposta.json();
      if (!resposta.ok) {
        setErro(dados?.erro?.mensagem ?? "Não foi possível atualizar o progresso.");
        return;
      }
      onPercentualAtualizado(dados.percentualMontagem as number);
    } catch {
      setErro("Falha de rede ao atualizar o progresso.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold">Percentual de montagem</span>
        <span className="text-[20px] font-bold tabular-nums text-primary">{projeto.percentualMontagem}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={projeto.percentualMontagem}
        disabled={salvando}
        onChange={(e) => handleChange(Number(e.target.value))}
        aria-label="Percentual de montagem"
        className="w-full accent-primary disabled:opacity-60"
      />
      <p className="text-[12.5px] text-muted-foreground">
        Atualizado manualmente conforme o avanço físico da montagem no chão de fábrica.
      </p>
      {erro && <p className="text-sm text-destructive-foreground">{erro}</p>}
    </div>
  );
}
