# Solis V1: andamento

> Atualizado em 17/10/2026. Atualize este arquivo ao fim de cada etapa e sempre que uma decisão mudar o plano. As etapas estão no [PI.md](PI.md).

## Onde estamos

**Etapa atual: 2 (servidor, interface, banco cifrado e login). Plano aprovado, ainda não iniciado.**

| # | Etapa | Situação | Tag |
|---|---|---|---|
| 0 | Ambiente | Concluída | — |
| 1 | Repositório e segurança do repositório | Concluída | `v0.1.0` |
| 2 | Servidor, interface, banco cifrado e login | Plano aprovado | — |
| 3–11 | Restantes | Não iniciadas | — |

## Como trabalhamos

- O desenvolvedor executa cada passo; o Claude explica, passa comandos e trechos, revisa e confere testes, CI e checklist.
- Cada etapa: plano aprovado antes de começar, branch `etapa-NN-nome`, PR com o check `verificar` verde, tag `v0.N.0`. A versão final é `v1.0.0`.
- A `main` é protegida: nada entra sem PR.

## Etapa 1: o que ficou pronto

- pnpm, TypeScript `strict`, ESLint (proíbe `dangerouslySetInnerHTML`), Prettier e Vitest.
- gitleaks no pre-commit (`.githooks/`) e no CI, com regra de CPF.
- CI só leitura, actions fixadas por SHA; Dependabot (npm e Actions); CodeQL (Default setup); ruleset `proteger-main`.
- LICENSE (Apache-2.0), NOTICE, SECURITY.md, CONTRIBUTING.md; TUTORIAL parte 2.

**Decisões tomadas na Etapa 1**
- TypeScript fixado na 6.0: o typescript-eslint ainda não suporta a 7.
- O Prettier ignora `*.md`, para não reescrever as tabelas dos documentos.
- `.gitattributes` com finais de linha LF, para o Windows e o CI (Linux) verem os mesmos arquivos.
- Tags `v0.N.0` por etapa (antes `v1.0.NN`, que não é versão válida e passaria da `v1.0.0` final).

## Etapa 2: plano aprovado

**Fase A: spike do banco (parar no ADR para aprovação)**
1. `better-sqlite3-multiple-ciphers` no Windows e no CI, sem compilar.
2. Cifra compatível com SQLCipher v4, chave bruta de 32 bytes vinda do scrypt. Conferir: leitor comum falha, chave errada falha, chave certa abre.
3. Drizzle ORM com esse driver; plano B: SQL puro com arquivos `.sql` numerados e `PRAGMA user_version`.
4. `docs/adr/0001-banco.md`.

**Fase B**
- Servidor roda o TypeScript direto no Node 24 (`erasableSyntaxOnly`), fixo em `127.0.0.1:3000`, começa bloqueado.
- Rotas: `GET /api/status`, `POST /api/setup`, `POST /api/login`, `POST /api/logout`.
- scrypt N = 2^17, r = 8, p = 1, `maxmem` 256 MB; sal em `data/solis.kdf.json`.
- Limite: 5 erros a cada 15 min (global) e atraso de 1 s por erro seguido.
- Sessão em memória, cookie `__Host-solis` (`HttpOnly`, `Secure`, `SameSite=Strict`), expira após 30 min parado.
- Conferência do `Origin`; `@fastify/helmet` com a CSP da PRD.
- `src/domain`: `avaliarSenha` (zxcvbn ≥ 3 e mínimo de 12 caracteres) e `Money` em centavos.
- Primeira migração cria só a tabela `setting`.
- Testes de unidade, integração (`fastify.inject`, pasta temporária) e e2e (Playwright + axe); CI ganha `pnpm e2e`.
- Fora desta etapa: "Sair de todos os aparelhos" (10), `.ts.net` e PWA (4), visual (3), tabelas de dados (5–8).

## Pendências

- [ ] Ligar "Malware alerts" em Settings › Advanced Security.
- [ ] [Seguranca.md](Seguranca.md) §4 ainda diz que o Git está sem e-mail configurado (já foi feito na Etapa 0).
