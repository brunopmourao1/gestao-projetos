import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Projeto } from "@/types/projeto";
import { estaAtrasado, formatarData } from "@/lib/prazo";
import { percentualChecklistOffline } from "@/lib/checklist-offline";

export type ResultadoMover = { ok: true } | { ok: false; mensagem: string };

// Ver Docs/02-Tecnico/Matriz-Componentes.md, seção 2
interface ProjectCardProps {
  projeto: Projeto;
  responsavel?: string;
  tecnologias?: string[];
  onClick?: (projeto: Projeto) => void;
}

export function ProjectCard({ projeto, responsavel, tecnologias = [], onClick }: ProjectCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: projeto.idProjeto,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const atrasado = estaAtrasado(projeto.dataPrevistaConclusao);
  const percentualOffline =
    projeto.statusAtual === "Offline" ? percentualChecklistOffline(projeto.checklistOffline) : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick?.(projeto)}
      className="cursor-grab active:cursor-grabbing"
    >
      <Card className={`transition-shadow hover:shadow-md ${atrasado ? "border-destructive" : ""}`}>
        <CardHeader>
          <CardTitle className="text-sm font-medium">{projeto.numero}</CardTitle>
          {projeto.nomeMaquina && (
            <p className="text-xs text-muted-foreground">{projeto.nomeMaquina}</p>
          )}
          {projeto.dataPrevistaConclusao && (
            <p className={`text-xs ${atrasado ? "font-medium text-destructive" : "text-muted-foreground"}`}>
              Prazo: {formatarData(projeto.dataPrevistaConclusao)}
            </p>
          )}
          {percentualOffline !== null && (
            <div className="space-y-0.5 pt-1">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${percentualOffline === 100 ? "bg-emerald-500" : "bg-primary"}`}
                  style={{ width: `${percentualOffline}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {percentualOffline}% concluído ({percentualOffline / 25}/4)
              </p>
            </div>
          )}
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            {tecnologias.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
          {responsavel && (
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">
                {responsavel.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
