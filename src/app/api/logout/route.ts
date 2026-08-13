import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { COOKIE_SESSAO, revogarSessao } from "@/lib/auth";

// POST /api/logout — revoga a sessão no banco (não só limpa o cookie local),
// então o mesmo token não pode ser reaproveitado se tiver vazado.
export async function POST(request: NextRequest) {
  const token = request.cookies.get(COOKIE_SESSAO)?.value;
  await revogarSessao(getDb(), token);

  const resposta = NextResponse.json({ ok: true });
  resposta.cookies.delete(COOKIE_SESSAO);
  return resposta;
}
