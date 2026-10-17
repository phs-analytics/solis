# Monte o seu Solis (V1)

> Versão 1.0 · 16/10/2026 · Este tutorial cresce junto com o projeto: as partes marcadas com "(escrita na etapa N)" ganham o passo a passo quando a etapa do [PI.md](PI.md) for implementada.

## Antes de começar
**O que você vai ter:** o Solis rodando no seu computador, com os seus dados cifrados, e acessível pelo celular de qualquer lugar (dados móveis ou outro Wi-Fi), por uma rede privada que só os seus aparelhos enxergam.

**Quanto custa:** nada.

**O que precisa ficar ligado:** o computador. Se ele desligar ou dormir, o celular não acessa até ele voltar.

**Regras de ouro**
1. Nunca coloque no repositório senha, chave, extrato, print com dados reais, o conteúdo de `data/` ou de `backups/`, nem o endereço `*.ts.net` do seu computador.
2. Não ligue o **Tailscale Funnel**: ele colocaria o Solis na internet pública.
3. Os nomes de menus dos sites mudam com o tempo. Se algum não bater, procure o mais parecido.

**Índice**
1. Preparar o computador
2. Seu repositório no GitHub (seguro)
3. Instalar e iniciar o Solis (escrita na etapa 2)
4. Design System (escrita na etapa 3)
5. Acessar pelo celular com o Tailscale
6. Finanças e importação de extratos (escrita na etapa 5)
7. Conectar seus bancos (Meu Pluggy)
8. Agenda e `.ics` (escrita na etapa 7)
9. Saúde e exercícios (escrita na etapa 8)
10. Assistente (escrita na etapa 9)
11. Backup e restauração
12. Manter o Solis ligado
13. Celular ou computador perdido
14. Problemas comuns

---

## 1. Preparar o computador
1. **Node.js:** baixe a versão **LTS** em nodejs.org e instale. Confira:
   ```bash
   node -v
   ```
2. **pnpm:**
   ```bash
   corepack enable
   ```
   Se o comando não existir na sua versão do Node:
   ```bash
   npm install -g pnpm
   ```
3. **Git:** instale pelo git-scm.com e confira:
   ```bash
   git --version
   ```
4. **VS Code** com as extensões ESLint e Prettier.

## 2. Seu repositório no GitHub (seguro)
1. Ative a verificação em duas etapas: **Settings › Password and authentication**.
2. Em **Settings › Emails**, marque **Keep my email addresses private** e **Block command line pushes that expose my email**. Copie o endereço `...@users.noreply.github.com`.
3. Configure o Git com ele:
   ```bash
   git config --global user.email "SEU-ENDERECO@users.noreply.github.com"
   ```
   ```bash
   git config --global user.name "Seu nome ou apelido público"
   ```
4. Faça um **Fork** do repositório do Solis (ou clone e crie o seu). No seu repositório, em **Settings › Code security**, ligue *Secret scanning*, *Push protection*, *Dependabot* e *CodeQL*.
5. Clone e instale:
   ```bash
   git clone https://github.com/SEU-USUARIO/solis.git
   ```
   ```bash
   cd solis
   ```
   ```bash
   pnpm install --frozen-lockfile
   ```

## 3. Instalar e iniciar o Solis (escrita na etapa 2)
Resumo: `pnpm start` liga o servidor no seu computador. No primeiro acesso você cria uma **frase-senha** (por exemplo, quatro palavras aleatórias). Ela cifra o banco: **se esquecer, os dados não abrem mais**, nem para você.

## 4. Design System (escrita na etapa 3)

## 5. Acessar pelo celular com o Tailscale
O Tailscale cria uma rede privada entre os seus aparelhos. O Solis continua invisível na internet; só quem está na sua rede chega até ele, e mesmo assim precisa da senha.

1. Crie a conta em **tailscale.com** (plano Personal, grátis) usando um login que tenha verificação em duas etapas.
2. Instale o Tailscale **no computador** e entre com essa conta.
3. Instale o app do Tailscale **no celular** (loja do seu celular) e entre com a mesma conta.
4. No painel do Tailscale (login.tailscale.com), confira que os dois aparelhos aparecem como conectados.
5. No painel, na página de DNS, ative **MagicDNS** e **HTTPS Certificates** (necessários para o endereço com HTTPS).
6. No computador, com o Solis ligado, publique-o **só dentro da sua rede** (o comando exato e a porta ficam confirmados na etapa 4):
   ```bash
   tailscale serve --bg 3000
   ```
