import { NextResponse } from "next/server";
import { COOKIE_SESSAO, senhaCorreta, tokenEsperado } from "@/lib/auth";
import { erroResponse } from "@/lib/api-error";

const UM_MES_EM_SEGUNDOS = 60 * 60 * 24 * 30;

// POST /api/login — valida a senha única compartilhada (ver HU-21) e, se
// correta, seta o cookie de sessão que o middleware passa a exigir.
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return erroResponse(400, "VALIDACAO_CAMPO", "Corpo da requisição inválido (JSON esperado).");
  }

  const senha = (body as Record<string, unknown>)?.senha;
  if (typeof senha !== "string") {
    return erroResponse(400, "VALIDACAO_CAMPO", "Campo senha é obrigatório.");
  }

  if (!(await senhaCorreta(senha))) {
    return erroResponse(401, "SENHA_INCORRETA", "Senha incorreta.");
  }

  const token = await tokenEsperado();
  const resposta = NextResponse.json({ ok: true });
  resposta.cookies.set(COOKIE_SESSAO, token as string, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: UM_MES_EM_SEGUNDOS,
  });
  return resposta;
}
