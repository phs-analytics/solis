# Solis V1: PRD (documento de requisitos do produto)

> Versão 1.0 · 16/10/2026 · Status: rascunho para aprovação
> A V1 é a versão **simples e rápida** do Solis: o servidor e os dados ficam no seu computador, e você acessa pelo navegador do computador e do celular, inclusive fora de casa, por uma rede privada (Tailscale). O plano maior (site no GitHub Pages, dados no navegador, sincronização pelo Dropbox) ficou para a V2, em `Solis_V2/docs`.

---

## 1. Visão geral

### 1.1 O problema
Quem vive com orçamento apertado organiza a vida em lugares soltos: saldo no app do banco, contas no caderno, agenda na cabeça, saúde por último. Os apps que existem costumam ser pagos, cheios de anúncios ou pensados para quem tem renda sobrando.

### 1.2 A proposta
O **Solis** junta **finanças, agenda, saúde física e saúde mental** num só lugar, com um assistente que responde perguntas práticas ("quanto posso gastar hoje?") por regras e cálculos, sem I.A. generativa e sem mandar dados para servidor de terceiros.

### 1.3 Como a V1 funciona
```
Seu computador (Windows)                        Seu celular
┌────────────────────────────────┐              ┌──────────────────┐
│ Servidor Solis (Node.js)        │              │ Navegador / PWA  │
│  · interface (React)            │◀── rede ────▶│ Tailscale (app)  │
│  · API local                    │  privada     └──────────────────┘
│  · banco SQLite cifrado (data/) │  Tailscale
│ escuta só em 127.0.0.1          │
│ Tailscale Serve (HTTPS)         │──▶ APIs externas: Pluggy, Open-Meteo,
└────────────────────────────────┘     BrasilAPI, Banco Central
```
- O servidor **só escuta no próprio computador** (`127.0.0.1`). Quem leva o acesso até o celular é o **Tailscale Serve**, por HTTPS, dentro da sua rede privada.
- Ninguém fora da sua rede Tailscale encontra o Solis na internet.
- **O computador precisa estar ligado** (e acordado) para o celular acessar.

### 1.4 Princípios
1. **Os dados são seus:** ficam num arquivo cifrado no seu computador, sem conta Solis, sem telemetria.
2. **Simples de terminar:** só o essencial para uso diário; o resto vai para a V2.
3. **Linguagem simples**, português do dia a dia.
4. **Realista:** parte da renda real, inclusive informal e variável.
5. **Custo zero:** tudo em planos gratuitos.

### 1.5 Público que guia o design
É um projeto pessoal, mas o design segue estas personas, porque o portfólio quer mostrar que o app atende quem mais precisa:

| Persona | Perfil | Dor principal |
|---|---|---|
| **Jéssica, 24** | Atendente, salário mínimo | Chega no dia 20 sem dinheiro e não sabe para onde foi |
| **Carlos, 38** | Motorista de app, renda variável | Renda muda toda semana |
| **Dona Rita, 57** | Diarista | Esquece contas; letra pequena atrapalha |
| **Lucas, 19** | Estudante com estágio | Quer guardar dinheiro e cuidar da saúde mental |

### 1.6 Escopo da V1
- Construída, usada e validada **só por você**.
- Repositório público no GitHub como **portfólio**, com o [TUTORIAL.md](TUTORIAL.md) para quem quiser montar o seu.
- **Custo zero.**

### 1.7 Fora da V1 (fica para a V2 ou depois)
- Site hospedado no GitHub Pages e dados guardados no navegador.
- Sincronização pelo Dropbox (na V1 os dados ficam num lugar só, o seu PC).
- Google Agenda (na V1, a agenda importa e exporta `.ics`).
- Funcionar com o computador desligado ou sem internet no celular.
- Notificações com o app fechado.
- I.A. generativa (pesquisa guardada em `Solis_V2/docs/AI_Solis.md`).
- Uso por outras pessoas, app nativo, lojas, anúncios, diagnóstico de saúde.

