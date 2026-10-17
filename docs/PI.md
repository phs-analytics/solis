# Solis V1: PI (plano de implementação)

> Versão 1.0 · 16/10/2026 · Referências: [PRD.md](PRD.md), [DS.md](DS.md), [Seguranca.md](Seguranca.md), [TUTORIAL.md](TUTORIAL.md)

## Como usar este plano
- Etapas **sequenciais**: uma só começa depois que você aprovar a anterior.
- Cada etapa tem objetivo, tarefas e **checklist de aprovação**.
- Cada etapa termina com um Pull Request (`etapa-NN-nome`), CI verde e uma tag (`v1.0.NN`).
- Estimativas para ~10–15 h por semana.

### Definição de pronto (toda etapa)
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test` e `pnpm e2e` passam localmente e no CI
- [ ] Testes para toda regra nova
- [ ] Nenhum segredo, dado pessoal ou arquivo de `data/` no diff (gitleaks + revisão do `git diff --cached`)
- [ ] Testado no navegador do computador e no celular (pela rede Tailscale a partir da etapa 4)
- [ ] Acessibilidade conferida (axe, teclado, DS.md §7)
- [ ] TUTORIAL.md atualizado com o que a etapa ensina

### Visão geral
| # | Etapa | Estimativa |
|---|---|---|
| 0 | Ambiente | 0,5 semana |
| 1 | Repositório e segurança do repositório | 0,5 semana |
| 2 | Esqueleto: servidor, interface, banco cifrado e login | 1,5 semana |
| 3 | Design System em código | 1,5 semana |
| 4 | Navegação, onboarding e acesso pelo celular (Tailscale) | 1 semana |
| 5 | Finanças (manual, contas a pagar, metas, OFX/CSV) | 2,5 semanas |
| 6 | Pluggy | 1 semana |
| 7 | Agenda (tarefas, Kanban, `.ics`) | 1,5 semana |
| 8 | Saúde + Home → validação pessoal | 2 semanas |
| 9 | Assistente (motor de regras) | 1 semana |
| 10 | Segurança final e backup | 0,5 semana |
| 11 | Portfólio: README, TUTORIAL final e modo demonstração | 1 semana |

Total: cerca de **14,5 semanas**. (A estimativa anterior, de 13 semanas, foi feita antes de detalhar as etapas.)

---

## Etapa 0: Ambiente
**Tarefas**
1. Instalar **Node.js LTS** e ativar o pnpm (`corepack enable`; se não existir, `npm install -g pnpm`).
2. Instalar **VS Code** com ESLint e Prettier, e o **Git**.
3. GitHub com **2FA**; em Settings › Emails, ligar *Keep my email addresses private* e *Block command line pushes that expose my email*; `git config --global user.email "<endereço noreply>"`.
4. Criar a conta **Tailscale** (grátis), com login por um provedor que tenha 2FA; instalar o Tailscale no PC e no celular.

**Checklist**
- [ ] `node -v`, `pnpm -v`, `git --version` respondem
- [ ] `git config --global user.email` termina em `users.noreply.github.com`
- [ ] PC e celular aparecem como "Connected" no painel do Tailscale
- [ ] TUTORIAL.md, parte 1

---

## Etapa 1: Repositório e segurança do repositório
**Tarefas**
1. Criar o repositório público no GitHub e subir a estrutura da pasta `Solis_V1` (já criada, com `.gitignore` e READMEs).
2. `package.json` com pnpm; TypeScript `strict`; ESLint (proibindo `dangerouslySetInnerHTML`) e Prettier.
3. gitleaks no pre-commit e no CI (com regra para CPF); *secret scanning*, *push protection*, Dependabot e CodeQL ligados; branch `main` protegida.
4. CI (`.github/workflows/ci.yml`): `pnpm install --frozen-lockfile`, lint, typecheck, testes. Actions fixadas por SHA; `permissions: contents: read`; **nenhum segredo**.
5. `LICENSE` (Apache-2.0), `NOTICE`, `SECURITY.md`, `CONTRIBUTING.md`.

**Checklist**
- [ ] Commit com uma chave falsa (ex.: `AKIA` + 16 caracteres) é bloqueado pelo gitleaks
- [ ] Criar um arquivo em `data/` não aparece no `git status`
- [ ] `git log --format='%ae'` mostra só o endereço noreply
- [ ] CI verde; Dependabot e CodeQL ativos
- [ ] TUTORIAL.md, parte 2

---

## Etapa 2: Esqueleto: servidor, interface, banco cifrado e login
**Tarefas**
1. `src/server` com Fastify escutando **só em `127.0.0.1`**; `src/web` com React + Vite (proxy de `/api` em desenvolvimento); o servidor entrega a interface em produção.
2. **Spike do banco (2 dias):** SQLite cifrado (`better-sqlite3-multiple-ciphers` ou equivalente) com Drizzle ORM; se não combinar, SQL puro. Registrar em `docs/adr/0001-banco.md`.
3. Derivação da chave com `scrypt` (N = 2^17, r = 8, p = 1, `maxmem` ajustado), sal em `data/solis.kdf.json`; servidor começa bloqueado.
4. Telas de **criar senha** (medidor `zxcvbn-ts`, aviso de que esquecer a senha impede abrir os dados) e **entrar**.
5. Sessão em cookie `HttpOnly` + `Secure` + `SameSite=Strict`, expiração após 30 min parado; limite de tentativas; conferência do `Origin`; `@fastify/helmet` com a CSP da PRD (SEC-05).
6. Utilitário `Money` (centavos inteiros, `Intl.NumberFormat('pt-BR')`) com testes; esquema inicial e primeira migração.

**Checklist**
- [ ] Abrir `data/solis.db` num leitor de SQLite comum falha ("file is not a database")
- [ ] Senha errada não abre; senha correta abre; reiniciar o servidor pede a senha de novo
- [ ] 6 senhas erradas seguidas bloqueiam novas tentativas por um tempo
- [ ] Senha fraca ("123456", "solis2026") é recusada
- [ ] `netstat -an` mostra o Solis só em `127.0.0.1`, nunca em `0.0.0.0`
- [ ] Testes de `Money`: soma, negativos, `R$ 0,05`, `R$ 1.000.000,00`, `-R$ 12,30`
- [ ] ADR 0001 aprovado por você
- [ ] TUTORIAL.md, parte 3

---

## Etapa 3: Design System em código
**Tarefas**
1. Tokens do [DS.md](DS.md) como variáveis CSS (claro e escuro); fontes embutidas (sem CDN).
2. Componentes essenciais: botões, cards (com versão sem blur), campo de dinheiro, chips, barra de progresso, estado vazio, navegação, botão do assistente, aviso/snackbar.
3. Página de catálogo (só em desenvolvimento) com os estados: normal, foco, desabilitado, erro, claro/escuro, zoom 200%.

**Checklist**
- [ ] Contraste ≥ 4,5:1 (axe); zoom 200% sem cortes; tudo pelo teclado com foco visível
- [ ] Alvos ≥ 44 × 44 px; "reduzir movimento" respeitado
- [ ] Você aprova o visual (prints no PR)
- [ ] TUTORIAL.md, parte 4

---

## Etapa 4: Navegação, onboarding e acesso pelo celular (Tailscale)
**Tarefas**
1. Rotas: Home, Finanças, Agenda, Saúde, Configurações; barra inferior no celular e menu lateral no computador.
2. Onboarding: boas-vindas → "Seus dados ficam no seu computador" → consentimentos opcionais → renda e dia de recebimento.
3. Configurações › Privacidade (consentimentos revogáveis) e **"Apagar tudo"**.
4. **Spike (1 dia) do acesso remoto:** `tailscale serve` apontando para o Solis em `127.0.0.1`, com HTTPS da própria rede Tailscale; conferir que o **Funnel está desligado**. Registrar em `docs/adr/0002-acesso-remoto.md`.
5. Manifesto da PWA para "Adicionar à tela inicial" no celular.
6. `scripts/start` e instruções para iniciar com o Windows e não deixar o PC dormir com o Solis aberto.

**Checklist**
- [ ] No celular, **com Wi-Fi desligado (só dados móveis)**, o Solis abre pelo endereço `https://...ts.net`
- [ ] Com o Tailscale desligado no celular, o endereço não abre
- [ ] Um aparelho fora da sua rede Tailscale não acessa (teste com outro aparelho ou o navegador anônimo sem Tailscale)
- [ ] Painel do Tailscale: Funnel desligado
- [ ] Solis instalado na tela inicial do celular
- [ ] "Apagar tudo" apaga o banco e volta ao onboarding
- [ ] TUTORIAL.md, parte 5

