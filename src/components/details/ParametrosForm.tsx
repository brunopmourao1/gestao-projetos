"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { EspecificacoesTecnicas, ProjetoDetalhado } from "@/types/projeto";

interface ParametrosFormProps {
  projeto: ProjetoDetalhado;
  onSalvo: (espec: EspecificacoesTecnicas) => void;
}

export function ParametrosForm({ projeto, onSalvo }: ParametrosFormProps) {
  const espec = projeto.especificacoesTecnicas;

  const [linkEsquemaEletrico, setLinkEsquemaEletrico] = useState(espec?.linkEsquemaEletrico ?? "");
  const [rpm, setRpm] = useState(espec?.dadosMotores?.rpm?.toString() ?? "");
  const [fatorReducao, setFatorReducao] = useState(espec?.dadosMotores?.fatorReducao?.toString() ?? "");
  const [diametroEngrenagem, setDiametroEngrenagem] = useState(
    espec?.dadosMotores?.diametroEngrenagem?.toString() ?? ""
  );
  const [partNumbers, setPartNumbers] = useState<string[]>(espec?.dadosSensores?.partNumbers ?? []);
  const [novoPartNumber, setNovoPartNumber] = useState("");
  const [calibragemTexto, setCalibragemTexto] = useState(
    JSON.stringify(espec?.dadosSensores?.calibragem ?? {}, null, 2)
  );

  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  function adicionarPartNumber() {
    const valor = novoPartNumber.trim();
    if (!valor) return;
    setPartNumbers((atual) => [...atual, valor]);
    setNovoPartNumber("");
  }

  function removerPartNumber(indice: number) {
    setPartNumbers((atual) => atual.filter((_, i) => i !== indice));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSucesso(false);

    const body: Record<string, unknown> = {
      link_esquema_eletrico: linkEsquemaEletrico.trim() || null,
    };

    const motoresPreenchido = rpm !== "" || fatorReducao !== "" || diametroEngrenagem !== "";
    if (motoresPreenchido) {
      const rpmNum = Number(rpm);
      const fatorReducaoNum = Number(fatorReducao);
      const diametroEngrenagemNum = Number(diametroEngrenagem);
      if (
        rpm === "" ||
        fatorReducao === "" ||
        diametroEngrenagem === "" ||
        Number.isNaN(rpmNum) ||
        Number.isNaN(fatorReducaoNum) ||
        Number.isNaN(diametroEngrenagemNum)
      ) {
        setErro("Preencha RPM, fator de redução e diâmetro da engrenagem com números válidos, ou deixe os três em branco.");
        return;
      }
      body.dados_motores = {
        rpm: rpmNum,
        fator_reducao: fatorReducaoNum,
        diametro_engrenagem: diametroEngrenagemNum,
      };
    }

    const calibragemNormalizada = calibragemTexto.trim();
    const sensoresPreenchido = partNumbers.length > 0 || (calibragemNormalizada !== "" && calibragemNormalizada !== "{}");
    if (sensoresPreenchido) {
      let calibragemObj: Record<string, unknown> = {};
      try {
        calibragemObj = calibragemNormalizada ? JSON.parse(calibragemNormalizada) : {};
      } catch {
        setErro("Calibragem inválida: o texto precisa ser um JSON válido, ex: {\"offset\": 0.5}.");
        return;
      }
      body.dados_sensores = { part_numbers: partNumbers, calibragem: calibragemObj };
    }

    setSalvando(true);
    try {
      const resposta = await fetch(`/api/projetos/${projeto.idProjeto}/especificacoes`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const dados = await resposta.json();
      if (!resposta.ok) {
        const camposInvalidos = dados?.erro?.camposInvalidos as string[] | undefined;
        setErro(
          camposInvalidos?.length
            ? `${dados.erro.mensagem} (${camposInvalidos.join(", ")})`
            : dados?.erro?.mensagem ?? "Não foi possível salvar os parâmetros."
        );
        return;
      }
      onSalvo(dados as EspecificacoesTecnicas);
      setSucesso(true);
    } catch {
      setErro("Falha de rede ao salvar os parâmetros.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Dados de Motores</h3>
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <Label htmlFor="rpm">RPM</Label>
            <Input id="rpm" type="number" value={rpm} onChange={(e) => setRpm(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="fator-reducao">Fator de Redução</Label>
            <Input
              id="fator-reducao"
              type="number"
              step="any"
              value={fatorReducao}
              onChange={(e) => setFatorReducao(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="diametro-engrenagem">Diâmetro da Engrenagem</Label>
            <Input
              id="diametro-engrenagem"
              type="number"
              step="any"
              value={diametroEngrenagem}
              onChange={(e) => setDiametroEngrenagem(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Dados de Sensores</h3>
        <div className="space-y-1">
          <Label htmlFor="novo-part-number">Part Numbers</Label>
          <div className="flex gap-2">
            <Input
              id="novo-part-number"
              value={novoPartNumber}
              onChange={(e) => setNovoPartNumber(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  adicionarPartNumber();
                }
              }}
              placeholder="ex: PN-001"
            />
            <Button type="button" variant="secondary" onClick={adicionarPartNumber}>
              Adicionar
            </Button>
          </div>
          {partNumbers.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {partNumbers.map((pn, indice) => (
                <Badge key={`${pn}-${indice}`} variant="secondary" className="gap-1">
                  {pn}
                  <button
                    type="button"
                    onClick={() => removerPartNumber(indice)}
                    aria-label={`Remover ${pn}`}
                    className="ml-0.5"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="calibragem">Calibragem (JSON)</Label>
          <Textarea
            id="calibragem"
            value={calibragemTexto}
            onChange={(e) => setCalibragemTexto(e.target.value)}
            rows={4}
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="link-esquema">Link do Esquema Elétrico</Label>
        <Input
          id="link-esquema"
          type="url"
          value={linkEsquemaEletrico}
          onChange={(e) => setLinkEsquemaEletrico(e.target.value)}
          placeholder="https://..."
        />
      </div>

      <div className="space-y-2">
        <Button type="submit" disabled={salvando}>
          {salvando ? "Salvando..." : "Salvar Parâmetros"}
        </Button>
        {erro && <p className="text-sm text-destructive">{erro}</p>}
        {sucesso && !erro && <p className="text-sm text-emerald-600">Salvo com sucesso.</p>}
      </div>
    </form>
  );
}
