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
    <div className="space-y-3 py-2">
      <div className="space-y-1">
        <Label htmlFor="numero">Número</Label>
        <Input
          id="numero"
          value={numero}
          onChange={(e) => onNumeroChange(e.target.value)}
          placeholder="ex: OS 1800"
          autoFocus
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="nome-maquina">Nome da Máquina (opcional)</Label>
        <Input
          id="nome-maquina"
          value={nomeMaquina}
          onChange={(e) => onNomeMaquinaChange(e.target.value)}
          placeholder="ex: Solda US - TF - Furação e Solda US"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="descricao">Descrição (opcional)</Label>
        <Textarea
          id="descricao"
          value={descricao}
          onChange={(e) => onDescricaoChange(e.target.value)}
          rows={3}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="data-prevista">Data Prevista de Conclusão (opcional)</Label>
        <Input
          id="data-prevista"
          type="date"
          value={dataPrevistaConclusao}
          onChange={(e) => onDataPrevistaConclusaoChange(e.target.value)}
        />
      </div>
      {erro && <p className="text-sm text-destructive">{erro}</p>}
    </div>
  );
}
