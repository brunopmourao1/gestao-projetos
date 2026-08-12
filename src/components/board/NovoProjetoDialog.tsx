"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCriar: (dados: DadosNovoProjeto) => Promise<ResultadoMover>;
}

// Controlado externamente — o gatilho "Novo projeto" vive na Topbar (mesma
// tela em todas as rotas da casca), não mais num DialogTrigger local.
export function NovoProjetoDialog({ open, onOpenChange, onCriar }: NovoProjetoDialogProps) {
  const [numero, setNumero] = useState("");
  const [nomeMaquina, setNomeMaquina] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dataPrevistaConclusao, setDataPrevistaConclusao] = useState("");
  const [criando, setCriando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function handleOpenChange(novoOpen: boolean) {
    if (novoOpen) {
      setNumero("");
      setNomeMaquina("");
      setDescricao("");
      setDataPrevistaConclusao("");
      setErro(null);
    }
    onOpenChange(novoOpen);
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
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent aria-label="Novo projeto" className="gap-4 rounded-xl p-6 sm:max-w-[440px]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader className="gap-1">
            <DialogTitle className="text-base font-semibold tracking-[-0.01em]">Novo projeto</DialogTitle>
            <p className="text-[13px] text-muted-foreground">Entra na coluna Esquema Elétrico.</p>
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
          <DialogFooter className="mx-0 mb-0 gap-2 border-t-0 bg-transparent p-0 pt-1">
            <Button type="button" variant="outline" className="h-[34px] px-3.5 text-[13px]" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={criando} className="h-[34px] px-4 text-[13px]">
              {criando ? "Criando..." : "Criar projeto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