---

## 2. Funcionalidades

Prioridade: **P0** = obrigatório na V1 · **P1** = entra na V1 se o tempo permitir · **P2** = V2

### 2.1 Home (painel)
| ID | Requisito | Prior. |
|---|---|---|
| H-01 | Tarefas e contas da semana (próximos 7 dias) | P0 |
| H-02 | Saldo consolidado (contas + cofrinhos + investimentos cadastrados) | P0 |
| H-03 | Status financeiro: **Positivo** (gasto do mês < 80% da renda prevista), **Neutro** (80–100%), **Negativo** (> 100% ou saldo < 0) | P0 |
| H-04 | Gastos da semana com alerta quando o gasto do dia passa do "limite do dia" (F-08) | P0 |
| H-05 | Água: +250 ml / +500 ml, meta diária | P0 |
| H-06 | Clima local (Open-Meteo) e próximo feriado (BrasilAPI), com cache | P1 |
| H-07 | Treino do dia: feito, pendente ou sugestão | P1 |

### 2.2 Finanças
| ID | Requisito | Prior. |
|---|---|---|
| F-01 | Contas: corrente, poupança, carteira, cofrinho, investimento | P0 |
| F-02 | Lançamento rápido de gasto ou receita (≤ 3 toques) | P0 |
| F-03 | Importação de extrato **OFX** e **CSV**, com pré-visualização | P0 |
| F-04 | Metas com valor-alvo, prazo e progresso | P0 |
| F-05 | Contas a pagar: recorrentes, parceladas ("3/10") e faturas | P0 |
| F-06 | Previsão das próximas contas | P1 |
| F-07 | Categorias padrão adaptadas (Mercado, Transporte, Gás, Recarga, Pix pra família…), editáveis | P0 |
| F-08 | "Quanto posso gastar hoje": `(saldo disponível − contas até a próxima renda − reserva de meta) ÷ dias até a próxima renda` | P0 |
| F-09 | Renda variável: média móvel das últimas N semanas | P1 |
| F-10 | **Pluggy:** saldos, extratos e cartões dos seus bancos, buscados pelo servidor 1× por dia e ao abrir o app (§3.5) | P0 |
| F-11 | Regras de categorização aprendidas ao corrigir uma categoria | P1 |
| F-12 | Reconciliação: Pluggy, OFX/CSV e manual sem duplicar (valor + data ± 1 dia + descrição normalizada) | P0 |
| F-13 | Conteúdo educativo genérico sobre reserva e dívidas, com Selic/CDI do Banco Central e aviso fixo "não é recomendação de investimento" | P1 |

**Regras do conteúdo financeiro:** o Solis não é consultoria (atividade regulada pela CVM). Ordem embutida: 1) dívida cara primeiro; 2) reserva de emergência com liquidez diária e FGC, comparando com a poupança; 3) depois, só conceitos (prazo, risco, liquidez). Nunca citar banco, corretora ou produto.

### 2.3 Agenda
| ID | Requisito | Prior. |
|---|---|---|
| A-01 | Tarefas com título, descrição, prazo, prioridade, etiqueta e área | P0 |
| A-02 | Kanban **A Fazer · Fazendo · Revisão · Concluído**, com arrastar e soltar (mouse, toque, teclado) e menu "Mover para…" | P0 |
| A-03 | Visualizações Quadro, Lista e Calendário (mês e semana) | P0 |
| A-04 | Importar e exportar `.ics` (Google Agenda, Outlook, calendário do celular) | P0 |
| A-05 | Lista "Vence hoje" na Home e aviso do navegador com o app aberto | P0 |

