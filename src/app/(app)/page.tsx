import { headers } from "next/headers";
import { DashboardClient, DashboardPayload } from "@/components/dashboard/DashboardClient";

type ResultadoBusca = { ok: true; dados: DashboardPayload } | { ok: false };

async function buscarDashboard(): Promise<ResultadoBusca> {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const protocolo = h.get("x-forwarded-proto") ?? "http";
  const cookie = h.get("cookie") ?? "";
  try {
    const resposta = await fetch(`${protocolo}://${host}/api/dashboard`, {
      cache: "no-store",
      headers: { cookie },
    });
    if (!resposta.ok) return { ok: false };
    return { ok: true, dados: await resposta.json() };
  } catch {
    return { ok: false };
  }
}

export default async function VisaoGeralPage() {
  const resultado = await buscarDashboard();
  return (
    <DashboardClient
      dadosIniciais={resultado.ok ? resultado.dados : null}
      erroCarregamento={!resultado.ok}
    />
  );
}
