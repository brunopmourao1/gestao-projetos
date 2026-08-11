import { headers } from "next/headers";
import { BoardClient } from "@/components/board/BoardClient";
import { Projeto } from "@/types/projeto";

async function buscarProjetos(): Promise<Projeto[]> {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const protocolo = h.get("x-forwarded-proto") ?? "http";
  // Repassa o cookie de sessão — a rota /api/projetos está atrás do proxy de
  // autenticação (ver src/proxy.ts), sem o cookie ela responde 401.
  const cookie = h.get("cookie") ?? "";
  const resposta = await fetch(`${protocolo}://${host}/api/projetos`, {
    cache: "no-store",
    headers: { cookie },
  });
  if (!resposta.ok) return [];
  return resposta.json();
}

export default async function Home() {
  const projetos = await buscarProjetos();
  return <BoardClient projetosIniciais={projetos} />;
}