### 2.4 Saúde
| ID | Requisito | Prior. |
|---|---|---|
| S-01 | Treinos: tipo, duração, intensidade (1–5), local | P0 |
| S-02 | Biblioteca de exercícios sem equipamento, importada do **wger**, com licença e autor de cada item | P1 |
| S-03 | Sono: dormir, acordar, qualidade | P0 |
| S-04 | Humor diário (5 emojis + nota opcional) | P0 |
| S-05 | Terapia e lazer (data, profissional, anotações privadas) | P1 |
| S-06 | Ciclo menstrual (**desligado por padrão**) | P1 |
| S-07 | Ajuda sempre visível na saúde mental: **CVV 188** (24 h, gratuito; link `tel:188`) e orientação para CAPS ou UBS | P0 |

### 2.5 Assistente (motor de regras)
| ID | Requisito | Prior. |
|---|---|---|
| I-01 | Botão do assistente em todas as telas | P0 |
| I-02 | Perguntas de dados respondidas por cálculo: "quanto posso gastar hoje?", "quais contas vencem essa semana?", "tenho horário livre hoje?", "que treino faço hoje?", "como está minha meta?" | P0 |
| I-03 | Entende variações de escrita ("qnto posso gasta hj") | P0 |
| I-04 | Botões de sugestão | P0 |
| I-05 | Respostas fixas de segurança: crise → CVV 188; diagnóstico ou remédio → procurar profissional; produto financeiro → aviso | P0 |
| I-06 | Textos educativos curtos escritos pelo projeto, com busca por palavra-chave | P1 |

---

## 3. Arquitetura

### 3.1 Stack técnica
| Camada | Escolha | Por quê |
|---|---|---|
| Linguagem | **TypeScript** (`strict`) no servidor e na interface | Uma linguagem só; o código vira base da V2 |
| Servidor | **Node.js LTS** + **Fastify** | Leve, rápido, com plugins oficiais de segurança (cabeçalhos, limite de tentativas, cookies) |
| Interface | **React** + **Vite** | Mesma escolha da V2 |
| Banco | **SQLite** num arquivo em `data/`, **cifrado** (biblioteca compatível com SQLCipher, ex.: `better-sqlite3-multiple-ciphers`, a validar no spike) | Um arquivo só, fácil de fazer backup; cifrado se o PC for perdido ou o arquivo copiado |
| Acesso ao banco | Drizzle ORM com migrações versionadas (a validar com o driver cifrado no spike) ou SQL puro | Tipos do TypeScript nas consultas |
| Senha | `scrypt` do próprio Node (`node:crypto`), parâmetros recomendados pela OWASP (N = 2^17, r = 8, p = 1) | Sem biblioteca de criptografia de terceiros |
| Acesso remoto | **Tailscale** (plano pessoal gratuito) com **Tailscale Serve** (HTTPS dentro da rede privada) | Nada exposto na internet; o celular entra pela rede privada |
| Testes | Vitest (unidade e integração), Playwright (navegador, tela de computador e de celular), axe-core | Grátis e padrão |
| Qualidade | ESLint, Prettier, `tsc --noEmit` | No CI |
| Pacotes | pnpm com lockfile obrigatório | Instalação reproduzível |
| CI | GitHub Actions (só testes e verificações, nenhum segredo) | Grátis em repositório público |

> **Versões:** fixar no `package.json` e no lockfile as versões estáveis no momento do setup, conferidas na documentação oficial.

### 3.2 Organização do código
```
Solis_V1/
├── src/domain/     regras puras (orçamento, previsões, assistente): sem banco, sem rede, sem React
├── src/server/     Fastify: login, API, banco cifrado, Pluggy, tarefas agendadas, entrega a interface
├── src/web/        React: telas, Design System
├── tests/          unit · integration · e2e · fixtures (só dados sintéticos)
├── scripts/        iniciar, backup, preparar ambiente
├── config/         exemplos de configuração (os reais ficam fora do Git)
├── data/           banco cifrado (fora do Git)
├── backups/        cópias do banco (fora do Git)
└── docs/           PRD, PI, DS, Seguranca, TUTORIAL, ADRs
```
Em desenvolvimento, o Vite serve a interface e repassa `/api` ao servidor. Em produção, o próprio servidor entrega os arquivos da interface.

