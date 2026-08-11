"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChecklistItemConfig, FaseChecklist } from "@/types/projeto";

const TITULO_FASE: Record<FaseChecklist, string> = {
  Offline: "Checklist da Fase Offline",
  Online: "Checklist da Fase Online",
};

// Tela de configuração dos itens dos checklists de Offline/Online (add,
// editar rótulo, excluir). Percentual de cada item é sempre 100/N (N = itens
// da fase), calculado em src/lib/checklist.ts — nunca armazenado aqui. Ver HU-20.
export function ChecklistConfigManager() {
  const [itens, setItens] = useState<ChecklistItemConfig[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    try {
      const resposta = await fetch("/api/configuracoes/checklist");
      const dados = await resposta.json();
      if (resposta.ok) setItens(dados);
    } catch {
      setErro("Falha de rede ao carregar a configuração.");
    }
  }

  if (itens === null) {
    return <p className="text-sm text-muted-foreground">Carregando...</p>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {erro && <p className="text-sm text-destructive md:col-span-2">{erro}</p>}
      {(["Offline", "Online"] as FaseChecklist[]).map((fase) => (
        <ListaFase
          key={fase}
          fase={fase}
          itens={itens.filter((i) => i.fase === fase).sort((a, b) => a.ordem - b.ordem)}
          onMudou={carregar}
        />
      ))}
    </div>
  );
}

function ListaFase({
  fase,
  itens,
  onMudou,
}: {
  fase: FaseChecklist;
  itens: ChecklistItemConfig[];
  onMudou: () => void;
}) {
  const [novoRotulo, setNovoRotulo] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const percentualPorItem = itens.length > 0 ? Math.round(100 / itens.length) : 0;

  async function handleAdicionar(e: React.FormEvent) {
    e.preventDefault();
    if (!novoRotulo.trim()) return;
    setSalvando(true);
    setErro(null);
    try {
      const resposta = await fetch("/api/configuracoes/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fase, rotulo: novoRotulo.trim() }),
      });
      const dados = await resposta.json();
      if (!resposta.ok) {
        setErro(dados?.erro?.mensagem ?? "Não foi possível adicionar o item.");
        return;
      }
      setNovoRotulo("");
      onMudou();
    } catch {
      setErro("Falha de rede ao adicionar o item.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{TITULO_FASE[fase]}</CardTitle>
        <p className="text-xs text-muted-foreground">
          {itens.length} {itens.length === 1 ? "item" : "itens"} — cada um vale {percentualPorItem}%
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {itens.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum item configurado ainda.</p>
        ) : (
          <ul className="space-y-2">
            {itens.map((item) => (
              <ItemLinha key={item.idItem} item={item} onMudou={onMudou} />
            ))}
          </ul>
        )}
        <form onSubmit={handleAdicionar} className="flex gap-2 pt-2">
          <Input
            value={novoRotulo}
            onChange={(e) => setNovoRotulo(e.target.value)}
            placeholder="Novo item..."
            className="text-sm"
          />
          <Button type="submit" size="sm" disabled={salvando || !novoRotulo.trim()}>
            Adicionar
          </Button>
        </form>
        {erro && <p className="text-sm text-destructive">{erro}</p>}
      </CardContent>
    </Card>
  );
}

function ItemLinha({ item, onMudou }: { item: ChecklistItemConfig; onMudou: () => void }) {
  const [editando, setEditando] = useState(false);
  const [rotulo, setRotulo] = useState(item.rotulo);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSalvarRotulo() {
    if (!rotulo.trim() || rotulo.trim() === item.rotulo) {
      setEditando(false);
      setRotulo(item.rotulo);
      return;
    }
    setSalvando(true);
    setErro(null);
    try {
      const resposta = await fetch(`/api/configuracoes/checklist/${item.idItem}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rotulo: rotulo.trim() }),
      });
      if (!resposta.ok) {
        const dados = await resposta.json();
        setErro(dados?.erro?.mensagem ?? "Não foi possível renomear o item.");
        return;
      }
      setEditando(false);
      onMudou();
    } catch {
      setErro("Falha de rede ao renomear o item.");
    } finally {
      setSalvando(false);
    }
  }

  async function handleExcluir() {
    setSalvando(true);
    setErro(null);
    try {
      const resposta = await fetch(`/api/configuracoes/checklist/${item.idItem}`, { method: "DELETE" });
      if (!resposta.ok) {
        const dados = await resposta.json();
        setErro(dados?.erro?.mensagem ?? "Não foi possível excluir o item.");
        return;
      }
      onMudou();
    } catch {
      setErro("Falha de rede ao excluir o item.");
    } finally {
      setSalvando(false);
      setConfirmandoExclusao(false);
    }
  }

  return (
    <li className="space-y-1">
      <div className="flex items-center gap-2">
        {editando ? (
          <>
            <Input
              value={rotulo}
              onChange={(e) => setRotulo(e.target.value)}
              className="h-8 text-sm"
              autoFocus
            />
            <Button size="sm" variant="outline" disabled={salvando} onClick={handleSalvarRotulo}>
              Salvar
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setEditando(false);
                setRotulo(item.rotulo);
              }}
            >
              Cancelar
            </Button>
          </>
        ) : (
          <>
            <span className="flex-1 text-sm">{item.rotulo}</span>
            <Button size="sm" variant="outline" onClick={() => setEditando(true)}>
              Editar
            </Button>
            {confirmandoExclusao ? (
              <>
                <Button size="sm" variant="destructive" disabled={salvando} onClick={handleExcluir}>
                  Confirmar
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setConfirmandoExclusao(false)}>
                  Cancelar
                </Button>
              </>
            ) : (
              <Button size="sm" variant="destructive" onClick={() => setConfirmandoExclusao(true)}>
                Excluir
              </Button>
            )}
          </>
        )}
      </div>
      {erro && <p className="text-xs text-destructive">{erro}</p>}
    </li>
  );
}
