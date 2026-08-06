import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Projeto, StatusProjeto } from "@/types/projeto";

export type ResultadoMover = { ok: true } | { ok: false; mensagem: string };

// Ver Docs/02-Tecnico/Matriz-Componentes.md, seção 2
interface ProjectCardProps {
  projeto: Projeto;
  responsavel?: string;
  tecnologias?: string[];
  onClick?: (projeto: Projeto) => void;
  statusAnterior?: StatusProjeto;
  statusProxima?: StatusProjeto;
  onMoverProjeto?: (projeto: Projeto, novoStatus: StatusProjeto) => Promise<ResultadoMover>;
}

export function ProjectCard({
  projeto,
  responsavel,
  tecnologias = [],
  onClick,
  statusAnterior,
  statusProxima,
  onMoverProjeto,
}: ProjectCardProps) {
  const [movendo, setMovendo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function mover(novoStatus: StatusProjeto, e: React.MouseEvent) {
    e.stopPropagation();
    if (!onMoverProjeto || movendo) return;
    setMovendo(true);
    setErro(null);
    const resultado = await onMoverProjeto(projeto, novoStatus);
    if (!resultado.ok) setErro(resultado.mensagem);
    setMovendo(false);
  }

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
      {onMoverProjeto && (
        <CardFooter className="flex flex-col items-stretch gap-1">
          <div className="flex items-center justify-between">
            {statusAnterior ? (
              <Button
                type="button"
                size="xs"
                variant="ghost"
                disabled={movendo}
                onClick={(e) => mover(statusAnterior, e)}
              >
                ← Voltar
              </Button>
            ) : (
              <span />
            )}
            {statusProxima && (
              <Button
                type="button"
                size="xs"
                variant="ghost"
                disabled={movendo}
                onClick={(e) => mover(statusProxima, e)}
              >
                Avançar →
              </Button>
            )}
          </div>
          {erro && <p className="text-xs text-destructive">{erro}</p>}
        </CardFooter>
      )}
    </Card>
  );
}
