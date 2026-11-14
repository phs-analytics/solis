# Andamento do Solis

> Estado em 14/11/2026. Este documento resume o que já foi feito, o que está verificado e o que falta, com os próximos passos em ordem. Complementa o [PI.md](PI.md) (plano por etapas) e o [TUTORIAL.md](TUTORIAL.md) (passo a passo para o usuário).

---

## 1. Resumo

O Solis virou um **app** (Tauri 2 + React/TypeScript) para Android (APK, sem Play Store), Windows e Linux. Os dados ficam cifrados no próprio aparelho. A sincronização com o servidor do usuário é a próxima grande etapa.

Estado atual:

| Área | Situação |
|---|---|
| Núcleo Rust (cofre cifrado) | Compila e 8 testes passam localmente |
| App no Windows | Abre com `pnpm app:dev` (confirmado pelo usuário) |
| Interface nova (visual, 4 telas, avatar) | Pronta na branch `etapa-03b-visual`, testes passando |
| APK Android | Job de CI criado; **build local no Windows não funciona** (ver §4) |
| Sincronização com servidor | Não iniciada (Etapa 4) |
| Dados reais nas telas | Não iniciados (Etapas 5 a 8); hoje as telas usam dados de exemplo |

---

## 2. O que foi feito

### 2.1 Planejamento e análise (antes do código)
- Análise do projeto original e mapeamento das seis referências (sure, openGym, FreeHabits, strength-training, Vibe-Trading, open-seo) para as etapas.
- Decisão de plataforma registrada em [ADR 0002](adr/0002-plataforma.md): **Tauri 2 + React/TS**, com o motivo e as alternativas descartadas (Flutter, Kotlin Multiplatform, Electron + Capacitor).
- Atualização do [ADR 0001](adr/0001-banco.md): o cofre migrou para Rust, mantendo o mesmo formato de banco.

### 2.2 Etapas 2 e 3 (já existiam, preservadas)
- Servidor Fastify, banco SQLCipher, login com scrypt (Etapa 2).
- Design system em código, com tokens, componentes e catálogo `#catalogo` (Etapa 3).
- O código do servidor Node continua no projeto; ele vira o **servidor de sincronização** na Etapa 4.

### 2.3 Migração para Tauri (`migracao-tauri`, PR #9)
- **Núcleo Rust** em `src-tauri/src/cofre.rs`:
  - Banco SQLite cifrado com SQLCipher (`rusqlite` com OpenSSL embutido).
  - Chave de 32 bytes derivada por scrypt (N = 2^17, r = 8, p = 1), com sal em `solis.kdf.json`.
  - Regras de acesso: 5 erros em 15 minutos, atraso de 1 s por erro seguido, bloqueio após 30 minutos sem uso.
  - 8 testes (chave certa e errada, arquivo ilegível, bloqueio, inatividade).
- **Comandos expostos à interface:** `status`, `criar_senha`, `entrar`, `sair`, `tocar`.
- **Projeto Android** gerado em `src-tauri/gen/android`.
- **CI** (`.github/workflows/ci.yml`): jobs `verificar` (lint, typecheck, testes, e2e, gitleaks), `rust` (fmt, clippy, testes) e `android` (APK de debug como artefato).
- **Correção:** erro de lifetime em `travar` (lib.rs), commit `6e8c3e9`.

### 2.4 Visual novo (`etapa-03b-visual`, commit `0b76c3d`)
- **Direção visual** em [DS.md §0](DS.md):
  - Tema escuro: glassmorphism com formas retrô (vidro com blur e borda em degradê).
  - Tema claro: neumorfismo em creme (relevo por sombra dupla).
  - Paleta "Design Base" do PDF do desenvolvedor.
- **Fontes:** Nunito (texto, títulos) e Space Mono (números e rótulos em caixa alta).
  - Seven e Hagrid, sugeridas pelo desenvolvedor, não estão disponíveis em pacote livre (Hagrid é paga). Decisão: manter Nunito.
