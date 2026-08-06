import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProjectCard } from "./ProjectCard";
import { Projeto } from "@/types/projeto";

const projeto: Projeto = {
  idProjeto: "1",
  numero: "OS 1800",
  nomeMaquina: "Máquina de Teste",
  descricao: null,
  ordem: 1000,
  dataPrevistaConclusao: null,
  statusAtual: "Offline",
  dataCriacao: new Date().toISOString(),
};

describe("ProjectCard", () => {
  it("renderiza o número e o nome da máquina", () => {
    render(<ProjectCard projeto={projeto} />);
    expect(screen.getByText("OS 1800")).toBeInTheDocument();
    expect(screen.getByText("Máquina de Teste")).toBeInTheDocument();
  });

  it("renderiza só o número quando nome_maquina é null", () => {
    render(<ProjectCard projeto={{ ...projeto, nomeMaquina: null }} />);
    expect(screen.getByText("OS 1800")).toBeInTheDocument();
    expect(screen.queryByText("Máquina de Teste")).not.toBeInTheDocument();
  });

  it("chama onClick com o projeto ao ser clicado", () => {
    const onClick = vi.fn();
    render(<ProjectCard projeto={projeto} onClick={onClick} />);
    fireEvent.click(screen.getByText("OS 1800"));
    expect(onClick).toHaveBeenCalledWith(projeto);
  });
});
