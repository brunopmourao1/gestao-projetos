import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { COOKIE_SESSAO, sessaoValida } from "@/lib/auth";

// Protege o sistema inteiro com a senha única compartilhada (ver HU-21).
// Rotas de página sem sessão válida são redirecionadas pra /login; rotas de
// API sem sessão válida recebem 401 JSON (evita servir HTML pro fetch do client).
// Ver node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md
// — "middleware.ts" foi renomeado pra "proxy.ts"/export "proxy" no Next.js 16.
// Proxy roda em runtime Node.js por padrão a partir do Next 16, então dá pra
// consultar o banco (tabela `sessoes`) direto aqui sem restrição de Edge.
export async function proxy(request: NextRequest) {
  const cookieSessao = request.cookies.get(COOKIE_SESSAO)?.value;

  if (await sessaoValida(getDb(), cookieSessao)) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ erro: { codigo: "NAO_AUTENTICADO", mensagem: "Login necessário." } }, { status: 401 });
  }

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("redirect", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!login|api/login|_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|png|svg|ico|gif|webp)$).*)",
  ],
};
