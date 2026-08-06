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
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Data prevista — {titulo}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              {projeto.numero}: quando essa etapa deve estar concluída? (opcional)
            </p>
            <div className="space-y-1">
              <Label htmlFor="data-prevista-etapa">Data Prevista de Conclusão</Label>
              <Input
                id="data-prevista-etapa"
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                autoFocus
              />
            </div>
            {erro && <p className="text-sm text-destructive">{erro}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onFechar}>
              Pular
            </Button>
            <Button type="submit" disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
