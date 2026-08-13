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
const ROTAS_PUBLICAS = ["/login", "/api/login"];

function rotaPublica(pathname: string): boolean {
  return ROTAS_PUBLICAS.some((rota) => pathname === rota);
}

// CSP com nonce novo a cada request (ver
// node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md).
// Só dá pra gerar aqui, não em next.config.ts — o App Router injeta os dados
// de RSC via <script> inline por página, e sem o nonce certo no header o
// browser bloqueia esse script silenciosamente (quebra a hidratação; foi
// exatamente isso que causou "Minified React error #412: Connection closed"
// quando a CSP inicial só tinha script-src 'self' sem nonce/unsafe-inline).
// Exige renderização dinâmica em toda página — já é o caso aqui, porque tanto
// o layout raiz quanto o do grupo (app) chamam cookies() pro tema.
function construirCsp(nonce: string): string {
  const isDev = process.env.NODE_ENV === "development";
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

export async function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = construirCsp(nonce);

  if (!rotaPublica(request.nextUrl.pathname)) {
    const cookieSessao = request.cookies.get(COOKIE_SESSAO)?.value;
    const sessaoOk = await sessaoValida(getDb(), cookieSessao);

    if (!sessaoOk) {
      const resposta = request.nextUrl.pathname.startsWith("/api/")
        ? NextResponse.json({ erro: { codigo: "NAO_AUTENTICADO", mensagem: "Login necessário." } }, { status: 401 })
        : NextResponse.redirect(
            (() => {
              const url = request.nextUrl.clone();
              url.pathname = "/login";
              url.searchParams.set("redirect", request.nextUrl.pathname);
              return url;
            })()
          );
      resposta.headers.set("Content-Security-Policy", csp);
      return resposta;
    }
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const resposta = NextResponse.next({ request: { headers: requestHeaders } });
  resposta.headers.set("Content-Security-Policy", csp);
  return resposta;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|png|svg|ico|gif|webp)$).*)",
  ],
};
