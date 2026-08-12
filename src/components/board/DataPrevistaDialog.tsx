"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { COLUNAS_FLUXO, Projeto } from "@/types/projeto";
import { ResultadoMover } from "./ProjectCard";

interface DataPrevistaDialogProps {
  projeto: Projeto | null;
  onSalvar: (id: string, dataPrevistaConclusao: string) => Promise<ResultadoMover>;
  onFechar: () => void;
}

// Diálogo totalmente controlado: abre automaticamente logo após mover um
// card para uma coluna nova, pedindo a data prevista de conclusão da etapa
// que o projeto acabou de entrar. Pode ser fechado sem preencher.
export function DataPrevistaDialog({ projeto, onSalvar, onFechar }: DataPrevistaDialogProps) {
  const [data, setData] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (projeto) {
      setData(projeto.dataPrevistaConclusao?.slice(0, 10) ?? "");
      setErro(null);
    }
  }, [projeto]);

  if (!projeto) return null;

  const titulo = COLUNAS_FLUXO.find((c) => c.status === projeto.statusAtual)?.titulo ?? projeto.statusAtual;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!projeto) return;
    setSalvando(true);
    setErro(null);
    const resultado = await onSalvar(projeto.idProjeto, data);
    setSalvando(false);
    if (!resultado.ok) {
      setErro(resultado.mensagem);
      return;
    }
    onFechar();
  }

  return (
    <Dialog open onOpenChange={(novoOpen) => { if (!novoOpen) onFechar(); }}>
      <DialogContent aria-label={`Data prevista — ${titulo}`} className="gap-4 rounded-xl p-6 sm:max-w-[440px]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader className="gap-1">
            <DialogTitle className="text-base font-semibold tracking-[-0.01em]">
              Data prevista — {titulo}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <p className="text-[13px] text-muted-foreground">
              {projeto.numero}: quando essa etapa deve estar concluída? (opcional)
            </p>
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="data-prevista-etapa"
                className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground"
              >
                Data prevista de conclusão
              </Label>
              <Input
                id="data-prevista-etapa"
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="h-[34px] rounded-md text-[13px] tabular-nums"
                autoFocus
              />
            </div>
            {erro && <p className="text-sm text-destructive-foreground">{erro}</p>}
          </div>
          <DialogFooter className="mx-0 mb-0 gap-2 border-t-0 bg-transparent p-0 pt-1">
            <Button type="button" variant="outline" className="h-[34px] px-3.5 text-[13px]" onClick={onFechar}>
              Pular
            </Button>
            <Button type="submit" disabled={salvando} className="h-[34px] px-4 text-[13px]">
              {salvando ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