7. O Tailscale mostra um endereço do tipo `https://nome-do-pc.sua-rede.ts.net`. Abra esse endereço no celular, **com o app do Tailscale ligado**.
8. No celular, use **"Adicionar à tela inicial"** para abrir o Solis como um app.

**Confira a segurança**
- Desligue o Wi-Fi do celular (só dados móveis): o Solis deve abrir.
- Desligue o app do Tailscale no celular: o endereço **não** deve abrir.
- No painel do Tailscale, confira que o **Funnel está desligado**.
- **Não publique** o endereço `*.ts.net`: ele mostra o nome do seu computador e da sua rede.

## 6. Finanças e importação de extratos (escrita na etapa 5)
Resumo: lançamentos em 3 toques, contas a pagar, metas e importação de extratos OFX/CSV baixados no site do seu banco. Os extratos ficam fora do Git.

## 7. Conectar seus bancos (Meu Pluggy)
**O que você ganha:** saldos e extratos aparecem sozinhos, 1× por dia (com o PC ligado) e quando você abre o app.
**Limites do gratuito:** só as suas contas, até 5 conexões, sem garantia de funcionamento.

1. Crie a conta em **meu.pluggy.ai** e conecte os seus bancos (a autorização acontece no app do banco).
2. Crie a conta em **dashboard.pluggy.ai** e crie **uma** aplicação. Copie o **Client ID** e o **Client Secret**.
3. No Dashboard, habilite o conector **"MeuPluggy"** e crie a conexão (sem isso, a API devolve lista vazia).
4. Anote o **ID do item de cada banco** no Dashboard.
5. No Solis: **Finanças › Conectar banco**, cole o Client ID, o Client Secret e os IDs, e toque em **Testar**.

O Client Secret fica guardado **só no servidor do seu PC**, dentro do banco cifrado, e nunca aparece de novo na tela. Para cortar o acesso, troque ou apague o Client Secret no Dashboard da Pluggy.

## 8. Agenda e `.ics` (escrita na etapa 7)
Resumo: tarefas, Kanban e calendário; importe e exporte `.ics` para usar com o Google Agenda, Outlook ou o calendário do celular.

## 9. Saúde e exercícios (escrita na etapa 8)
Resumo: água, treinos, sono, humor e ajuda sempre visível (CVV 188). A biblioteca de exercícios vem do wger, com crédito ao autor de cada item.

## 10. Assistente (escrita na etapa 9)
Resumo: responde perguntas como "quanto posso gastar hoje?" por regras, com os seus dados, sem I.A. generativa.

## 11. Backup e restauração
- O Solis guarda cópias do banco cifrado em `backups/` (escrita na etapa 10).
- **Toda semana, copie o backup mais recente para um pendrive.** Se o PC quebrar, é isso que salva os seus dados.
- Para restaurar: pare o Solis, troque o arquivo em `data/` pelo backup, inicie de novo e entre com a senha da época do backup.

## 12. Manter o Solis ligado
- **Não deixar o PC dormir:** Configurações do Windows › Sistema › Energia › Suspensão: "Nunca" quando estiver na tomada.
- **Iniciar junto com o Windows:** Agendador de Tarefas › Criar tarefa básica › "Ao fazer logon" › Iniciar programa: o script `scripts/start` (detalhado na etapa 4).
- O Tailscale já inicia sozinho com o Windows.

## 13. Celular ou computador perdido
1. **Tailscale:** no painel, remova o aparelho perdido.
2. **Solis:** em outro aparelho, Configurações › "Sair de todos os aparelhos".
3. **Pluggy:** no Dashboard, troque o Client Secret e atualize no Solis.
4. **Senha:** troque a senha do Solis.
5. Se foi o **computador**: os dados estão cifrados; restaure o último backup do pendrive em outro PC.

## 14. Problemas comuns
| Problema | Causa provável | Solução |
|---|---|---|
| Celular não abre o endereço `.ts.net` | App do Tailscale desligado no celular, ou PC desligado/dormindo | Ligue o Tailscale no celular; confira o PC |
| Erro de certificado HTTPS | HTTPS Certificates não ativado no painel do Tailscale | Parte 5, passo 5 |
| Pluggy devolve lista vazia | Conector "MeuPluggy" não habilitado | Parte 7, passo 3 |
| Erro 403 ao listar bancos | Contas Meu Pluggy não listam itens | Use os IDs dos itens (parte 7, passo 4) |
| "Muitas tentativas" no login | Limite de tentativas atingido | Espere alguns minutos e tente de novo |
| Commit bloqueado pelo gitleaks | Algo parecido com chave ou CPF | Remova o dado; se for falso positivo, troque por um valor obviamente fictício |
