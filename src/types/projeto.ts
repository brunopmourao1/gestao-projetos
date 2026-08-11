// Tipos espelhando Docs/02-Tecnico/Especificacao-API.md e Modelo-Dados-ER.md

export type StatusProjeto =
  | "Esquema_Eletrico"
  | "Offline"
  | "Montagem"
  | "Online"
  | "Tryout"
  | "Entregue";

// Mapa chave-do-item -> concluído. Os itens (chaves/rótulos/ordem) são
// configuráveis via tela de Configurações — ver ChecklistItemConfig/HU-20.
export type ChecklistOffline = Record<string, boolean>;
export type ChecklistOnline = Record<string, boolean>;

export type FaseChecklist = "Offline" | "Online";

export interface ChecklistItemConfig {
  idItem: string;
  fase: FaseChecklist;
  chave: string;
  rotulo: string;
  ordem: number;
}

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
  checklistOnline: ChecklistOnline;
}

export interface HistoricoTransicao {
  idTransicao: string;
  idProjeto: string;
  colunaOrigem: string;
  colunaDestino: string;
  dataMovimentacao: string;
}

export interface PendenciaVisita {
  idPendencia: string;
  idProjeto: string;
  data: string;
  texto: string;
  concluida: boolean;
}

export interface ProjetoDetalhado extends Projeto {
  historicoTransicoes: HistoricoTransicao[];
  pendenciasVisitas: PendenciaVisita[];
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
  { status: "Tryout", titulo: "Tryout com o Cliente" },
  { status: "Entregue", titulo: "Máquina Entregue" },
];
