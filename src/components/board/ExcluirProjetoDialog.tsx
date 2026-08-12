"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            aria-label="Excluir projeto"
            className="h-auto rounded-[5px] px-2.5 py-[5px] text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive-foreground"
          />
        }
      >
        Excluir
      </DialogTrigger>
      <DialogContent aria-label="Excluir projeto" className="gap-4 rounded-xl p-6 sm:max-w-[440px]">
        <DialogHeader className="gap-1">
          <DialogTitle className="text-base font-semibold tracking-[-0.01em]">
            Excluir projeto {projeto.numero}?
          </DialogTitle>
        </DialogHeader>
        <div className="text-[13.5px] leading-[1.55] text-muted-foreground">
          <p>
            Isso remove o projeto <strong className="text-foreground">{projeto.numero}</strong>
            {projeto.nomeMaquina ? ` (${projeto.nomeMaquina})` : ""} permanentemente, junto com todo o
            histórico associado. Essa ação não pode ser desfeita.
          </p>
          {erro && <p className="mt-2 text-destructive-foreground">{erro}</p>}
        </div>
        <DialogFooter className="mx-0 mb-0 gap-2 border-t-0 bg-transparent p-0 pt-1">
          <Button type="button" variant="outline" className="h-[34px] px-3.5 text-[13px]" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={excluindo}
            onClick={handleConfirmar}
            className="h-[34px] px-4 text-[13px]"
          >
            {excluindo ? "Excluindo..." : "Confirmar exclusão"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