### 3.3 Banco de dados
- **Um arquivo SQLite cifrado** em `data/solis.db`. A chave sai da sua senha (scrypt + sal) e só existe na memória do servidor enquanto ele está desbloqueado.
- **Servidor começa bloqueado.** No primeiro acesso depois de ligar, a tela de login pede a senha, que abre o banco.
- Dinheiro sempre em **centavos inteiros**; datas em UTC.
- Migrações versionadas e testadas no CI.

**Esquema inicial (resumido)**
```
account(id, name, type, balance_cents, created_at)
transaction(id, account_id, amount_cents, category_id, description, occurred_at,
            installment_no, installment_total, recurrence_id, source /*MANUAL|OFX|CSV|PLUGGY*/, external_id)
category(id, name, icon, kind, is_default)
categorization_rule(id, pattern, category_id, hits)
bill(id, name, amount_cents, due_day, recurrence, installments_left, account_id, paid_until)
goal(id, name, target_cents, saved_cents, deadline)
income_source(id, name, amount_cents, frequency, next_date)
bank_link(id, provider /*PLUGGY*/, client_id, client_secret, last_sync_at, status)  -- dentro do banco cifrado
bank_item(id, bank_link_id, external_item_id, institution_name)
task(id, title, notes, status, position, due_at, priority, area, tag)
water_log · workout · sleep_log · mood_log · therapy_session · cycle_log
setting(key, value) · consent(purpose, granted, granted_at, revoked_at)
session(id, created_at, last_seen_at, user_agent_hint)        -- só em memória, nunca no disco
```
- Fora do banco fica só `data/solis.kdf.json`, com o sal e os parâmetros do scrypt (não são segredo). A senha é conferida tentando abrir o banco: chave errada, banco não abre. Não existe um segundo arquivo de "hash de senha".

### 3.4 Login, sessão e acesso remoto
- **Uma senha só** (frase-senha com força mínima, medida com `zxcvbn-ts`). Ela abre o banco e libera o login.
- **Sessão** por cookie `HttpOnly`, `Secure`, `SameSite=Strict`, válida por tempo curto e renovada com o uso; sai sozinha após 30 min parado.
- **Limite de tentativas** de login (ex.: 5 por 15 min) e atraso progressivo.
- **Proteção contra requisição forjada:** cookies `SameSite=Strict` + o servidor confere o cabeçalho `Origin` em toda requisição que altera dados.
- **Servidor só em `127.0.0.1`.** O `tailscale serve` publica o Solis por HTTPS dentro da rede privada (endereço do tipo `https://nome-do-pc.<sua-rede>.ts.net`). Detalhes confirmados no spike da etapa 4.
- **Nada de Funnel:** o Tailscale Funnel (que expõe na internet pública) fica **desligado**.

### 3.5 Pluggy (dados bancários)
Tudo o que foi pesquisado continua valendo (termos lidos em 16/10/2026; cópias em `referencias/`, fora do Git):
- **Meu Pluggy é grátis para ler as próprias contas:** até 5 conexões, sem SLA. Você usa o seu Client ID/Secret.
- **Na V1 fica melhor que no plano da V2:** a Pluggy recomenda guardar o Client Secret no **servidor**, nunca na interface. Na V1, ele fica no servidor do seu PC, dentro do banco cifrado, e **nunca vai para o navegador**.
- O servidor busca os dados **1× por dia** (se o PC estiver ligado) e quando você abre o app, se a última busca tiver mais de 24 h. `apiKey` (válida por 2 h) só em memória.
- Passos: conta no `meu.pluggy.ai` e conexão dos bancos; aplicação no `dashboard.pluggy.ai`; conector "MeuPluggy" habilitado; ID do item de cada banco (listar itens dá 403 em contas Meu Pluggy); colar tudo em Finanças › Conectar banco.
- Limites: 360 requisições por minuto; reutilizar a `apiKey`; usar o auto-sync da Pluggy em vez de `PATCH /items`.
- Proibido: copiar marca, textos e layouts da Pluggy; usar com contas de terceiros.