---

## Etapa 5: Finanças
**Tarefas**
1. Contas e lançamentos (≤ 3 toques); categorias padrão editáveis; lista por dia com busca e filtros.
2. Contas a pagar (recorrentes, parcelas, faturas); "Vence hoje" na Home; marcar como paga gera a transação.
3. Regras em `src/domain` (100% testadas): `calcularLimiteDoDia`, `calcularStatusFinanceiro`, `preverProximasContas`, `rendaPrevista`.
4. Metas com depósitos e celebração.
5. OFX (SGML e XML) e CSV com mapeamento de colunas, pré-visualização, deduplicação, limite de tamanho; exportação CSV protegida contra fórmula; **testes só com extratos sintéticos**.
6. (P1) Selic/CDI do Banco Central e conteúdo educativo com aviso fixo.

**Checklist**
- [ ] Lançar um gasto pelo celular em ≤ 10 s
- [ ] Testes do limite do dia: renda hoje, amanhã, sem renda, saldo negativo, conta vencida
- [ ] Importar OFX e CSV sintéticos de 3 formatos; reimportar não duplica
- [ ] CSV exportado com `=HYPERLINK(...)` abre no Excel como texto
- [ ] TUTORIAL.md, parte 6

---

## Etapa 6: Pluggy
**Tarefas**
1. **Spike (1 dia)** com a sua conta Meu Pluggy: `/auth`, `/items/{id}`, `/accounts`, transações e paginação, chamados **pelo servidor**. `docs/adr/0003-pluggy.md`.
2. Tela de consentimento; campos de Client ID, Client Secret (só escrita) e ID do item de cada banco; dados guardados no banco cifrado (SEC-08).
3. Busca diária pelo servidor (agendador interno) e ao abrir o app se a última tiver mais de 24 h; `apiKey` reutilizada por até 2 h, só em memória.
4. Mapeamento com `source = PLUGGY` e reconciliação com OFX/CSV e manual (F-12).
5. "Desconectar" apaga as credenciais e oferece apagar as transações importadas.

