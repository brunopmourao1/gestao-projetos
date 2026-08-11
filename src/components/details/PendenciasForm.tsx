"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PendenciaVisita, ProjetoDetalhado } from "@/types/projeto";

interface PendenciasFormProps {
  projeto: ProjetoDetalhado;
  onPendenciaAdicionada: (pendencia: PendenciaVisita) => void;
  onPendenciaAtualizada: (pendencia: PendenciaVisita) => void;
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
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={3}
          placeholder="Descreva a pendência encontrada na visita técnica..."
        />
        <div className="space-y-1">
          <Button type="submit" size="sm" disabled={salvando || !texto.trim()}>
            {salvando ? "Adicionando..." : "Adicionar Pendência"}
          </Button>
          {erro && <p className="text-sm text-destructive">{erro}</p>}
        </div>
      </form>
      <div className="space-y-2">
        {projeto.pendenciasVisitas.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma pendência registrada ainda.</p>
        ) : (
          <ul className="space-y-2">
            {projeto.pendenciasVisitas.map((p) => (
              <li key={p.idPendencia} className="rounded-md border p-2 text-sm">
                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={p.concluida}
                    disabled={atualizandoId === p.idPendencia}
                    onChange={(e) => handleToggleConcluida(p, e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-input"
                  />
                  <span className="flex-1">
                    <p className="text-xs text-muted-foreground">
                      {new Date(p.data).toLocaleString("pt-BR")}
                    </p>
                    <p className={`whitespace-pre-wrap ${p.concluida ? "text-muted-foreground line-through" : ""}`}>
                      {p.texto}
                    </p>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
