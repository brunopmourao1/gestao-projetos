# Handoff: Redesign visual — LS Control Gestão de Projetos

## Visão geral
Redesign completo da interface do sistema de gestão de comissionamento (Kanban de projetos de máquinas de solda em termoplástico), elevando o visual de "template shadcn padrão" para nível de produto SaaS profissional (referências: Linear, Vercel Dashboard, Height). Inclui uma tela nova: **Visão geral** (dashboard de métricas).

## Sobre os arquivos de design
Os arquivos em `referencia/` são **protótipos de design em HTML** — mostram aparência e comportamento pretendidos, **não são código de produção**. A tarefa é **recriar fielmente esses designs no codebase Next.js existente** (App Router + TypeScript + Tailwind v4 + shadcn/ui + Drizzle), reaproveitando e customizando os componentes shadcn já instalados.

## Fidelidade
**Alta fidelidade (hifi).** Cores, tipografia, espaçamentos, raios e estados são finais — recriar pixel a pixel usando os padrões do codebase.

## REGRAS OBRIGATÓRIAS (não negociáveis)
1. **Não alterar**: nomes de rotas, props de dados, schema do Drizzle, regras de negócio, endpoints da API, `src/lib/*` (lógica), `src/types/projeto.ts`.
2. **Manter a stack**: Next.js App Router, TypeScript, Tailwind v4, shadcn/ui, dnd-kit. **Não introduzir bibliotecas de UI novas** sem perguntar antes.
3. **Customizar os componentes shadcn existentes** em `src/components/ui/` via tokens — não criar componentes soltos do zero.
4. Todo texto de interface em **português do Brasil**.
5. **Acessibilidade**: contraste mínimo AA, navegação por teclado, `<label>` em todos os campos, `aria-label` em todos os botões de ícone (substituir os `title` atuais), `:focus-visible` com anel de 2px.
6. **Nada de lorem ipsum** — os dados vêm da API real.
7. **Um único acento** (azul-petróleo). Sem gradientes, sem glassmorphism, sem emojis como ícones, sem sombras pesadas.
8. **Tema claro E escuro**, alternável por botão na sidebar (persistir em localStorage/cookie; aplicar classe `dark` no `<html>`).

## Passo 1 — Tokens
Substituir `src/app/globals.css` **na íntegra** pelo arquivo `globals.css` deste pacote. Ele mantém a estrutura Tailwind v4/shadcn atual e adiciona:
- Neutros frios (hue 240–250, chroma 0.003–0.012) — nunca cinza puro.
- `--primary`: azul-petróleo `oklch(0.5 0.1 235)` (claro) / `oklch(0.68 0.1 230)` (escuro).
- Cores de estágio `--status-esquema|offline|montagem|online|tryout|entregue` (mesma luminância/chroma, só o hue varia). **Substituem** os `border-t-red-500` etc. de `CORES_CRITICIDADE` em `KanbanColumn.tsx`.
- `--radius: 0.375rem` (6px): badge 4 / botão-input 6 / card 8 / dialog-sheet 12.
- Sombras `--shadow-xs/sm/md`, foco visível, transições 150ms, `tabular-nums` em tabelas/métricas/datas.
- Copiar `public/logomarca-ls.png` (fundo transparente) para `public/` e usar no lugar de `Logomarca LS.jpg`.

## Passo 2 — Layout global
### Sidebar (nova — substitui a TopNavbar como navegação)
- Largura 216px, borda direita 1px `--border`, padding 16px 12px.
- Topo, **centralizado em coluna**: logo PNG (largura ~160px) e abaixo, centralizado, "Gestão de Projetos" (11px, `--muted-foreground`).
- Itens de navegação: **Visão geral**, **Board**, **Configurações** — botões 32px de altura, radius 6, 13px/500; ativo = fundo `--muted` + texto `--foreground`; inativo = texto `--muted-foreground`; hover = `--muted`.
- Rodapé (margin-top auto): segmented **Claro | Escuro** (28px, borda 1px, ativo com fundo `--accent` e texto `--accent-foreground`); abaixo, avatar circular 26px com iniciais "BM" + nome + botão "Sair" (ghost 12px).

### Topbar (simplificada)
- 54px, borda inferior. Esquerda: título da tela (15px/650, tracking -0.01em). Direita: busca (input 32px, largura 240px, placeholder "Buscar número ou máquina…") + botão primário **"Novo projeto"**.
- **Remover** "Exportar relatório" da topbar — ele migra para a aba Relatório do drawer.

## Passo 3 — Telas

