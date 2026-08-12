import { cookies } from "next/headers";
import { Sidebar } from "@/components/layout/Sidebar";
import { TEMA_COOKIE, temaValido } from "@/lib/tema";

// Casca compartilhada por "/", "/board" e "/configuracoes/checklist"
// (sidebar de navegação). "/login" fica fora deste grupo de rotas.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const temaCookie = cookieStore.get(TEMA_COOKIE)?.value;
  const temaInicial = temaValido(temaCookie) ? temaCookie : "claro";

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar temaInicial={temaInicial} />
      <main className="flex min-w-0 flex-1 flex-col">{children}</main>
    </div>
  );
}
