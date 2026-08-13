# Changelog
Formato baseado em [Keep a Changelog](https://keepachangelog.com/).

## [Não lançado]
### Segurança
- Login (`POST /api/login`) agora limita tentativas por IP (5 erradas / 15 min → `429`), protegendo a senha única compartilhada contra força bruta.
- Sessão deixou de ser um hash fixo da senha e virou um token aleatório de 256 bits por login, revogável individualmente (`POST /api/logout` apaga a sessão no banco, não só o cookie do navegador).
- Comparação da senha informada com `APP_PASSWORD` agora é constant-time.
- Adicionados cabeçalhos de segurança padrão em todas as respostas: Content-Security-Policy (com nonce por request), `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`.
- Fechado open redirect no parâmetro `?redirect=` da tela de login (só aceita caminhos internos).
- Rotas de pendência (`/api/projetos/:id/pendencias/:idPendencia`) passaram a validar que a pendência pertence ao projeto indicado na URL.
- Atualizada dependência `nanoid` (corrige CVE *high* transitiva); `npm audit --omit=dev` sem vulnerabilidades.

### Corrigido
- CSP inicial bloqueava silenciosamente o script de streaming de RSC do Next.js, quebrando a hidratação do React em toda página em produção — corrigido gerando o nonce da CSP por request em `src/proxy.ts`.

### Adicionado
- Documentação inicial completa do projeto (Produto, Técnica, Processos, Acompanhamento).
