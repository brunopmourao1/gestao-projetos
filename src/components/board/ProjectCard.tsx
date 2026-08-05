import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Projeto } from "@/types/projeto";

// Ver Docs/02-Tecnico/Matriz-Componentes.md, seção 2
interface ProjectCardProps {
  projeto: Projeto;
  responsavel?: string;
  tecnologias?: string[];
  onClick?: (projeto: Projeto) => void;
}

export function ProjectCard({ projeto, responsavel, tecnologias = [], onClick }: ProjectCardProps) {
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => onClick?.(projeto)}
      className="cursor-pointer transition-shadow hover:shadow-md"
    >
      <CardHeader>
        <CardTitle className="text-sm font-medium">{projeto.nomeMaquina}</CardTitle>
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
  );
}
