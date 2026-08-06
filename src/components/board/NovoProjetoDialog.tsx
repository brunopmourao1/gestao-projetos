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
import { Textarea } from "@/components/ui/textarea";
import { ResultadoMover } from "./ProjectCard";

export interface DadosNovoProjeto {
  numero: string;
  nomeMaquina: string;
  descricao: string;
}

interface NovoProjetoDialogProps {
  onCriar: (dados: DadosNovoProjeto) => Promise<ResultadoMover>;
}

export function NovoProjetoDialog({ onCriar }: NovoProjetoDialogProps) {
  const [open, setOpen] = useState(false);
  const [numero, setNumero] = useState("");
  const [nomeMaquina, setNomeMaquina] = useState("");
  const [descricao, setDescricao] = useState("");
  const [criando, setCriando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function limparFormulario() {
    setNumero("");
    setNomeMaquina("");
    setDescricao("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const numeroLimpo = numero.trim();
    if (!numeroLimpo) {
      setErro("Informe o número da OS.");
      return;
    }
    setCriando(true);
    setErro(null);
    const resultado = await onCriar({
      numero: numeroLimpo,
      nomeMaquina: nomeMaquina.trim(),
      descricao: descricao.trim(),
    });
    setCriando(false);
    if (!resultado.ok) {
      setErro(resultado.mensagem);
      return;
    }
    limparFormulario();
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
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label htmlFor="numero">Número</Label>
              <Input
                id="numero"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                placeholder="ex: OS 1800"
                autoFocus
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="nome-maquina">Nome da Máquina (opcional)</Label>
              <Input
                id="nome-maquina"
                value={nomeMaquina}
                onChange={(e) => setNomeMaquina(e.target.value)}
                placeholder="ex: Torno CNC 04"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="descricao">Descrição (opcional)</Label>
              <Textarea
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={3}
              />
            </div>
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
