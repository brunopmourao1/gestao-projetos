import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ProjetoFormCamposProps {
  numero: string;
  onNumeroChange: (valor: string) => void;
  nomeMaquina: string;
  onNomeMaquinaChange: (valor: string) => void;
  descricao: string;
  onDescricaoChange: (valor: string) => void;
  dataPrevistaConclusao: string;
  onDataPrevistaConclusaoChange: (valor: string) => void;
  erro: string | null;
}

const CLASSE_LABEL = "text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground";
const CLASSE_INPUT = "h-[34px] rounded-md text-[13px]";

// Campos compartilhados entre NovoProjetoDialog e EditarProjetoDialog.
export function ProjetoFormCampos({
  numero,
  onNumeroChange,
  nomeMaquina,
  onNomeMaquinaChange,
  descricao,
  onDescricaoChange,
  dataPrevistaConclusao,
  onDataPrevistaConclusaoChange,
  erro,
}: ProjetoFormCamposProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="numero" className={CLASSE_LABEL}>
            Número *
          </Label>
          <Input
            id="numero"
            value={numero}
            onChange={(e) => onNumeroChange(e.target.value)}
            placeholder="PRJ-2025-022"
            className={CLASSE_INPUT}
            autoFocus
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="data-prevista" className={CLASSE_LABEL}>
            Data prevista
          </Label>
          <Input
            id="data-prevista"
            type="date"
            value={dataPrevistaConclusao}
            onChange={(e) => onDataPrevistaConclusaoChange(e.target.value)}
            className={`${CLASSE_INPUT} tabular-nums`}
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="nome-maquina" className={CLASSE_LABEL}>
          Nome da máquina
        </Label>
        <Input
          id="nome-maquina"
          value={nomeMaquina}
          onChange={(e) => onNomeMaquinaChange(e.target.value)}
          placeholder="Célula de solda por vibração"
          className={CLASSE_INPUT}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="descricao" className={CLASSE_LABEL}>
          Descrição
        </Label>
        <Textarea
          id="descricao"
          value={descricao}
          onChange={(e) => onDescricaoChange(e.target.value)}
          rows={3}
          placeholder="Escopo, cliente, particularidades…"
          className="rounded-md text-[13px]"
        />
      </div>
      {erro && <p className="text-sm text-destructive-foreground">{erro}</p>}
    </div>
  );
}
