import { StatusProjeto } from "@/types/projeto";

// Classes Tailwind para as cores semânticas de estágio (tokens --status-* do
// globals.css). Substitui o antigo CORES_CRITICIDADE (border-t-red-500 etc.)
// — usado no ponto do cabeçalho da coluna, no badge do header do drawer e no
// ponto/barra da tela de Configurações e da Visão geral.
interface StatusVisual {
  /** bg-status-* — ponto sólido e barra proporcional (fluxo por estágio). */
  cor: string;
  /** bg-status-* a 12% — fundo do badge de estágio no header do drawer. */
  badgeBg: string;
  /** text-status-*-foreground — texto do badge, com contraste sobre o fundo tintado. */
  badgeText: string;
}

export const STATUS_VISUAL: Record<StatusProjeto, StatusVisual> = {
  Esquema_Eletrico: {
    cor: "bg-status-esquema",
    badgeBg: "bg-status-esquema/12",
    badgeText: "text-status-esquema-foreground",
  },
  Offline: {
    cor: "bg-status-offline",
    badgeBg: "bg-status-offline/12",
    badgeText: "text-status-offline-foreground",
  },
  Montagem: {
    cor: "bg-status-montagem",
    badgeBg: "bg-status-montagem/12",
    badgeText: "text-status-montagem-foreground",
  },
  Online: {
    cor: "bg-status-online",
    badgeBg: "bg-status-online/12",
    badgeText: "text-status-online-foreground",
  },
  Tryout: {
    cor: "bg-status-tryout",
    badgeBg: "bg-status-tryout/12",
    badgeText: "text-status-tryout-foreground",
  },
  Entregue: {
    cor: "bg-status-entregue",
    badgeBg: "bg-status-entregue/12",
    badgeText: "text-status-entregue-foreground",
  },
};
