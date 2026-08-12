"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [senha, setSenha] = useState("");
  const [entrando, setEntrando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEntrando(true);
    setErro(null);
    try {
      const resposta = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senha }),
      });
      if (!resposta.ok) {
        const dados = await resposta.json();
        setErro(dados?.erro?.mensagem ?? "Não foi possível entrar.");
        return;
      }
      router.push(searchParams.get("redirect") || "/");
      router.refresh();
    } catch {
      setErro("Falha de rede ao entrar.");
    } finally {
      setEntrando(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="flex w-[360px] max-w-full flex-col gap-6">
        <div className="flex flex-col items-center gap-3">
          <div className="h-14 w-full max-w-[180px]">
            <Image
              src="/logomarca-ls.png"
              alt="LS Control"
              width={140}
              height={56}
              className="h-full w-full rounded object-contain dark:hidden"
              priority
            />
            <Image
              src="/logomarca-ls-dark.webp"
              alt="LS Control"
              width={140}
              height={56}
              className="hidden h-full w-full rounded object-contain dark:block"
              priority
            />
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold tracking-[-0.01em]">Gestão de Projetos</div>
            <div className="mt-0.5 text-[13px] text-muted-foreground">
              Acesso restrito — informe a senha da equipe.
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3.5 rounded-xl border border-border bg-card p-6 shadow-sm"
        >
          <div className="flex flex-col items-center gap-1.5">
            <Label
              htmlFor="senha"
              className="text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground"
            >
              Senha
            </Label>
            <Input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              className="h-[38px] rounded-md text-center text-sm"
              autoFocus
            />
          </div>
          <Button type="submit" className="h-[38px] w-full text-sm" disabled={entrando || !senha}>
            {entrando ? "Entrando..." : "Entrar"}
          </Button>
          {erro && <p className="text-center text-sm text-destructive-foreground">{erro}</p>}
        </form>

        <div className="text-center text-xs text-muted-foreground">
          LS Control · Automação e solda em termoplástico
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