### 1. Visão geral (`/` nova rota home OU nova rota `/visao-geral` — perguntar ao usuário; o board continua existindo)
- Container max-width 1160px, padding 24px, gap 20px.
- **Linha 1** — 4 cards de métrica (grid 4 col, gap 12): rótulo caps 11px/600 tracking 0.08em `--muted-foreground`; valor 26px/700 tabular; extra 12px. Métricas: Projetos ativos, Em atraso (valor em `--destructive` quando > 0), Entregues no ano, Lead time médio. Derivar dos dados reais da API.
- **Linha 2** — grid `2fr 1fr`: card **"Fluxo por estágio"** (6 linhas: ponto colorido 7px + título + barra horizontal 6px proporcional à contagem, na cor do estágio + contagem tabular) e card **"Prazos críticos"** (3 projetos com prazo mais próximo/atrasado; linha clicável abre o drawer; data em vermelho se atrasado).
- **Linha 3** — card **"Atividade recente"**: linhas com ponto colorido, texto 13px, tempo relativo à direita (12px muted, tabular), separadas por 1px `--muted`. Fonte: histórico de transições.

### 2. Board (`/`)
- Colunas: 272px, fundo `--col-bg` (claro: `oklch(0.955 0.005 245 / 0.5)`; escuro: `oklch(1 0 0 / 0.03)`), radius 10, padding 10, gap 8.
- Cabeçalho da coluna: ponto 8px na cor do estágio + título 13px/600 + contagem 12px muted tabular. **Sem** border-top colorido.
- **ProjectCard**: fundo `--card`, borda 1px, radius 8, padding 12px 14px, shadow xs; hover: borda mais escura + shadow sm (150ms); cursor pointer/grab.
  - Linha 1: número 13px/600 tabular + (se atrasado) badge pill "Atrasado" (fundo `--destructive` a 10%, texto destructive, ponto 5px). **Não usar mais borda vermelha no card inteiro.**
  - Linha 2: nome da máquina 12.5px `--muted-foreground`.
  - Linha 3 (se a fase tem progresso): barra 4px `--primary` sobre `--track` + "{pct}% · {n}/{total} itens" (ou "% montagem") à esquerda e prazo à direita, 11.5px tabular; prazo em destructive se atrasado. Sem progresso: cliente à esquerda, prazo à direita.
  - Remover o `CardContent` vazio (avatar/tecnologias).
- **Coluna vazia**: caixa com borda dashed, radius 8, "Nenhum projeto neste estágio" 12px muted centralizado.
- **Erro de movimentação**: banner no topo do board — borda/fundo destructive a 35%/8%, radius 8, mensagem 13px com número do projeto em bold e itens faltantes, botão × com aria-label.

### 3. Drawer de detalhe (Sheet)
- Largura 480px (max 92vw), fundo `--card`, borda esquerda, shadow md.
- Header: número 17px/650 tabular + badge do estágio (pill com ponto, fundo cor do estágio a 12%, texto na variante `-t`); abaixo "máquina · cliente" 13.5px muted; à direita botões ghost "Editar", "Excluir" (hover vermelho) e ×.
- Abas com sublinhado 2px `--primary` na ativa (texto ativo `--foreground`, inativo muted): **Visão geral / Progresso / Pendências / Relatório**.
- **Visão geral**: grid 2 col "Data prevista" (vermelha + "— atrasado" se vencida) e "Criado em"; Descrição; Observações (textarea + "Salvar observações" outline); "Tempo por estágio" e "Histórico de transições" como listas com separador 1px `--muted`, valores tabulares à direita.
- **Progresso**: Offline/Online = checklist clicável (checkbox 16px radius 4, marcado = fundo `--primary` com ✓; texto do item concluído em muted) com barra 6px e percentual no topo; Montagem = slider 0–100 step 5 com valor 20px/700 em `--primary`; demais fases = empty state dashed com texto explicativo.
- **Pendências**: só em Tryout/Entregue (senão, empty state dashed); lista de checkboxes com texto + "Visita de {data}"; input + botão "Adicionar".
- **Relatório**: card de prévia (fundo `--background`, borda) com histórico e tempos; botão primário **"Exportar relatório (.md)"** (movido da topbar; usa o endpoint existente).
- Carregamento do drawer: **skeletons** (blocos `--muted` com animação pulso 1.4s), nunca "Carregando...".

### 4. Formulários (Dialog Novo/Editar projeto)
- 440px, radius 12, padding 24, shadow md; título 16px/650 + subtítulo "Entra na coluna Esquema Elétrico." 13px muted; × no canto.
- Labels caps 11px/600 tracking 0.08em muted; inputs 34px radius 6; foco: borda `--primary` + halo `color-mix(primary 18%)`. Grid 2 col para Número* e Data prevista; Nome da máquina e Descrição (textarea) em largura total.
- Rodapé à direita: "Cancelar" (outline) + "Criar projeto" (primário).

