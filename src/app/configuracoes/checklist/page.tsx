import Link from "next/link";
import { ChecklistConfigManager } from "@/components/configuracoes/ChecklistConfigManager";

export default function ConfiguracoesChecklistPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-4 p-6">
      <div className="flex items-center gap-2">
        <Link href="/" className="text-sm text-muted-foreground hover:underline">
          ← Voltar pro board
        </Link>
      </div>
      <div>
        <h1 className="text-xl font-semibold">Configurações — Checklists</h1>
        <p className="text-sm text-muted-foreground">
          Adicione, edite ou exclua os itens dos checklists de Offline e Online. A porcentagem de
          cada item é sempre dividida igualmente pelo número de itens da fase.
        </p>
      </div>
      <ChecklistConfigManager />
    </div>
  );
}
