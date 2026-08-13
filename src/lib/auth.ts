import { randomBytes, timingSafeEqual } from "node:crypto";
import { and, eq, gt, lt, sql } from "drizzle-orm";
import type { getDb } from "@/db";
import { sessoes, tentativasLogin } from "@/db/schema";

// Login simples de senha única compartilhada (sem contas individuais) — ver
// HU-21. A senha em si nunca sai do servidor; o cookie de sessão carrega só
// um token aleatório sem relação matemática com ela, guardado na tabela
// `sessoes` — assim dá pra revogar uma sessão sem afetar as outras nem
// trocar a senha de todo mundo.

export const COOKIE_SESSAO = "sessao";

const TRINTA_DIAS_MS = 30 * 24 * 60 * 60 * 1000;
const JANELA_RATE_LIMIT_MS = 15 * 60 * 1000;
const LIMITE_TENTATIVAS = 5;

type Db = ReturnType<typeof getDb>;

async function sha256(texto: string): Promise<Buffer> {
  const dados = new TextEncoder().encode(texto);
  const hash = await crypto.subtle.digest("SHA-256", dados);
  return Buffer.from(hash);
}

// Comparação em tempo constante (via hash de tamanho fixo + timingSafeEqual)
// pra não vazar, pelo tempo de resposta, quantos caracteres iniciais da
// senha informada batem com a senha real.
export async function senhaCorreta(senhaInformada: string): Promise<boolean> {
  const senha = process.env.APP_PASSWORD;
  if (!senha) return false;
  const [hashInformado, hashReal] = await Promise.all([sha256(senhaInformada), sha256(senha)]);
  return timingSafeEqual(hashInformado, hashReal);
}

// Cria uma sessão nova com token aleatório (256 bits) e devolve o valor pra
// setar no cookie. Aproveita a chamada pra limpar sessões já expiradas.
export async function criarSessao(db: Db): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expiraEm = new Date(Date.now() + TRINTA_DIAS_MS);

  await db.delete(sessoes).where(lt(sessoes.expiraEm, new Date()));
  await db.insert(sessoes).values({ token, expiraEm });

  return token;
}

export async function sessaoValida(db: Db, token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [sessao] = await db
    .select({ token: sessoes.token })
    .from(sessoes)
    .where(and(eq(sessoes.token, token), gt(sessoes.expiraEm, new Date())));
  return sessao !== undefined;
}

export async function revogarSessao(db: Db, token: string | undefined): Promise<void> {
  if (!token) return;
  await db.delete(sessoes).where(eq(sessoes.token, token));
}

// Retorna true se o IP já esgotou as tentativas permitidas na janela atual.
// Também aproveita pra descartar tentativas antigas (fora de qualquer janela).
export async function limiteLoginExcedido(db: Db, ip: string): Promise<boolean> {
  await db.delete(tentativasLogin).where(lt(tentativasLogin.criadaEm, new Date(Date.now() - JANELA_RATE_LIMIT_MS)));

  const [{ total }] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(tentativasLogin)
    .where(eq(tentativasLogin.ip, ip));

  return total >= LIMITE_TENTATIVAS;
}

export async function registrarTentativaLogin(db: Db, ip: string): Promise<void> {
  await db.insert(tentativasLogin).values({ ip });
}

// Extrai o IP do cliente a partir dos headers padrão de proxy (Vercel injeta
// x-forwarded-for). Sem isso disponível, cai num valor fixo — nesse caso o
// rate limit passa a valer globalmente em vez de por IP, ainda assim protege.
export function obterIp(request: Request): string {
  const encaminhado = request.headers.get("x-forwarded-for");
  if (encaminhado) return encaminhado.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "desconhecido";
}
