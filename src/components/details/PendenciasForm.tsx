"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PendenciaVisita, ProjetoDetalhado } from "@/types/projeto";

interface PendenciasFormProps {
  projeto: ProjetoDetalhado;
  onPendenciaAdicionada: (pendencia: PendenciaVisita) => void;
  onPendenciaAtualizada: (pendencia: PendenciaVisita) => void;
  onPendenciaExcluida: (idPendencia: string) => void;
}

function formatarDataVisita(dataIso: string): string {
  return new Date(dataIso).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

// Log de pendências de visitas técnicas (Tryout/Entregue) — cada visita vira
// uma entrada nova (data + texto), nada é sobrescrito. Ver HU-19. O check de
// concluída é só acompanhamento, não bloqueia avanço de fase.
export function PendenciasForm({
  projeto,
  onPendenciaAdicionada,
  onPendenciaAtualizada,
  onPendenciaExcluida,
}: PendenciasFormProps) {
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
            <PendenciaLinha
              key={p.idPendencia}
              idProjeto={projeto.idProjeto}
              pendencia={p}
              atualizando={atualizandoId === p.idPendencia}
              onToggleConcluida={(concluida) => handleToggleConcluida(p, concluida)}
              onAtualizada={onPendenciaAtualizada}
              onExcluida={onPendenciaExcluida}
            />
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

interface PendenciaLinhaProps {
  idProjeto: string;
  pendencia: PendenciaVisita;
  atualizando: boolean;
  onToggleConcluida: (concluida: boolean) => void;
  onAtualizada: (pendencia: PendenciaVisita) => void;
  onExcluida: (idPendencia: string) => void;
}

function PendenciaLinha({
  idProjeto,
  pendencia,
  atualizando,
  onToggleConcluida,
  onAtualizada,
  onExcluida,
}: PendenciaLinhaProps) {
  const [editando, setEditando] = useState(false);
  const [texto, setTexto] = useState(pendencia.texto);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSalvarTexto() {
    const textoLimpo = texto.trim();
    if (!textoLimpo || textoLimpo === pendencia.texto) {
      setEditando(false);
      setTexto(pendencia.texto);
      return;
    }
    setSalvando(true);
    setErro(null);
    try {
      const resposta = await fetch(`/api/projetos/${idProjeto}/pendencias/${pendencia.idPendencia}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: textoLimpo }),
      });
      const dados = await resposta.json();
      if (!resposta.ok) {
        setErro(dados?.erro?.mensagem ?? "Não foi possível editar a pendência.");
        return;
      }
      onAtualizada(dados as PendenciaVisita);
      setEditando(false);
    } catch {
      setErro("Falha de rede ao editar a pendência.");
    } finally {
      setSalvando(false);
    }
  }

  async function handleExcluir() {
    setSalvando(true);
    setErro(null);
    try {
      const resposta = await fetch(`/api/projetos/${idProjeto}/pendencias/${pendencia.idPendencia}`, {
        method: "DELETE",
      });
      if (!resposta.ok) {
        const dados = await resposta.json();
        setErro(dados?.erro?.mensagem ?? "Não foi possível excluir a pendência.");
        return;
      }
      onExcluida(pendencia.idPendencia);
    } catch {
      setErro("Falha de rede ao excluir a pendência.");
    } finally {
      setSalvando(false);
      setConfirmandoExclusao(false);
    }
  }

  return (
    <div className="group -mx-2 flex flex-col gap-1.5 rounded-md border-t border-muted px-2 py-2.5 first:border-t-0 hover:bg-muted">
      <div className="flex items-start gap-2.5">
        <label className="flex cursor-pointer items-start pt-[1px] has-disabled:cursor-not-allowed has-disabled:opacity-60">
          <input
            type="checkbox"
            checked={pendencia.concluida}
            disabled={atualizando || editando}
            onChange={(e) => onToggleConcluida(e.target.checked)}
            className="peer sr-only"
          />
          <span
            aria-hidden="true"
            className="flex size-4 shrink-0 items-center justify-center rounded-[4px] border-[1.5px] border-input text-[11px] leading-none peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring"
          >
            {pendencia.concluida ? "✓" : ""}
          </span>
        </label>
        <div className="flex flex-1 flex-col gap-0.5">
          {editando ? (
            <Input
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              className="h-8 text-[13.5px]"
              autoFocus
            />
          ) : (
            <span className={`text-[13.5px] whitespace-pre-wrap ${pendencia.concluida ? "text-muted-foreground" : "text-foreground"}`}>
              {pendencia.texto}
            </span>
          )}
          <span className="text-xs tabular-nums text-muted-foreground">Visita de {formatarDataVisita(pendencia.data)}</span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {editando ? (
            <>
              <button
                type="button"
                disabled={salvando}
                onClick={handleSalvarTexto}
                className="rounded px-2 py-[3px] text-xs font-medium text-primary hover:bg-primary/10"
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditando(false);
                  setTexto(pendencia.texto);
                }}
                className="rounded px-2 py-[3px] text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                Cancelar
              </button>
            </>
          ) : confirmandoExclusao ? (
            <>
              <button
                type="button"
                disabled={salvando}
                onClick={handleExcluir}
                className="rounded px-2 py-[3px] text-xs font-medium text-destructive-foreground hover:bg-destructive/15"
              >
                {salvando ? "Excluindo..." : "Confirmar"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmandoExclusao(false)}
                className="rounded px-2 py-[3px] text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                Cancelar
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                aria-label="Editar pendência"
                onClick={() => setEditando(true)}
                className="rounded px-2 py-[3px] text-xs text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-accent hover:text-accent-foreground focus-visible:opacity-100"
              >
                Editar
              </button>
              <button
                type="button"
                aria-label="Excluir pendência"
                onClick={() => setConfirmandoExclusao(true)}
                className="rounded px-2 py-[3px] text-xs text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive-foreground focus-visible:opacity-100"
              >
                Excluir
              </button>
            </>
          )}
        </div>
      </div>
      {erro && <p className="pl-[26px] text-xs text-destructive-foreground">{erro}</p>}
    </div>
  );
}
