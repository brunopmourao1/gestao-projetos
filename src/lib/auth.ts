// Login simples de senha única compartilhada (sem contas individuais) — ver
// HU-21. Usa Web Crypto (`crypto.subtle`), disponível tanto no middleware
// (Edge) quanto em route handlers (Node), sem depender de nenhuma lib nova.

export const COOKIE_SESSAO = "sessao";

async function sha256Hex(texto: string): Promise<string> {
  const dados = new TextEncoder().encode(texto);
  const hash = await crypto.subtle.digest("SHA-256", dados);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Valor do cookie de sessão quando a senha está correta — só quem já sabe
// APP_PASSWORD (variável de ambiente, nunca exposta ao client) consegue
// calcular esse hash, então funciona como um token de sessão simples.
export async function tokenEsperado(): Promise<string | null> {
  const senha = process.env.APP_PASSWORD;
  if (!senha) return null;
  return sha256Hex(senha);
}

export async function senhaCorreta(senhaInformada: string): Promise<boolean> {
  const senha = process.env.APP_PASSWORD;
  if (!senha) return false;
  return senhaInformada === senha;
}
