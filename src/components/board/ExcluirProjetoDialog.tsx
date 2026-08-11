"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Projeto } from "@/types/projeto";
import { ResultadoMover } from "./ProjectCard";

interface ExcluirProjetoDialogProps {
  projeto: Projeto;
  onExcluir: (id: string) => Promise<ResultadoMover>;
}

export function ExcluirProjetoDialog({ projeto, onExcluir }: ExcluirProjetoDialogProps) {
  const [open, setOpen] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleConfirmar() {
    setExcluindo(true);
    setErro(null);
    const resultado = await onExcluir(projeto.idProjeto);
    setExcluindo(false);
    if (!resultado.ok) {
      setErro(resultado.mensagem);
      return;
    }
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(novoOpen) => {
        setOpen(novoOpen);
        if (novoOpen) setErro(null);
      }}
    >
      <DialogTrigger render={<Button variant="destructive" size="sm" />}>Excluir</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir projeto {projeto.numero}?</DialogTitle>
        </DialogHeader>
        <div className="py-2 text-sm text-muted-foreground">
          <p>
            Isso remove o projeto <strong>{projeto.numero}</strong>
            {projeto.nomeMaquina ? ` (${projeto.nomeMaquina})` : ""} permanentemente, junto com
            todo o histórico associado. Essa ação não pode ser desfeita.
          </p>
          {erro && <p className="mt-2 text-destructive">{erro}</p>}
        </div>
        <DialogFooter>
          <Button type="button" variant="destructive" disabled={excluindo} onClick={handleConfirmar}>
            {excluindo ? "Excluindo..." : "Confirmar exclusão"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
