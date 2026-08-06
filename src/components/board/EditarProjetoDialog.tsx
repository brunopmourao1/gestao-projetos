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
import { Projeto } from "@/types/projeto";

export interface DadosEditarProjeto {
  numero: string;
  nomeMaquina: string;
  descricao: string;
  dataPrevistaConclusao: string;
}

interface EditarProjetoDialogProps {
  projeto: Projeto;
  onEditar: (id: string, dados: DadosEditarProjeto) => Promise<ResultadoMover>;
}

function paraInputDate(dataIso: string | null): string {
  return dataIso ? dataIso.slice(0, 10) : "";
}

export function EditarProjetoDialog({ projeto, onEditar }: EditarProjetoDialogProps) {
  const [open, setOpen] = useState(false);
  const [numero, setNumero] = useState(projeto.numero);
  const [nomeMaquina, setNomeMaquina] = useState(projeto.nomeMaquina ?? "");
  const [descricao, setDescricao] = useState(projeto.descricao ?? "");
  const [dataPrevistaConclusao, setDataPrevistaConclusao] = useState(
    paraInputDate(projeto.dataPrevistaConclusao)
  );
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function restaurarValores() {
    setNumero(projeto.numero);
    setNomeMaquina(projeto.nomeMaquina ?? "");
    setDescricao(projeto.descricao ?? "");
    setDataPrevistaConclusao(paraInputDate(projeto.dataPrevistaConclusao));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const numeroLimpo = numero.trim();
    if (!numeroLimpo) {
      setErro("Informe o número da OS.");
      return;
    }
    setSalvando(true);
    setErro(null);
    const resultado = await onEditar(projeto.idProjeto, {
      numero: numeroLimpo,
      nomeMaquina: nomeMaquina.trim(),
      descricao: descricao.trim(),
      dataPrevistaConclusao,
    });
    setSalvando(false);
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
        if (novoOpen) {
          restaurarValores();
          setErro(null);
        }
      }}
    >
      <DialogTrigger render={<Button variant="outline" size="sm" />}>Editar</DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Projeto</DialogTitle>
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
            <Button type="submit" disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
