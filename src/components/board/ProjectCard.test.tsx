import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProjectCard } from "./ProjectCard";
import { Projeto } from "@/types/projeto";

const projeto: Projeto = {
  idProjeto: "1",
  nomeMaquina: "Máquina de Teste",
  statusAtual: "Offline",
  dataCriacao: new Date().toISOString(),
};

describe("ProjectCard", () => {
  it("renderiza o nome da máquina", () => {
    render(<ProjectCard projeto={projeto} />);
    expect(screen.getByText("Máquina de Teste")).toBeInTheDocument();
  });

  it("chama onClick com o projeto ao ser clicado", () => {
    const onClick = vi.fn();
    render(<ProjectCard projeto={projeto} onClick={onClick} />);
    fireEvent.click(screen.getByText("Máquina de Teste"));
    expect(onClick).toHaveBeenCalledWith(projeto);
  });
});
