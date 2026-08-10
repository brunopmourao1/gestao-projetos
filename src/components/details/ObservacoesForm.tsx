"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ProjetoDetalhado } from "@/types/projeto";

interface ObservacoesFormProps {
  projeto: ProjetoDetalhado;
  onSalvo: (observacoes: string | null) => void;
}

// Nota única e editável do projeto (pendências, definições em aberto, algo
// faltando) — visível em qualquer fase, não só na Offline.
export function ObservacoesForm({ projeto, onSalvo }: ObservacoesFormProps) {
  const [texto, setTexto] = useState(projeto.observacoes ?? "");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSucesso(false);
    setSalvando(true);
    try {
      const resposta = await fetch(`/api/projetos/${projeto.idProjeto}/observacoes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ observacoes: texto.trim() || null }),
      });
      const dados = await resposta.json();
      if (!resposta.ok) {
        setErro(dados?.erro?.mensagem ?? "Não foi possível salvar as observações.");
        return;
      }
      onSalvo(dados.observacoes as string | null);
      setSucesso(true);
    } catch {
      setErro("Falha de rede ao salvar as observações.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Label htmlFor="observacoes">Observações</Label>
      <Textarea
        id="observacoes"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        rows={4}
        placeholder="Pendências, definições em aberto, algo faltando..."
      />
      <div className="space-y-1">
        <Button type="submit" size="sm" disabled={salvando}>
          {salvando ? "Salvando..." : "Salvar Observações"}
        </Button>
        {erro && <p className="text-sm text-destructive">{erro}</p>}
        {sucesso && !erro && <p className="text-sm text-emerald-600">Salvo com sucesso.</p>}
      </div>
    </form>
  );
}
