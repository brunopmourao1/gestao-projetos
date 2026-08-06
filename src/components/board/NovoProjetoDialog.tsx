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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResultadoMover } from "./ProjectCard";

interface NovoProjetoDialogProps {
  onCriar: (nomeMaquina: string) => Promise<ResultadoMover>;
}

export function NovoProjetoDialog({ onCriar }: NovoProjetoDialogProps) {
  const [open, setOpen] = useState(false);
  const [nomeMaquina, setNomeMaquina] = useState("");
  const [criando, setCriando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nome = nomeMaquina.trim();
    if (!nome) {
      setErro("Informe o nome da máquina.");
      return;
    }
    setCriando(true);
    setErro(null);
    const resultado = await onCriar(nome);
    setCriando(false);
    if (!resultado.ok) {
      setErro(resultado.mensagem);
      return;
    }
    setNomeMaquina("");
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
      <DialogTrigger render={<Button />}>Novo Projeto</DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Novo Projeto</DialogTitle>
          </DialogHeader>
          <div className="space-y-1 py-2">
            <Label htmlFor="nome-maquina">Nome da Máquina</Label>
            <Input
              id="nome-maquina"
              value={nomeMaquina}
              onChange={(e) => setNomeMaquina(e.target.value)}
              placeholder="ex: Torno CNC 04"
              autoFocus
            />
            {erro && <p className="text-sm text-destructive">{erro}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={criando}>
              {criando ? "Criando..." : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
