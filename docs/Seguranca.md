# Solis V1: segurança e privacidade

> 16/10/2026 · Complementa a [PRD.md](PRD.md) §4 · A análise anterior, feita para a V2 (site no navegador), está em `Solis_V2/docs/Seguranca.md`; o que se aplica à V1 foi trazido para cá.

## 1. Resumo
Na V1, o risco muda de lugar: em vez de tudo ficar no navegador, existe um **servidor no seu PC** que guarda os dados e é acessado pelo celular. As cinco proteções principais:

1. **Servidor invisível na internet:** escuta só em `127.0.0.1`; o celular chega pela rede privada do Tailscale, com HTTPS. O Funnel (que exporia na internet) fica desligado.
2. **Banco cifrado:** se alguém copiar o arquivo ou levar o PC desligado, não lê nada sem a senha.
3. **Login forte:** frase-senha, limite de tentativas, sessão curta em cookie protegido.
4. **Chave da Pluggy só no servidor:** nunca vai para o navegador, como a própria Pluggy recomenda.
5. **Repositório sem rastro seu:** e-mail anônimo nos commits, gitleaks, `data/` e `backups/` fora do Git, CI sem segredos.

## 2. Quem pode atacar e como
| # | Atacante | Exemplo |
|---|---|---|
| A1 | Quem varre repositórios públicos | Procura e-mail, chaves, extratos e o endereço do seu PC no GitHub |
| A2 | Quem pega seu celular desbloqueado | Abre o Solis na tela inicial |
| A3 | Quem rouba ou acessa o seu PC | Copia o arquivo do banco ou os backups |
| A4 | Malware no PC | Lê a memória do servidor enquanto está desbloqueado |
| A5 | Quem toma sua conta do Tailscale ou do GitHub | Adiciona um aparelho à sua rede ou publica código malicioso |
| A6 | Quem controla texto que entra no app | Descrição de transação ou extrato com conteúdo malicioso |

## 3. Riscos e proteções
| ID | Sev. | Risco | Proteção | Requisito |
|---|---|---|---|---|
| R01 | Alta | Servidor exposto na rede local ou na internet (porta aberta, `0.0.0.0`, Funnel ligado) | Escuta só em `127.0.0.1`; acesso remoto só pelo `tailscale serve`; Funnel desligado; teste com `netstat` no checklist | SEC-03 |
| R02 | Alta | Identidade ou dados no repositório: e-mail nos commits, prints com valores, extratos de teste, o endereço `*.ts.net` (mostra o nome do PC e da sua rede), arquivos de `data/` | E-mail noreply; gitleaks com regra de CPF; `.gitignore` já criado; fixtures sintéticas; modo demonstração para prints; checklist da etapa 11 | SEC-10 |
| R03 | Alta | Cópia do banco ou dos backups (PC roubado, disco levado, pendrive perdido) | SQLite cifrado com chave derivada por scrypt; backups são cópias do arquivo cifrado | SEC-01, SEC-14 |
| R04 | Alta | Senha fraca permite quebrar o banco copiado | Frase-senha com mínimo (zxcvbn-ts); scrypt com parâmetros da OWASP | SEC-02 |
| R05 | Alta | Chave da Pluggy roubada | Fica só no servidor, dentro do banco cifrado; nunca enviada ao navegador; campo só de escrita; `apiKey` só em memória; roteiro de revogação | SEC-08 |
| R06 | Média | Celular perdido ou desbloqueado por outra pessoa | Sessão expira após 30 min parado; "Sair de todos os aparelhos"; remover o aparelho no painel do Tailscale | SEC-04, SEC-13 |
| R07 | Média | Força bruta no login pela rede Tailscale | Limite de tentativas e atraso progressivo | SEC-02 |
| R08 | Média | Requisição forjada a partir de outro site aberto no celular | Cookie `SameSite=Strict` + conferência do `Origin` | SEC-04, SEC-06 |
| R09 | Média | XSS por texto de terceiros (descrição de transação, extrato) | React escapa por padrão; `dangerouslySetInnerHTML` proibido por lint; CSP enviada pelo servidor (agora com `frame-ancestors 'none'`, que funciona em cabeçalho) | SEC-05, SEC-07 |
| R10 | Média | Injeção no banco | Consultas sempre parametrizadas; validação de entrada por esquema em cada rota | SEC-07 |
| R11 | Média | Arquivo OFX/CSV malicioso; fórmula maliciosa no CSV exportado | Limite de tamanho, parser sem execução; apóstrofo antes de `=`, `+`, `-`, `@` na exportação | SEC-12 |
| R12 | Média | Conta do Tailscale tomada: um aparelho estranho entra na sua rede | Login com 2FA no provedor; revisar aparelhos no painel; mesmo dentro da rede, o Solis exige a senha | SEC-13 |
| R13 | Média | Dependência comprometida | Lockfile, Dependabot, CodeQL, poucas dependências; actions fixadas por SHA | SEC-11 |
| R14 | Baixa | Logs do servidor com dados pessoais | Valores, descrições e credenciais mascarados; nada de log de corpo de requisição | SEC-09 |
| R15 | Fora do alcance | Malware com acesso ao seu PC enquanto o Solis está desbloqueado | O app não consegue se defender de quem controla o sistema. Proteção: Windows atualizado, antivírus, conta do Windows com senha | — |

## 4. Herdado da análise da V2 (continua valendo)
- Nenhum dado pessoal nos documentos (varredura de 16/10/2026).
- O "CPF" inventado por um modelo de I.A. nos testes foi removido do relatório.
- Os PDFs dos termos da Pluggy ficam fora do Git (`referencias/` no `.gitignore`), porque os termos proíbem republicar os textos.
- O Git da sua máquina ainda não tem e-mail configurado: configurar o noreply na etapa 0.

## 5. O que muda em relação à V2
- **Melhor na V1:** a chave da Pluggy fica no servidor (prática recomendada pela Pluggy); a CSP vai por cabeçalho e bloqueia iframes de verdade; não existe risco de "mesma origem" do GitHub Pages; não há arquivos na nuvem para proteger contra versões antigas.
- **Novo na V1:** existe um servidor, então aparecem login, sessão, força bruta, requisição forjada e exposição de porta (R01, R06–R08).

## 6. O que não foi verificado
- Comportamento do `better-sqlite3-multiple-ciphers` com o Drizzle ORM (spike da etapa 2).
- Configuração exata do `tailscale serve` com HTTPS no Windows (spike da etapa 4).
