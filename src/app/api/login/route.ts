import { NextResponse } from "next/server";
import { getDb } from "@/db";
import {
  COOKIE_SESSAO,
  criarSessao,
  limiteLoginExcedido,
  obterIp,
  registrarTentativaLogin,
  senhaCorreta,
} from "@/lib/auth";
import { erroResponse } from "@/lib/api-error";

const UM_MES_EM_SEGUNDOS = 60 * 60 * 24 * 30;

// POST /api/login — valida a senha única compartilhada (ver HU-21) e, se
// correta, cria uma sessão nova (token aleatório, ver src/lib/auth.ts) e
// seta o cookie que o proxy passa a exigir. Limita tentativas por IP pra
// dificultar força bruta contra a senha compartilhada.
export async function POST(request: Request) {
  const db = getDb();
  const ip = obterIp(request);

  if (await limiteLoginExcedido(db, ip)) {
    return erroResponse(429, "MUITAS_TENTATIVAS", "Muitas tentativas de login. Tente novamente em alguns minutos.");
  }

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
    await registrarTentativaLogin(db, ip);
    return erroResponse(401, "SENHA_INCORRETA", "Senha incorreta.");
  }

  const token = await criarSessao(db);
  const resposta = NextResponse.json({ ok: true });
  resposta.cookies.set(COOKIE_SESSAO, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: UM_MES_EM_SEGUNDOS,
  });
  return resposta;
}