### 3.6 Outras APIs (todas gratuitas, chamadas pelo servidor)
| Uso | API | Observação |
|---|---|---|
| Clima | Open-Meteo | Cidade escolhida numa lista local (IBGE; conferir licença), sem enviar CEP |
| Feriados | BrasilAPI | Cache anual, lista embutida de reserva |
| Selic / CDI | Banco Central SGS (reserva: BrasilAPI) | Conteúdo educativo |
| Exercícios | wger | Importado **uma vez** por script e embutido; licença Creative Commons por item (crédito ao autor; traduções sob a mesma licença) |

### 3.7 Assistente (motor de regras)
Normaliza a pergunta (minúsculas, sem acento, abreviações), classifica por regras e responde por **template** com valores já formatados. Texto de terceiros (descrições de transações) nunca é interpretado como pergunta ou instrução.

### 3.8 Backup
- `scripts/backup` copia o arquivo cifrado para `backups/` com data no nome e mantém as últimas N cópias.
- O TUTORIAL recomenda copiar um backup para um pendrive toda semana.
- Restaurar = parar o servidor, trocar o arquivo, iniciar e entrar com a senha da época do backup.

### 3.9 Ligar e manter no ar
- `pnpm start` inicia o servidor. O TUTORIAL mostra como iniciar junto com o Windows (Agendador de Tarefas) e como evitar que o PC durma com o Solis aberto.
- Se o PC desligar ou dormir, o celular mostra "Não foi possível conectar" até ele voltar.

---

## 4. Segurança e LGPD
Detalhes em [Seguranca.md](Seguranca.md).

| ID | Requisito |
|---|---|
| SEC-01 | Banco SQLite **cifrado**; chave derivada da senha por scrypt, só em memória enquanto desbloqueado |
| SEC-02 | Frase-senha com força mínima; chave derivada por scrypt com sal (a senha é conferida ao abrir o banco, sem arquivo de hash separado); limite de tentativas e atraso progressivo |
| SEC-03 | Servidor escuta **só em `127.0.0.1`**; acesso remoto só pelo Tailscale Serve (HTTPS, rede privada); Funnel desligado |
| SEC-04 | Sessão em cookie `HttpOnly` + `Secure` + `SameSite=Strict`; expira após 30 min sem uso; botão "Sair de todos os aparelhos" |
| SEC-05 | Cabeçalhos de segurança no servidor (`@fastify/helmet`): CSP com `default-src 'self'`, `frame-ancestors 'none'`, `object-src 'none'`, sem script de terceiros; `X-Content-Type-Options`; `Referrer-Policy: no-referrer` |
| SEC-06 | Toda requisição que altera dados confere o cabeçalho `Origin` (proteção contra requisição forjada) |
| SEC-07 | Entradas validadas no servidor (esquemas por rota); consultas sempre parametrizadas; texto de terceiros exibido só como texto (`dangerouslySetInnerHTML` proibido por lint) |
| SEC-08 | Pluggy: Client Secret só no servidor, dentro do banco cifrado, **nunca enviado ao navegador**; campo só de escrita na tela; `apiKey` só em memória; nunca em log |
| SEC-09 | Zero telemetria; logs do servidor sem dado pessoal (valores, descrições e credenciais mascarados) |
| SEC-10 | Higiene do repositório: e-mail anônimo do GitHub nos commits; gitleaks no pre-commit e no CI (com regra para CPF); push protection; `data/`, `backups/`, `config/*.local.*`, `.env` e `referencias/` fora do Git; fixtures só sintéticas; prints só no modo demonstração |
| SEC-11 | CI sem nenhum segredo; actions fixadas por SHA; `permissions: contents: read`; Dependabot e CodeQL |
| SEC-12 | Importação OFX/CSV com limite de tamanho; exportação CSV protege contra fórmula (`=`, `+`, `-`, `@` recebem apóstrofo) |
| SEC-13 | Tailscale: conta com 2FA no provedor de login; aparelho perdido é removido no painel do Tailscale (roteiro no TUTORIAL) |
| SEC-14 | Backups continuam cifrados (são cópias do arquivo cifrado); recomendação de guardar fora do PC |

