"use client";

import { Suspense, useState } from "react";
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
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded-lg border p-6">
        <div className="space-y-1 text-center">
          <h1 className="text-lg font-semibold">Bruno Mourão - Gestão de Projeto</h1>
          <p className="text-sm text-muted-foreground">Acesso restrito — informe a senha.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="senha">Senha</Label>
          <Input
            id="senha"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoFocus
          />
        </div>
        <Button type="submit" className="w-full" disabled={entrando || !senha}>
          {entrando ? "Entrando..." : "Entrar"}
        </Button>
        {erro && <p className="text-center text-sm text-destructive">{erro}</p>}
      </form>
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
