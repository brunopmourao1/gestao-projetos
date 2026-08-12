import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProjectCard } from "./ProjectCard";
import { ChecklistItemConfig, Projeto } from "@/types/projeto";

const projeto: Projeto = {
  idProjeto: "1",
  numero: "OS 1800",
  nomeMaquina: "Máquina de Teste",
  descricao: null,
  ordem: 1000,
  dataPrevistaConclusao: null,
  statusAtual: "Offline",
  dataCriacao: new Date().toISOString(),
  checklistOffline: { hardware: false, logicaFcFb: false, ihm: false, seguranca: false },
  observacoes: null,
  percentualMontagem: 0,
  checklistOnline: { testesIO: false, ajusteParametros: false, testesFuncionais: false, liberacao: false },
};

const itensOffline: ChecklistItemConfig[] = [
  { idItem: "1", fase: "Offline", chave: "hardware", rotulo: "Hardware", ordem: 0 },
  { idItem: "2", fase: "Offline", chave: "logicaFcFb", rotulo: "Lógica", ordem: 1 },
  { idItem: "3", fase: "Offline", chave: "ihm", rotulo: "IHM", ordem: 2 },
  { idItem: "4", fase: "Offline", chave: "seguranca", rotulo: "Segurança", ordem: 3 },
];

const itensOnline: ChecklistItemConfig[] = [
  { idItem: "5", fase: "Online", chave: "testesIO", rotulo: "Testes de E/S", ordem: 0 },
  { idItem: "6", fase: "Online", chave: "ajusteParametros", rotulo: "Ajuste", ordem: 1 },
  { idItem: "7", fase: "Online", chave: "testesFuncionais", rotulo: "Testes funcionais", ordem: 2 },
  { idItem: "8", fase: "Online", chave: "liberacao", rotulo: "Liberação", ordem: 3 },
];

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

  it("mostra o percentual do checklist offline quando o projeto está na fase Offline", () => {
    render(
      <ProjectCard
        projeto={{
          ...projeto,
          checklistOffline: { hardware: true, logicaFcFb: true, ihm: false, seguranca: false },
        }}
        itensOffline={itensOffline}
      />
    );
    expect(screen.getByText("50% · 2/4 itens")).toBeInTheDocument();
  });

  it("mostra o percentual manual de montagem quando o projeto está na fase Montagem", () => {
    render(<ProjectCard projeto={{ ...projeto, statusAtual: "Montagem", percentualMontagem: 60 }} />);
    expect(screen.getByText("60% montagem")).toBeInTheDocument();
  });

  it("mostra o percentual do checklist online quando o projeto está na fase Online", () => {
    render(
      <ProjectCard
        projeto={{
          ...projeto,
          statusAtual: "Online",
          checklistOnline: {
            testesIO: true,
            ajusteParametros: true,
            testesFuncionais: true,
            liberacao: false,
          },
        }}
        itensOnline={itensOnline}
      />
    );
    expect(screen.getByText("75% · 3/4 itens")).toBeInTheDocument();
  });

  it("não mostra percentual quando o projeto não está em Offline, Montagem nem Online", () => {
    render(<ProjectCard projeto={{ ...projeto, statusAtual: "Esquema_Eletrico" }} />);
    expect(screen.queryByText(/%\s·|% montagem/)).not.toBeInTheDocument();
  });

  it("mostra 0% quando está em Offline mas nenhum item está configurado ainda", () => {
    render(<ProjectCard projeto={projeto} itensOffline={[]} />);
    expect(screen.queryByText(/%\s·|% montagem/)).not.toBeInTheDocument();
  });

  it("mostra indicador OK em Tryout quando não há pendência em aberto", () => {
    render(<ProjectCard projeto={{ ...projeto, statusAtual: "Tryout" }} pendenciasAbertas={0} />);
    expect(screen.getByText("OK")).toBeInTheDocument();
  });

  it("mostra a contagem de pendências em aberto em Entregue", () => {
    render(<ProjectCard projeto={{ ...projeto, statusAtual: "Entregue" }} pendenciasAbertas={2} />);
    expect(screen.getByText("2 pendências")).toBeInTheDocument();
  });

  it("mostra singular quando há só 1 pendência em aberto", () => {
    render(<ProjectCard projeto={{ ...projeto, statusAtual: "Tryout" }} pendenciasAbertas={1} />);
    expect(screen.getByText("1 pendência")).toBeInTheDocument();
  });

  it("não mostra indicador de pendências fora de Tryout/Entregue", () => {
    render(<ProjectCard projeto={{ ...projeto, statusAtual: "Montagem" }} pendenciasAbertas={3} />);
    expect(screen.queryByText(/pendência/)).not.toBeInTheDocument();
  });

  it("mostra o indicador de observação quando o projeto tem observações preenchidas", () => {
    render(<ProjectCard projeto={{ ...projeto, observacoes: "Cliente pediu ajuste no prazo." }} />);
    expect(screen.getByRole("img", { name: "Possui observação" })).toBeInTheDocument();
  });

  it("não mostra o indicador de observação quando observações é null ou só espaço", () => {
    const { rerender } = render(<ProjectCard projeto={{ ...projeto, observacoes: null }} />);
    expect(screen.queryByRole("img", { name: "Possui observação" })).not.toBeInTheDocument();

    rerender(<ProjectCard projeto={{ ...projeto, observacoes: "   " }} />);
    expect(screen.queryByRole("img", { name: "Possui observação" })).not.toBeInTheDocument();
  });
});