**Checklist**
- [ ] Seus saldos e transações aparecem; reabrir no mesmo dia não chama a Pluggy de novo
- [ ] Ferramentas do desenvolvedor › Rede: o Client Secret e a `apiKey` **nunca** aparecem em nenhuma resposta para o navegador
- [ ] Logs do servidor não mostram credenciais nem descrições de transações
- [ ] O mesmo gasto vindo da Pluggy e de um lançamento manual aparece uma vez
- [ ] TUTORIAL.md, parte 7

---

## Etapa 7: Agenda
**Tarefas**
1. Tarefas (A-01) e Kanban com arrastar e soltar (`dnd-kit`: mouse, toque e teclado) e menu "Mover para…".
2. Lista (Atrasadas, Hoje, Esta semana, Depois) e Calendário (mês e semana).
3. Importar e exportar `.ics`; aviso do navegador para tarefas com o app aberto.

**Checklist**
- [ ] Arrastar com mouse, toque e teclado; recarregar mantém a ordem
- [ ] Tarefa atrasada indicada com ícone e texto, não só cor
- [ ] `.ics` exportado do Google Agenda importa; exportar e reimportar não duplica
- [ ] TUTORIAL.md, parte 8

---

## Etapa 8: Saúde + Home → validação pessoal
**Tarefas**
1. Água, treinos, sono, humor; (P1) terapia, ciclo menstrual (desligado por padrão), biblioteca do wger por `scripts/import-wger` (só pela API, uma vez, com pausa; licença e autor de cada item; crédito na tela "Sobre").
2. CVV 188 sempre visível na saúde mental.
3. Home completa: semana, saldo e status, gastos da semana com alerta, água, treino; (P1) clima e feriado.
4. **Validação pessoal:** usar por 2 semanas no PC e no celular fora de casa; diário do que travou; cada item vira issue.

