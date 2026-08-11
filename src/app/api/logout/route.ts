import { NextResponse } from "next/server";
import { COOKIE_SESSAO } from "@/lib/auth";

// POST /api/logout — limpa o cookie de sessão.
export async function POST() {
  const resposta = NextResponse.json({ ok: true });
  resposta.cookies.delete(COOKIE_SESSAO);
  return resposta;
}
