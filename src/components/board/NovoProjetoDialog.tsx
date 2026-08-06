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
import { ProjetoFormCampos } from "./ProjetoFormCampos";
import { ResultadoMover } from "./ProjectCard";

export interface DadosNovoProjeto {
  numero: string;
  nomeMaquina: string;
  descricao: string;
  dataPrevistaConclusao: string;
}

interface NovoProjetoDialogProps {
  onCriar: (dados: DadosNovoProjeto) => Promise<ResultadoMover>;
}

export function NovoProjetoDialog({ onCriar }: NovoProjetoDialogProps) {
  const [open, setOpen] = useState(false);
  const [numero, setNumero] = useState("");
  const [nomeMaquina, setNomeMaquina] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dataPrevistaConclusao, setDataPrevistaConclusao] = useState("");
  const [criando, setCriando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function limparFormulario() {
    setNumero("");
    setNomeMaquina("");
    setDescricao("");
    setDataPrevistaConclusao("");
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
      dataPrevistaConclusao,
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
          <ProjetoFormCampos
            numero={numero}
            onNumeroChange={setNumero}
            nomeMaquina={nomeMaquina}
            onNomeMaquinaChange={setNomeMaquina}
            descricao={descricao}
            onDescricaoChange={setDescricao}
            dataPrevistaConclusao={dataPrevistaConclusao}
            onDataPrevistaConclusaoChange={setDataPrevistaConclusao}
            erro={erro}
          />
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