### 5. Login (`/login`)
- Card 360px centrado vertical/horizontalmente: logo PNG centralizado (~56px de altura), "Gestão de Projetos" 18px/650 + "Acesso restrito — informe a senha da equipe." 13px muted, ambos centralizados.
- Card interno radius 12 com label **"SENHA" centralizada** (caps 11px), input password 38px, botão primário "Entrar" full-width 38px.
- Rodapé: "LS Control · Automação e solda em termoplástico" 12px muted centralizado.

### 6. Configurações (`/configuracoes/checklist`)
- Max-width 980px; título 18px/650 + descrição 13px muted.
- Grid 2 col: card por fase com header (ponto na cor do estágio — Offline azul, Online teal + "Fase Offline/Online" 13.5px/600 + "{peso}% por item" à direita, tabular).
- Linhas: handle de arrastar "⠿" muted + rótulo 13px + botões ghost "Editar"/"Excluir" (hover: accent / destructive), separador 1px `--muted`, hover na linha.
- Rodapé do card: input "Novo item do checklist…" + botão outline "Adicionar".

## Estados obrigatórios em TODAS as telas de dados
- **Vazio**: caixa dashed radius 12, ícone/quadrado accent 44px com "+", título 15px/600, texto 13px muted, CTA primário ("Criar projeto").
- **Carregando**: skeletons — blocos `--muted`, radius 8, `animation: pulso 1.4s ease infinite` (`@keyframes pulso {0%,100%{opacity:1} 50%{opacity:.45}}`), com delays escalonados. **Nunca spinner nem texto "Carregando..."**.
- **Erro**: painel/banner com borda `color-mix(destructive 35%)`, fundo `color-mix(destructive 8%)`, título em `--destructive`, descrição muted e botão "Tentar novamente".

## Interações
- Transições de 150ms (`ease`) em hover/focus/active de botões, links, inputs, cards e tabs; barra de progresso com `transition: width 200ms ease`.
- Foco: `outline: 2px solid var(--ring); outline-offset: 2px` via `:focus-visible` (já no globals.css).
- Card do board: hover eleva para shadow sm e escurece a borda; drag mantém dnd-kit atual (overlay com shadow md, opacidade 0.4 no original).
- Overlay de dialog/drawer: `--overlay` (claro `oklch(0.15 0.01 250 / 0.4)`, escuro `oklch(0 0 0 / 0.55)`).

## Responsivo
- **Desktop ≥1024**: layout descrito.
- **Tablet 768–1024**: sidebar colapsa para 56px (só ícones/iniciais, tooltip com o nome); métricas do dashboard em 2 col; grid 2fr/1fr vira 1 col.
- **Mobile <768**: sidebar vira menu inferior ou hambúrguer; board com scroll horizontal por coluna (snap); drawer ocupa 100vw; dialogs full-width com margem 16px; alvos de toque ≥44px.

## Tipografia (Geist + Geist Mono, já instaladas via next/font)
display 24/700/-0.02em · título 18/650/-0.01em · subtítulo 15/600 · corpo 14/400/1.5 · secundário 13/400 · rótulo 11/600/caps/0.08em · métricas e datas sempre `tabular-nums`.

## Arquivos deste pacote
- `globals.css` — substitui `src/app/globals.css` na íntegra.
- `public/logomarca-ls.png` — logo com fundo transparente, copiar para `public/`.
- `referencia/Etapa 3 - Telas.dc.html` — protótipo interativo completo (todas as telas, temas e estados). Os valores inline neste arquivo são a fonte da verdade para medidas e cores.
- `referencia/Direcao Visual.dc.html` — especificação da direção visual (paleta, tipografia, espaçamento, amostras).

## Checklist de aceite
- [ ] `globals.css` substituído; nenhuma cor Tailwind crua (`red-500` etc.) restante nos componentes.
- [ ] Toggle claro/escuro funcional e persistente.
- [ ] Sidebar nova + topbar simplificada; "Exportar relatório" dentro do drawer.
- [ ] Dashboard "Visão geral" com métricas derivadas da API real.
- [ ] Cards, colunas, drawer, dialogs, login e configurações conforme especificado.
- [ ] Estados vazio/skeleton/erro em todas as telas de dados.
- [ ] `aria-label` em todos os botões de ícone; foco visível; contraste AA.
- [ ] Nenhuma rota, prop, schema ou regra de negócio alterada; testes existentes (`vitest`) continuam passando.