- **Navegação:** menu lateral de vidro no computador (≥ 768 px); barra inferior flutuante no celular.
- **Quatro telas** em `src/web/telas/Telas.tsx`:
  - Visão geral: saldo "pode gastar hoje" com botão de olho, anéis de tarefas, água e sono, cards com sparkline.
  - Finanças: fluxo de caixa semanal, categorias empilhadas, últimos lançamentos.
  - Tarefas: lista com checkbox que risca o texto.
  - Saúde: anéis e barras de água e sono, passos, humor e aviso do CVV 188.
  - **Os dados são de exemplo** (`src/web/telas/exemplo.ts`).
- **Assistente** em `src/web/assistente/`:
  - Avatar "New avatar" (`new-avatar.avatar.json`), com `@bible-strong/avatar-react` v1.0.1.
  - Botão flutuante abre um painel com estados (pensar, comemorar).
  - Respeita "reduzir efeitos" e movimento reduzido.
  - As respostas do assistente ficam para a Etapa 9.
- **Componentes novos:** `StatCard`, `Sparkline`, `Anel`, `Barras`, `Tag`, `Tarefa`, `Navegacao` com marca.

### 2.5 Verificação do visual
- Lint, Prettier e typecheck: passam.
- Testes unitários: **66 passam**, incluindo contraste AA nos dois temas (32 pares).
- Testes e2e: **17 passam**, incluindo:
  - axe (acessibilidade) nas quatro telas, nos dois temas;
  - navegação sem rolagem horizontal em 360 px e 1280 px;
  - alvos de toque de 44 px;
  - ocultar valores, marcar tarefa, abrir o assistente.
- Capturas de tela conferidas (PC e celular, claro e escuro) em `capturas-design/`, que fica fora do Git.

---

## 3. Branches e pull requests

| Branch | Conteúdo | Situação |
|---|---|---|
| `etapa-02-servidor-banco-login` | Etapa 2 | Commit `9221bf7`, não enviada |
| `etapa-03-design-system` | Etapa 3 | Commit `5f51ada`, não enviada |
| `docs-andamento` | Mapeamento das referências | Commit `7658b1b`, **não enviada** |
| `migracao-tauri` | Migração para Tauri | Enviada; **PR #9 aberto** |
| `etapa-03b-visual` | Visual novo, telas e avatar | Enviada (`0b76c3d`); PR ainda não aberto |

O PR #9 é baseado no `main`, mas contém as etapas 2 e 3 (que não estão no `main`). Por isso o revisor vê muitos arquivos de uma vez. Ver §5, item 1.

---

## 4. O que não está verificado

- **APK Android:** o build local no Windows **falha**. O OpenSSL embutido no SQLCipher não compila para Android a partir do Windows (o Perl do Strawberry gera caminhos Windows; o Perl do Git não tem os módulos). A solução adotada é o job `android` no CI (Linux). **O job ainda não rodou com sucesso.**
- **Cofre no Android:** o núcleo foi testado só no Windows. O comportamento no celular (caminho da pasta de dados, permissões) não foi testado.
- **Visual no celular real:** conferido pelas capturas do navegador, não em aparelho.
- **Fontes:** Nunito está embutida via `@fontsource`; não foi conferido o peso das fontes no APK final.

---

## 5. Próximos passos

### 5.1 Imediato (esta semana)

1. **Abrir o PR da `etapa-03b-visual`** apontando para a `migracao-tauri`, ou para o `main` depois que o PR #9 for aceito.
2. **Conferir o CI do PR #9:**
   - Job `rust`: deve passar (8 testes do cofre).
   - Job `android`: pode falhar por versão de NDK ou de Gradle. Se passar, baixar o APK em **Actions → solis-debug-apk** e instalar no celular.
3. **Enviar a `docs-andamento`** (mapeamento das referências), que ainda está só no seu computador.
4. **Decidir sobre a exceção do pacote do avatar:** o pnpm liberou `@bible-strong/avatar-react` e `avatar-core` (versão 1.0.1, publicada há pouco) em `pnpm-workspace.yaml`. Manter a exceção ou esperar a idade mínima de publicação.
5. **Decidir sobre o e-mail dos commits:** os commits usam o `noreply` do GitHub, e o CLAUDE.md pede o e-mail pessoal. Recomendado: manter o `noreply` (repositório público) e ajustar o CLAUDE.md.