**LGPD:** saúde é dado sensível. Os dados ficam só no seu PC (e, se ligada, a Pluggy guarda os seus dados bancários na sua conta Meu Pluggy). Consentimentos separados e revogáveis (Pluggy, localização para clima, ciclo menstrual); "Apagar tudo" apaga o banco, os backups gerados pelo app e as credenciais; exportação em JSON/CSV. *Isto não é parecer jurídico.*

---

## 5. Requisitos não funcionais
| Categoria | Meta |
|---|---|
| Navegadores | Chrome, Edge, Firefox atuais no PC; Chrome ou Safari no celular |
| Desempenho | Telas abrem em < 1 s pela rede Tailscale com o PC ligado; Lighthouse ≥ 90 em Acessibilidade e Boas Práticas |
| Acessibilidade | WCAG 2.2 AA; teclado; leitor de tela; zoom 200%; alvos ≥ 44 × 44 px (ver DS.md) |
| Idioma | PT-BR |
| Qualidade | Cobertura ≥ 80% em `src/domain`; testes de integração das rotas; CI verde para merge |
| Licença | Código Apache-2.0; dados do wger com a licença Creative Commons de cada item |

## 6. Pré-requisitos
| Item | Detalhe |
|---|---|
| Sistema | Windows 10/11 (também roda em macOS e Linux) |
| Node.js | LTS atual, com pnpm |
| Git e GitHub | Conta com 2FA e e-mail anônimo nos commits |
| Tailscale | Conta gratuita; app no PC e no celular |
| Opcional | Contas Meu Pluggy e Dashboard Pluggy (grátis) |

## 7. Métricas de sucesso
- Usar a V1 por 2 semanas no dia a dia, no PC e no celular fora de casa.
- Lançar um gasto pelo celular em ≤ 10 s.
- Portfólio: README claro, ADRs, CI verde, TUTORIAL que você consegue seguir do zero numa conta de teste.

## 8. Riscos
| Risco | Impacto | Mitigação |
|---|---|---|
| PC desligado ou dormindo quando você precisa no celular | Médio | Ajuste de energia e início automático (TUTORIAL); limite conhecido da V1 |
| Perder o PC ou o disco sem backup | Alto | Backup automático em `backups/` + cópia semanal no pendrive |
| Senha esquecida | Alto | Aviso claro na criação; sem senha, o banco não abre (é o preço da cifra) |
| Malware no PC | Alto | Fora do alcance do app; Windows atualizado e antivírus; banco cifrado protege só com o servidor bloqueado |
| Expor o servidor sem querer (porta aberta, Funnel) | Alto | SEC-03 e verificação no checklist da etapa 4 |
| Biblioteca de SQLite cifrado não funcionar bem com o ORM | Médio | Spike na etapa 2; plano B: SQL puro com o driver cifrado |
| Pluggy mudar regras ou limites | Médio | OFX/CSV e lançamento manual continuam funcionando |
| Escopo grande | Alto | P1 só depois de todos os P0 |

## 9. Questões em aberto
1. Driver de SQLite cifrado + ORM (spike da etapa 2).
2. Configuração exata do Tailscale Serve com HTTPS no Windows (spike da etapa 4).
3. Endpoint e paginação de transações da Pluggy (spike da etapa 6).
4. Licença da lista de municípios do IBGE (etapa 8).
