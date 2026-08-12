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
    <form onSubmit={handleSubmit} className="flex flex-col gap-1.5">
      <Label htmlFor="observacoes" className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        Observações
      </Label>
      <Textarea
        id="observacoes"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        rows={3}
        placeholder="Pendências, definições em aberto, algo faltando…"
        className="rounded-md text-[13px] leading-[1.5]"
      />
      <div className="flex flex-col gap-1">
        <Button
          type="submit"
          variant="outline"
          disabled={salvando}
          className="h-7 w-fit self-start px-3 text-[12.5px] font-medium"
        >
          {salvando ? "Salvando..." : "Salvar observações"}
        </Button>
        {erro && <p className="text-sm text-destructive-foreground">{erro}</p>}
        {sucesso && !erro && <p className="text-sm text-status-entregue-foreground">Salvo com sucesso.</p>}
      </div>
    </form>
  );
}
