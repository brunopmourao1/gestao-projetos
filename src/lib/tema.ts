// Tema claro/escuro — persistido em cookie (lido no server pra evitar FOUC)
// e espelhado em localStorage. Ver README do redesign, Passo 2 (Sidebar).

export const TEMA_COOKIE = "tema";

export type Tema = "claro" | "escuro";

export function temaValido(valor: string | undefined): valor is Tema {
  return valor === "claro" || valor === "escuro";
}
