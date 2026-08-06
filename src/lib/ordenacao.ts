const GAP = 1000;

// Fractional indexing: inserir um card entre dois outros é a média dos dois
// vizinhos, sem precisar reescrever a coluna inteira a cada reordenação.
// ordensExistentes deve estar ordenada ascendente (menor = mais crítico/topo).
export function calcularOrdem(ordensExistentes: number[], indiceDestino: number): number {
  if (ordensExistentes.length === 0) return GAP;
  if (indiceDestino <= 0) return ordensExistentes[0] - GAP;
  if (indiceDestino >= ordensExistentes.length) {
    return ordensExistentes[ordensExistentes.length - 1] + GAP;
  }
  return (ordensExistentes[indiceDestino - 1] + ordensExistentes[indiceDestino]) / 2;
}