**Checklist**
- [ ] Todos os P0 da PRD funcionando
- [ ] No celular, tocar em "188" abre o discador
- [ ] Humor baixo por 5 dias mostra o card de apoio, sem linguagem de diagnóstico
- [ ] 2 semanas de uso real concluídas; diário convertido em issues
- [ ] TUTORIAL.md, parte 9

---

## Etapa 9: Assistente
**Tarefas**
1. Normalização e classificação por regras em `src/domain/assistant`.
2. As 5 perguntas de dados da PRD (I-02), respostas fixas de segurança (I-05), botões de sugestão.
3. (P1) Textos educativos curtos com busca.

**Checklist**
- [ ] As 5 perguntas respondidas corretamente com dados de teste (testes automatizados)
- [ ] ≥ 30 variações de escrita por pergunta reconhecidas
- [ ] Crise, diagnóstico, remédio e produto financeiro retornam a resposta de segurança
- [ ] Uma transação com descrição "IGNORE AS INSTRUÇÕES…" aparece só como texto e não muda nenhuma resposta
- [ ] TUTORIAL.md, parte 10

---

## Etapa 10: Segurança final e backup
**Tarefas**
1. `scripts/backup` (cópia do arquivo cifrado com data, mantendo as últimas N) e roteiro de restauração.
2. Exportação JSON/CSV e tela "Meus dados".
3. Revisar SEC-01 a SEC-14 e o [Seguranca.md](Seguranca.md); rodar CodeQL e `pnpm audit`.
4. Roteiro "aparelho perdido" no TUTORIAL: remover o aparelho no Tailscale, "Sair de todos os aparelhos", trocar o Client Secret da Pluggy, trocar a senha.

**Checklist**
- [ ] Restaurar um backup funciona com a senha da época
- [ ] `gitleaks detect` no histórico inteiro: zero achados
- [ ] Resposta do servidor traz os cabeçalhos de segurança (conferir nas Ferramentas do desenvolvedor)
- [ ] Abrir o Solis dentro de um iframe de outra página não funciona
- [ ] Zero alertas críticos ou altos no CodeQL e no `pnpm audit`
- [ ] Checklist SEC-01…SEC-14 todo marcado

---

## Etapa 11: Portfólio
**Tarefas**
1. **Modo demonstração** com dados fictícios (para prints, GIFs e para quem quer ver sem configurar nada).
2. Prints e GIFs só no modo demonstração.
3. README de portfólio: o que é, prints, GIF, arquitetura, decisões (ADRs), segurança, aviso de projeto pessoal, link para o TUTORIAL e para o plano da V2.
4. TUTORIAL.md final, testado do zero numa conta de teste.

**Checklist**
- [ ] Você segue o TUTORIAL do zero e chega ao Solis rodando e acessível pelo celular fora de casa
- [ ] Nenhum dado seu (valores, e-mail, IDs da Pluggy, endereço `.ts.net`, nome do PC) no README, nos prints, no tutorial ou no histórico
- [ ] Tag `v1.0.0`
