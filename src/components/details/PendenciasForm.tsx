"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PendenciaVisita, ProjetoDetalhado } from "@/types/projeto";

interface PendenciasFormProps {
  projeto: ProjetoDetalhado;
  onPendenciaAdicionada: (pendencia: PendenciaVisita) => void;
  onPendenciaAtualizada: (pendencia: PendenciaVisita) => void;
}

function formatarDataVisita(dataIso: string): string {
  return new Date(dataIso).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

// Log de pendências de visitas técnicas (Tryout/Entregue) — cada visita vira
// uma entrada nova (data + texto), nada é sobrescrito. Ver HU-19. O check de
// concluída é só acompanhamento, não bloqueia avanço de fase.
export function PendenciasForm({ projeto, onPendenciaAdicionada, onPendenciaAtualizada }: PendenciasFormProps) {
  const [texto, setTexto] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [atualizandoId, setAtualizandoId] = useState<string | null>(null);

  async function handleToggleConcluida(pendencia: PendenciaVisita, concluida: boolean) {
    setAtualizandoId(pendencia.idPendencia);
    setErro(null);
    try {
      const resposta = await fetch(
        `/api/projetos/${projeto.idProjeto}/pendencias/${pendencia.idPendencia}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ concluida }),
        }
      );
      const dados = await resposta.json();
      if (!resposta.ok) {
        setErro(dados?.erro?.mensagem ?? "Não foi possível atualizar a pendência.");
        return;
      }
      onPendenciaAtualizada(dados as PendenciaVisita);
    } catch {
      setErro("Falha de rede ao atualizar a pendência.");
    } finally {
      setAtualizandoId(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!texto.trim()) return;
    setErro(null);
    setSalvando(true);
    try {
      const resposta = await fetch(`/api/projetos/${projeto.idProjeto}/pendencias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: texto.trim() }),
      });
      const dados = await resposta.json();
      if (!resposta.ok) {
        setErro(dados?.erro?.mensagem ?? "Não foi possível adicionar a pendência.");
        return;
      }
      onPendenciaAdicionada(dados as PendenciaVisita);
      setTexto("");
    } catch {
      setErro("Falha de rede ao adicionar a pendência.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-[13px] font-semibold">Pendências de visitas técnicas</span>
      {projeto.pendenciasVisitas.length === 0 ? (
        <p className="text-[13px] text-muted-foreground">Nenhuma pendência registrada ainda.</p>
      ) : (
        <div className="flex flex-col">
          {projeto.pendenciasVisitas.map((p) => (
            <label
              key={p.idPendencia}
              className="-mx-2 flex cursor-pointer items-start gap-2.5 rounded-md border-t border-muted px-2 py-2.5 first:border-t-0 hover:bg-muted has-disabled:cursor-not-allowed has-disabled:opacity-60"
            >
              <input
                type="checkbox"
                checked={p.concluida}
                disabled={atualizandoId === p.idPendencia}
                onChange={(e) => handleToggleConcluida(p, e.target.checked)}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className="mt-[1px] flex size-4 shrink-0 items-center justify-center rounded-[4px] border-[1.5px] border-input text-[11px] leading-none peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring"
              >
                {p.concluida ? "✓" : ""}
              </span>
              <span className="flex flex-col gap-0.5">
                <span className={`text-[13.5px] whitespace-pre-wrap ${p.concluida ? "text-muted-foreground" : "text-foreground"}`}>
                  {p.texto}
                </span>
                <span className="text-xs tabular-nums text-muted-foreground">Visita de {formatarDataVisita(p.data)}</span>
              </span>
            </label>
          ))}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Nova pendência…"
          aria-label="Nova pendência"
          className="h-8 text-[13px]"
        />
        <Button type="submit" variant="outline" disabled={salvando || !texto.trim()} className="h-8 px-3 text-[13px]">
          {salvando ? "Adicionando..." : "Adicionar"}
        </Button>
      </form>
      {erro && <p className="text-sm text-destructive-foreground">{erro}</p>}
    </div>
  );
}
