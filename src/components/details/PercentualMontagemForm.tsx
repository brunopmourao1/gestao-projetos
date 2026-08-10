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
    <div className="space-y-3">
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Progresso da Montagem</h3>
          <span className="text-sm font-medium text-foreground">{projeto.percentualMontagem}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={projeto.percentualMontagem}
          disabled={salvando}
          onChange={(e) => handleChange(Number(e.target.value))}
          className="w-full accent-primary"
        />
        <p className="text-xs text-muted-foreground">
          Ajuste manual, sem checklist — preencha conforme for recebendo informação sobre o andamento
          da montagem física.
        </p>
      </div>
      {erro && <p className="text-sm text-destructive">{erro}</p>}
    </div>
  );
}
