"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Kanban, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import type { Tema } from "@/lib/tema";

interface SidebarProps {
  temaInicial: Tema;
}

const ITENS_NAV = [
  { href: "/", label: "Visão geral", Icon: LayoutDashboard },
  { href: "/board", label: "Board", Icon: Kanban },
  { href: "/configuracoes/checklist", label: "Configurações", Icon: Settings },
];

// Navegação principal — substitui a TopNavbar antiga. Largura 188px em
// desktop (≥1024, reduzida de 216px pra sobrar mais espaço horizontal pro
// board sem scroll); colapsa pra rail de ícones em telas menores (ver
// README, seção Responsivo).
export function Sidebar({ temaInicial }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  function ativo(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  async function handleSair() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex w-14 shrink-0 flex-col gap-1 border-r border-border px-2 py-4 lg:w-[188px] lg:px-2.5">
      <div className="flex flex-col items-center gap-1.5 px-1 pb-4">
        <div className="hidden h-11 w-full max-w-[140px] lg:block">
          <Image
            src="/logomarca-ls.png"
            alt="LS Control"
            width={160}
            height={44}
            className="h-full w-full rounded-[5px] object-contain dark:hidden"
            priority
          />
          <Image
            src="/logomarca-ls-dark.webp"
            alt="LS Control"
            width={160}
            height={44}
            className="hidden h-full w-full rounded-[5px] object-contain dark:block"
            priority
          />
        </div>
        <div className="lg:hidden">
          <Image
            src="/logomarca-ls.png"
            alt="LS Control"
            width={28}
            height={28}
            className="h-7 w-7 rounded object-contain dark:hidden"
            priority
          />
          <Image
            src="/logomarca-ls-dark.webp"
            alt="LS Control"
            width={28}
            height={28}
            className="hidden h-7 w-7 rounded object-contain dark:block"
            priority
          />
        </div>
        <span className="hidden text-center text-[11px] text-muted-foreground lg:block">
          Gestão de Projetos
        </span>
      </div>

      {ITENS_NAV.map(({ href, label, Icon }) => (
        <Link
          key={href}
          href={href}
          aria-label={label}
          title={label}
          className={cn(
            "flex h-8 items-center justify-center gap-2 rounded-md px-0 text-[13px] font-medium lg:justify-start lg:px-2.5",
            ativo(href) ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted"
          )}
        >
          <Icon className="size-4 shrink-0" aria-hidden="true" />
          <span className="hidden lg:inline">{label}</span>
        </Link>
      ))}

      <div className="mt-auto flex flex-col gap-2.5">
        <div className="hidden lg:block">
          <ThemeToggle temaInicial={temaInicial} />
        </div>
        <div className="flex flex-col items-center gap-2 lg:flex-row lg:items-center lg:justify-between lg:px-1">
          <div className="flex items-center gap-2">
            <div
              className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-accent-foreground"
              title="Bruno Mourão"
            >
              BM
            </div>
            <span className="hidden text-[12.5px] font-medium lg:inline">Bruno Mourão</span>
          </div>
          <button
            type="button"
            aria-label="Sair"
            title="Sair"
            onClick={handleSair}
            className="rounded px-1.5 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <span className="lg:hidden">⏻</span>
            <span className="hidden lg:inline">Sair</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
