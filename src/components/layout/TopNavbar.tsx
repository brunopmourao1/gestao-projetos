"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NovoProjetoDialog, DadosNovoProjeto } from "@/components/board/NovoProjetoDialog";
import { ResultadoMover } from "@/components/board/ProjectCard";

// Ver Docs/02-Tecnico/Matriz-Componentes.md, seção 1
interface TopNavbarProps {
  numeroAtivo: string | null;
  onExportarRelatorio: () => void;
  exportando: boolean;
  erroExportacao: string | null;
  busca: string;
  onBuscaChange: (valor: string) => void;
  onCriarProjeto: (dados: DadosNovoProjeto) => Promise<ResultadoMover>;
}

export function TopNavbar({
  numeroAtivo,
  onExportarRelatorio,
  exportando,
  erroExportacao,
  busca,
  onBuscaChange,
  onCriarProjeto,
}: TopNavbarProps) {
  const router = useRouter();

  async function handleSair() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b px-4">
      <div className="flex items-center gap-2">
        <Image src="/Logomarca LS.jpg" alt="LS Control" width={36} height={36} className="rounded" />
        <h1 className="text-lg font-semibold">Bruno Mourão - Gestão de Projeto</h1>
      </div>
      <Input
        placeholder="Buscar máquina..."
        className="max-w-xs"
        value={busca}
        onChange={(e) => onBuscaChange(e.target.value)}
      />
      <NovoProjetoDialog onCriar={onCriarProjeto} />
      <div className="relative ml-auto flex items-center gap-2">
        <Link href="/configuracoes/checklist">
          <Button variant="outline" size="icon" title="Configurações dos checklists">
            <Settings className="h-4 w-4" />
          </Button>
        </Link>
        <Button variant="outline" size="icon" title="Sair" onClick={handleSair}>
          <LogOut className="h-4 w-4" />
        </Button>
        <Button
          disabled={!numeroAtivo || exportando}
          onClick={onExportarRelatorio}
        >
          {exportando ? "Exportando..." : "Exportar relatório"}
        </Button>
        {erroExportacao && (
          <p className="absolute top-full right-0 mt-1 whitespace-nowrap text-xs text-destructive">
            {erroExportacao}
          </p>
        )}
      </div>
    </header>
  );
}
