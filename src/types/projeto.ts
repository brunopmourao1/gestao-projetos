// Tipos espelhando Docs/02-Tecnico/Especificacao-API.md e Modelo-Dados-ER.md

export type StatusProjeto =
  | "Esquema_Eletrico"
  | "Offline"
  | "Montagem"
  | "Online"
  | "Concluido";

export interface ChecklistOffline {
  hardware: boolean;
  logicaFcFb: boolean;
  ihm: boolean;
  seguranca: boolean;
}

export const ITENS_CHECKLIST_OFFLINE: { chave: keyof ChecklistOffline; rotulo: string }[] = [
  { chave: "hardware", rotulo: "Hardware" },
  { chave: "logicaFcFb", rotulo: "Lógica (FC's e FB's)" },
  { chave: "ihm", rotulo: "IHM" },
  { chave: "seguranca", rotulo: "Segurança (PLC de segurança)" },
];

export interface Projeto {
  idProjeto: string;
  numero: string;
  nomeMaquina: string | null;
  descricao: string | null;
  ordem: number;
  dataPrevistaConclusao: string | null;
  statusAtual: StatusProjeto;
  dataCriacao: string;
  checklistOffline: ChecklistOffline;
  observacoes: string | null;
  percentualMontagem: number;
}

export interface DadosMotores {
  rpm: number;
  fatorReducao: number;
  diametroEngrenagem: number;
}

export interface DadosSensores {
  partNumbers: string[];
  calibragem: Record<string, unknown>;
}

export interface EspecificacoesTecnicas {
  idEspecificacao: string;
  idProjeto: string;
  linkEsquemaEletrico: string | null;
  dadosMotores: DadosMotores | null;
  dadosSensores: DadosSensores | null;
}

export interface HistoricoTransicao {
  idTransicao: string;
  idProjeto: string;
  colunaOrigem: string;
  colunaDestino: string;
  dataMovimentacao: string;
}

export interface ProjetoDetalhado extends Projeto {
  especificacoesTecnicas: EspecificacoesTecnicas | null;
  historicoTransicoes: HistoricoTransicao[];
}

export interface MetricaTempoEstagio {
  coluna: string;
  tempoPermanenciaHoras: number;
}

export const COLUNAS_FLUXO: { status: StatusProjeto; titulo: string }[] = [
  { status: "Esquema_Eletrico", titulo: "Aguardando Esquema Elétrico" },
  { status: "Offline", titulo: "Projeto Offline" },
  { status: "Montagem", titulo: "Aguardando Montagem" },
  { status: "Online", titulo: "Projeto Online (Comissionamento)" },
  { status: "Concluido", titulo: "Operação Concluída" },
];