### 5.2 Etapa 4: servidor de sincronização (PI, etapa 4)

**Decisões necessárias antes de começar:**

- **Onde roda o servidor:** VPS (sempre ligado, pago) ou PC em casa (grátis, depende de o PC estar ligado).
- **Cifragem:**
  - *De ponta a ponta:* o servidor guarda só dados cifrados. Mais seguro, mas a Pluggy teria que rodar no aparelho.
  - *Servidor lê os dados:* mais simples; a Pluggy roda no servidor.
- **Frequência:** só 1× por dia, ou também ao abrir o app e com um botão "sincronizar agora".

**Entregas da etapa:**
- Servidor Fastify (já existe em `src/server/`) recebendo lotes de dados cifrados.
- Motor de sincronização no app (Rust ou TypeScript): envia e recebe, resolve conflitos.
- Autenticação do aparelho no servidor.
- Testes de integração do fluxo completo (aparelho → servidor → aparelho).

### 5.3 Etapa 5: Finanças reais

- Lançamentos, contas a pagar, metas.
- Importação de extratos OFX e CSV (os arquivos ficam fora do Git).
- Telas de Finanças passam a ler do cofre, no lugar de `exemplo.ts`.

### 5.4 Etapa 6: bancos via Pluggy

- Conexão com a API da Pluggy (ver TUTORIAL §7).
- Client Secret guardado só no servidor do usuário, dentro do banco cifrado.
- Dependência da decisão de cifragem (§5.2).

### 5.5 Etapa 7: Tarefas e Agenda

- Tarefas, Kanban e calendário.
- Importar e exportar `.ics`.
- Tela de Tarefas passa a usar dados reais.

### 5.6 Etapa 8: Saúde

- Água, treinos, sono e humor.
- Biblioteca de exercícios do wger, com crédito ao autor de cada item.
- Ajuda sempre visível (CVV 188).

### 5.7 Etapa 9: assistente

- Respostas por regras, usando os dados do próprio usuário (ex.: "quanto posso gastar hoje?").
- Sem IA generativa.
- O avatar já está no lugar; falta a lógica de respostas e os estados ligados a ela.

### 5.8 Etapa 10: backup e distribuição

- Backup cifrado em `backups/` e cópia semanal para pendrive (TUTORIAL §11).
- Troca de senha (`PRAGMA rekey`).
- **Chave de assinatura do APK:** gerar, guardar fora do Git e fazer backup. Se for perdida, o app não pode ser atualizado por cima.
- Gerar o `.apk` de release e o instalador Windows (`.exe`) e Linux (`.deb`, AppImage) pelo CI.

---

## 6. Riscos conhecidos

| Risco | Impacto | Mitigação |
|---|---|---|
| APK Android não compila localmente no Windows | Não dá para testar o APK sem esperar o CI | Job `android` no CI (Linux) |
| Tipos do avatar copiados à mão ([avatar-react.d.ts](../src/web/assistente/avatar-react.d.ts)) | Podem ficar desatualizados se o pacote mudar | Remover a cópia quando o pacote corrigir os imports |
| Pacote do avatar sem a idade mínima de publicação | Risco de pacote malicioso recém-publicado | Revisar a exceção no `pnpm-workspace.yaml` |
| Perda da senha do cofre | Dados irrecuperáveis | Aviso na criação da senha; backup em pendrive |
| Perda da chave de assinatura do APK | Não há atualização por cima | Guardar fora do Git e fazer backup |

---

## 7. Como continuar

Para retomar o trabalho em outra sessão, leia nesta ordem: este arquivo, [PI.md](PI.md) (etapa atual), [DS.md](DS.md) §0 (visual) e [ADR 0002](adr/0002-plataforma.md) (plataforma).

```bash
pnpm install
pnpm test
pnpm e2e
pnpm app:dev
cargo test --manifest-path src-tauri/Cargo.toml
```
