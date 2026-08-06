import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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

  it("chama onMoverProjeto ao clicar em 'Avançar →' sem disparar onClick do card", async () => {
    const onClick = vi.fn();
    const onMoverProjeto = vi.fn().mockResolvedValue({ ok: true });
    render(
      <ProjectCard
        projeto={projeto}
        onClick={onClick}
        statusProxima="Montagem"
        onMoverProjeto={onMoverProjeto}
      />
    );
    fireEvent.click(screen.getByText("Avançar →"));
    await waitFor(() => expect(onMoverProjeto).toHaveBeenCalledWith(projeto, "Montagem"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("exibe a mensagem de erro quando onMoverProjeto falha", async () => {
    const onMoverProjeto = vi
      .fn()
      .mockResolvedValue({ ok: false, mensagem: "Dados obrigatórios ausentes." });
    render(
      <ProjectCard projeto={projeto} statusProxima="Concluido" onMoverProjeto={onMoverProjeto} />
    );
    fireEvent.click(screen.getByText("Avançar →"));
    expect(await screen.findByText("Dados obrigatórios ausentes.")).toBeInTheDocument();
  });
});
