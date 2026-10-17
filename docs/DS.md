# Solis: DS (Design System)

> Versão 1.0 · 16/10/2026 · Referências: [PRD.md](PRD.md), [PI.md](PI.md)
> **Solis V1:** este Design System é o mesmo da V2 (pasta `Solis_V2/docs`). Na V1 ele vale igual, com duas simplificações: efeitos de vidro e brilho são opcionais (a etapa 3 do PI começa pela versão sem blur) e não há modo offline. As menções a "PWA offline" e "service worker" não se aplicam à V1.
> v1.0: versão só web: tokens viram variáveis CSS, componentes React, `px`/`rem` no lugar de `dp`/`sp`, `backdrop-filter` no lugar do Haze, View Transitions no lugar do SharedTransition.
> v0.3: plataformas = APK + web (o computador usa o navegador). "Desktop" virou "tela larga / navegador no computador".
> v0.2: análise das referências refeita com base no relatório de UI/UX; sub-paletas, ocultar valores, sparkline, skeleton, checkbox animado e SwipeRow.
> Implementação: tokens em variáveis CSS e componentes React (PI etapa 3).

---

## 1. Análise das referências

### 1.1 Fonte desta análise
Esta seção usa o **"Relatório Aprofundado: Estilo Gráfico, Cores e Funcionalidade em UI/UX"**, que você enviou em 16/10/2026, com a dissecação das referências do Figma e do Instagram. Os valores citados (hex, raios, blur) vêm desse relatório. Na coluna "Decisão no Solis" está o que adoto, adapto ou descarto e por quê. O público, os celulares de entrada e a acessibilidade pesam mais que copiar a referência.

### 1.2 Referências estáticas (Figma)
| Referência | O que o relatório extraiu | Decisão no Solis |
|---|---|---|
| **E-commerce & Varejo** | Design "invisível" focado em conversão; fundo `#FFFFFF`/`#F8F9FA`; sombra muito suave (Y 10, blur 30, 5%); CTA preto ou cor vibrante; fontes geométricas (Inter, Poppins, Montserrat); **barra de ação fixa no rodapé** ao alcance do polegar; seletores em *chips* | **Adoto:** barra de ação fixa no rodapé em telas de formulário (lançar gasto, nova tarefa) e chips para categorias/filtros. **Adapto:** a sombra suave vira a sombra do tema claro (§4.3). **Descarto:** CTA preto, porque a cor de ação do Solis é o âmbar `sol.500` |
| **Meditação & Pill Reminder** | *Soft UI* empática; gradientes pastel (azul `#A3C4F3`, lavanda `#CDB4DB`, pêssego `#FFC8DD`); cores "candy" para categorizar sem alarmar; raio de 16–32 px; cards expansíveis que viram player com anel de progresso; **checkbox grande que risca o texto com animação** | **Adoto:** paleta pastel como **sub-paleta da Saúde Mental** (§2.5); raios altos (§4.2 já usa 12–28 px); checkbox grande com risco animado para tarefas, contas pagas e água (§6.3). Cores "candy" para categorias de gasto, que diferenciam sem parecer alerta |
| **Agendamento & Dashboards** | *Data-Driven UI*; fundo `#F4F7FE` com cards brancos; semântica verde/amarelo/azul; grade de 8 pt; menu lateral fixo + área rolável; **blocos de calendário arrastáveis cuja altura = duração** | **Adoto:** fundo azulado `#F4F7FE` no tema claro (§2.3); menu lateral fixo no navegador do computador (já previsto como menu lateral); blocos com altura proporcional à duração na visão semanal da Agenda. **Adapto:** a grade de 4 px continua; é compatível com 8 pt, porque todos os tokens principais são múltiplos de 8, menos `xs` |
| **Cripto & Finanças Tech** | *Tech Dark Mode*; superfícies `#0A0A0A`/`#1A1A1A`/`#242424`; verde neon `#00E676` (ganho) e vermelho `#FF3B30` (perda); **sparklines** com gradiente embaixo; **saldo grande com ícone de olho para ocultar**; lista ordenável com variação alinhada à direita | **Adoto:** sparklines nos cards de conta e na linha do tempo de gastos; **botão de olho para ocultar valores**, importante para quem usa o celular perto de outras pessoas ou divide o aparelho; variação alinhada à direita. **Adapto:** o fundo continua `#0E1020` (azul-noite, mais quente que preto puro, com a mesma separação de camadas). **Descarto:** vermelho em cada despesa (§2.4: vermelho só em alerta, para não gerar ansiedade) |
| **Glassmorphism & Neon (Infográfico)** | Fundo com formas/gradientes intensos; card branco 10%; *backdrop blur* 20–40 px; **borda interna de 1 px com degradê** simulando a quina do vidro; sombra neon na cor do elemento (blur 25 px, 60%) | **Adoto:** receita do vidro (§5.1) com fill 8–10%, blur 20–30 px e borda em degradê. **Adapto:** sombra neon a 30–40% em vez de 60%, e só um elemento por tela. A 60%, o brilho espalha cor sobre o texto vizinho e reduz o contraste. Em celular fraco: sem blur e sem glow (fallback "flat") |

### 1.3 Referências dinâmicas (Instagram): comportamento
| Padrão do relatório | Como funciona | Onde entra no Solis | Seção |
|---|---|---|---|
| **Transição de elemento compartilhado (Hero / Shared Axis)** | O card tocado se expande e vira o cabeçalho da nova tela, sem "deslizar" | Card de conta → extrato; card de meta → detalhe da meta; card de tarefa → edição; widget de água → histórico | §6.3 |
| **Micro-interação de feedback** | O ícone encolhe e "explode" com mola ou confete ao confirmar | Concluir tarefa, marcar conta como paga, bater a meta de água, atingir meta financeira | §6.3, §6.4 |
| **Skeleton loaders** | Blocos cinza cintilantes no formato do conteúdo, no lugar de tela branca | Clima, taxas (Selic/CDI), sincronização bancária, primeiro carregamento da Home | §5.9 |
| **Gestos de swipe com física de mola** | Arrastar a linha revela ações ("Excluir" vermelho, "Arquivar" amarelo). Soltar no meio volta com ricochete; arrastar até o fim executa | Lista de gastos, lista de tarefas, contas a pagar | §5.11, §6.3 |

**Ressalva de acessibilidade sobre gestos:** toda ação escondida em swipe precisa existir também num menu visível (toque longo ou botão "⋯"). Leitores de tela não executam swipe e muita gente não descobre o gesto sozinha. Ações destrutivas disparadas por swipe completo mostram **"Desfazer"** por 5 s em vez de pedir confirmação.

### 1.4 Síntese de direção visual
**"Sol à noite":** fundo escuro profundo, painéis de vidro translúcido, um sol âmbar como cor da marca e acentos neon por módulo. Interface limpa, números grandes, texto curto. A gamificação aparece em metas, sequências e celebrações, sem virar jogo e sem punir quem "falhou".

Três regras que mandam sobre a estética:
1. **Legibilidade vem antes do efeito.** Vidro e neon nunca ficam atrás de texto pequeno sem uma camada sólida de contraste.
2. **Aparelho fraco recebe a versão "flat"** do mesmo visual (sem blur, sem brilho animado), e ela precisa continuar bonita.
3. **Cor nunca é a única informação.** Positivo/negativo sempre tem ícone e texto junto.

---

## 2. Cores

### 2.1 Tokens de marca
| Token | Hex | Uso |
|---|---|---|
| `sol.500` | `#FFB547` | Cor da marca, CTA primário (no tema escuro), destaques |
| `sol.700` | `#9A5B00` | Versão da marca para texto/ícone no tema claro |
| `neon.cyan` | `#3EE6E0` | Finanças |
| `neon.violet` | `#8B7CFF` | Agenda |
| `neon.coral` | `#FF7A90` | Saúde |
| `neon.green` | `#5CF2A0` | Conquistas, metas atingidas |

### 2.2 Tema escuro (padrão)
| Token | Hex | Uso |
|---|---|---|
| `bg` | `#0E1020` | Fundo da tela |
| `bg.gradient` | `#0E1020 → #1A1240` (diagonal) | Fundo atrás dos cards de vidro |
| `surface` | `#171A2E` | Cards sólidos, versão "flat" do vidro |
| `surface.high` | `#21253D` | Sheets, menus, diálogos |
| `glass.fill` | `#FFFFFF` a 8% | Preenchimento do vidro |
| `glass.border` | `#FFFFFF` a 14% | Borda de 1 px do vidro |
| `text.primary` | `#F4F5FA` | Texto principal |
| `text.secondary` | `#A9AEC7` | Texto de apoio |
| `text.onSol` | `#1A1300` | Texto sobre botão `sol.500` |
| `positive` | `#34D399` | Status Positivo, receitas |
| `neutral` | `#FBBF24` | Status Neutro, atenção |
| `negative` | `#F87171` | Status Negativo, despesas, erros |
| `outline` | `#3A3F5C` | Divisores, bordas de campo |

### 2.3 Tema claro
| Token | Hex | Uso |
|---|---|---|
| `bg` | `#F4F7FE` | Fundo (azul-acinzentado da referência de Dashboards: separa bem os cards brancos) |
| `surface` | `#FFFFFF` | Cards |
| `glass.fill` | `#FFFFFF` a 70% | Vidro claro |
| `glass.border` | `#14162B` a 8% | Borda do vidro |
| `text.primary` | `#14162B` | Texto principal |
| `text.secondary` | `#50556E` | Texto de apoio |
| `primary` | `#9A5B00` (texto) / `#FFB547` (fundo do botão, com texto `#1A1300`) | CTA |
| `positive` | `#047857` | |
| `neutral` | `#92400E` | |
| `negative` | `#B91C1C` | |

### 2.4 Regras
- Todo par texto/fundo precisa de contraste **≥ 4.5:1** (texto normal) e **≥ 3:1** (texto ≥ 18 px/negrito 14 px, ícones e bordas de componentes), conforme WCAG 2.2 AA. **Os valores acima são proposta e serão medidos na etapa 3 do PI**. Qualquer par que falhar será ajustado ali.
- Neon (cyan, violet, coral) é para **acentos**: bordas, ícones, gráficos, brilho. Texto corrido em neon só sobre `bg`/`surface` escuros e em tamanho ≥ 18 px.
- Sobre vidro, o texto fica sempre em `text.primary`. Se o fundo atrás do vidro for claro/variável, adicionar um *scrim* `bg` a 40%.
- Valores monetários: receita `positive` + sinal "+"; despesa `text.primary` + sinal "−" (vermelho só para alertas, para não transformar a lista inteira num mar vermelho e gerar ansiedade).

### 2.5 Sub-paletas (do relatório de referências)
**Saúde Mental (Soft UI, referência Meditação).** Usada só nas telas de humor, sono, terapia e lazer, para baixar o tom em relação ao neon do resto do app.
| Token | Hex | Uso |
|---|---|---|
| `calm.blue` | `#A3C4F3` | Sono |
| `calm.lavender` | `#CDB4DB` | Humor, terapia |
| `calm.peach` | `#FFC8DD` | Lazer |
| `calm.gradient` | `#A3C4F3 → #CDB4DB → #FFC8DD` | Fundo do cabeçalho da Saúde Mental (tema escuro: a 20% sobre `bg`) |

- São cores claras: no tema claro servem de **fundo** com texto `text.primary` por cima, nunca como cor de texto sobre branco (o contraste fica baixo).

**Categorias de gasto ("candy", referência Pill Reminder).** Diferenciam categorias sem parecer alerta. Usadas como fundo do ícone da categoria (círculo de 40 px), com o ícone em `text.primary` escuro.
| Categoria | Hex |
|---|---|
| Mercado | `#B8F2C9` |
| Transporte | `#BFD7FF` |
| Casa (luz, água, gás, aluguel) | `#FFE3A3` |
| Celular/Internet | `#D9C8FF` |
| Saúde | `#FFC9C9` |
| Lazer | `#FFD6EC` |
| Família/Pix | `#C9F1F5` |
| Outros | `#E2E4EE` |

---

## 3. Tipografia

| Papel | Fonte | Licença | Motivo |
|---|---|---|---|
| Títulos e números de destaque | **Plus Jakarta Sans** | SIL OFL 1.1 | Geométrica, moderna, combina com o estilo clean/neon |
| Texto e interface | **Atkinson Hyperlegible** | SIL OFL 1.1 | Criada pelo Braille Institute para leitores com baixa visão; diferencia bem I/l/1 e O/0 |

- Embutidas no próprio site (`public/fonts`, carregadas por `@font-face`), sem Google Fonts por CDN; funcionam offline. Conferir as licenças no Google Fonts antes de incluir e adicionar os arquivos de licença em `licenses/`.
- **Números sempre com algarismos tabulares** (`fontFeatureSettings = "tnum"`) em saldos, tabelas e contadores, para não "pularem" quando animam.
- Tipografia em `rem` (1 rem = 16 px com a fonte padrão), para respeitar o tamanho de fonte e o zoom do navegador (até 200%). Os valores em px abaixo são a referência com a fonte padrão.

### Escala
| Token | Fonte | Tamanho / Altura de linha | Peso | Uso |
|---|---|---|---|---|
| `display` | Jakarta | 40 / 48 px | 700 | Saldo principal |
| `headline` | Jakarta | 28 / 36 px | 700 | Título de tela |
| `title` | Jakarta | 20 / 28 px | 600 | Título de card |
| `bodyLarge` | Atkinson | 18 / 26 px | 400 | Texto principal (padrão do app) |
| `body` | Atkinson | 16 / 24 px | 400 | Texto secundário |
| `label` | Atkinson | 16 / 20 px | 700 | Botões, chips |
| `caption` | Atkinson | 14 / 20 px | 400 | Legendas. **Tamanho mínimo do app** |

> O corpo padrão é 18 px, acima do comum (14–16), de propósito: parte do público lê com dificuldade ou usa telas pequenas e de baixa qualidade.

---

## 4. Espaçamento, forma e profundidade

### 4.1 Espaçamento (grade de 4 px)
| Token | px | Uso |
|---|---|---|
| `xs` | 4 | Ícone ↔ texto |
| `sm` | 8 | Entre itens relacionados |
| `md` | 16 | Padding interno de card, margem lateral da tela |
| `lg` | 24 | Entre cards / seções |
| `xl` | 32 | Topo de tela, respiro antes de CTA |
| `xxl` | 48 | Separação de blocos grandes |

- Margem lateral: 16 px no celular; no navegador do computador (tela larga), conteúdo com largura máxima de 840 px centralizado (Kanban pode usar a largura toda).
- Alvo de toque mínimo **44 × 44 px** (meta de 48 × 48 px), com 8 px entre alvos.

### 4.2 Raios
| Token | px | Uso |
|---|---|---|
| `r.sm` | 8 | Chips, campos |
| `r.md` | 12 | Botões, cards do Kanban |
| `r.lg` | 20 | Cards de vidro, cards da Home |
| `r.xl` | 28 | Bottom sheets (cantos superiores), FAB do bot |
| `r.full` | 50% | Avatares, anéis, toggles |

### 4.3 Profundidade
- Sem sombras pesadas no tema escuro: a profundidade vem de **camadas de luminosidade** (`bg` → `surface` → `surface.high`) e da borda do vidro.
- Brilho neon (glow): sombra colorida difusa, 16–24 px de raio, 30–40% de opacidade, só em **um elemento por tela** (ex.: o card de saldo, o FAB do bot). Desligado em aparelho fraco (`data-tier="low"`).
- Tema claro: sombra suave `y=2 px, blur=8 px, #14162B a 8%`.

---

## 5. Componentes

Todo componente tem estes estados documentados no catálogo (PI etapa 3): normal, pressionado, foco (teclado, na web), desabilitado, carregando, erro, claro/escuro, fonte 200%.

### 5.1 GlassCard
- Fundo: blur de 20–30 px do conteúdo de trás (`backdrop-filter: blur()` do CSS), `glass.fill`, raio `r.lg`, padding `md`.
- Borda de 1 px **em degradê** (branco 24% no canto superior esquerdo → 4% no inferior direito, `linear-gradient` num pseudo-elemento), que simula a luz batendo na quina do vidro, como no relatório.
- **Fallback (aparelho fraco, navegador sem suporte a `backdrop-filter`, `prefers-reduced-transparency` ou "Reduzir efeitos" ligado):** sem blur, fundo `surface` sólido + mesma borda. Visualmente quase igual, custo zero de GPU.
- Um leve gradiente linear (branco 6% → 0%) do topo para baixo simula o reflexo do vidro.

### 5.2 Botões
| Variante | Visual | Uso |
|---|---|---|
| Primário | Fundo `sol.500`, texto `text.onSol`, raio `r.md`, altura 56 px | Uma ação principal por tela |
| Secundário | Borda 1,5 px `sol.500`, texto `sol.500` (escuro) / `sol.700` (claro) | Ações alternativas |
| Fantasma | Só texto, sublinhado no foco | Ações terciárias ("Pular") |
| Perigo | Fundo `negative`, texto branco/escuro conforme contraste | "Apagar tudo" |
| Ícone | 48 × 48 px, ícone 24 px, sempre com `aria-label` | Barras de ferramenta |

- Rótulos sempre com verbo e em sentence case: "Salvar gasto", não "OK".
- Pressionado: escala 0.96 + leve escurecimento (ver §6). Carregando: rótulo vira indicador e o botão mantém a largura.

### 5.3 StatCard (números de destaque)
- Rótulo (`caption`) → valor (`display`/`headline`, tabular) → variação com ícone ▲/▼ + texto ("12% a mais que semana passada").
- Status financeiro: chip com ícone + palavra (**Positivo / Neutro / Negativo**) + cor. Nunca só a cor.
- **Ocultar valores (ícone de olho):** no card de saldo da Home e no topo de Finanças. Ao ocultar, todos os valores do app viram `R$ ••••`, e a escolha fica salva. O leitor de tela lê "valor oculto". Útil para quem abre o app no ônibus ou divide o celular.
- **Sparkline:** minigráfico de linha sem eixos (7 ou 30 pontos), 2 px de espessura, com gradiente da cor do módulo a 24% → 0% embaixo da linha. É decorativo para o leitor de tela, que lê só o resumo ("subiu 12% na semana").
- Listas de contas/ativos: nome e ícone à esquerda; valor e variação **alinhados à direita**, com algarismos tabulares.

### 5.4 Progresso (metas, água, sequência)
- `ProgressBar`: altura 12 px, raio total, trilha `outline`, preenchimento com gradiente da cor do módulo; porcentagem em texto ao lado ("64%").
- `ProgressRing`: para água e treino; espessura 10 px; valor no centro ("1,2 de 2 L").
- Ao atingir 100%: celebração (§6.4).

### 5.5 Kanban
- **Coluna:** cabeçalho com nome + contador ("Fazendo · 3"), cor de acento por coluna (A Fazer `text.secondary`, Fazendo `neon.violet`, Revisão `neutral`, Concluído `positive`).
- **Card:** `surface`, raio `r.md`, padding 12 px; título (2 linhas máx.), chip de área, prazo com ícone (vermelho + ícone de alerta se atrasado), ícone de calendário se vier de evento externo.
- Tela estreita (celular): colunas em pager horizontal com abas no topo. Tela larga (navegador no computador): 4 colunas lado a lado, 280–320 px cada.
- Arrastar: toque longo (300 ms) → card "levanta" (§6.3). Sempre existe o menu **"Mover para…"** como alternativa acessível.
- Coluna vazia: texto curto de estado vazio ("Nada aqui. Arraste uma tarefa ou toque em +").

### 5.6 Campos
- `SolisTextField`: altura ≥ 56 px, rótulo sempre visível (não só placeholder), mensagem de erro em texto + ícone.
- **Campo de dinheiro:** teclado numérico, preenchimento da direita para a esquerda (digitar "1250" → "R$ 12,50"), valor em `display`.
- Grade de categorias: ícones 32 px sobre círculo "candy" (§2.5) + rótulo, 4 por linha no celular.
- **Barra de ação fixa no rodapé** (referência E-commerce): em formulários (lançar gasto, nova tarefa, nova meta), o botão primário fica preso acima do teclado/rodapé, sempre ao alcance do polegar.
- **Checkbox grande** (32 px visível, 48 px de área de toque) para tarefas, contas e lembretes; ao marcar, o texto é riscado com animação (§6.3).

### 5.7 Navegação
- Celular: `BottomBar` com 4 itens (Início, Agenda, Finanças, Saúde), ícone + rótulo **sempre visíveis**, indicador em pílula na cor do módulo.
- Tela larga (navegador no computador): menu lateral fixo à esquerda.

### 5.8 BotFab e chat da Solis I.A.
- FAB 64 px, raio `r.xl`, gradiente `sol.500 → neon.coral`, ícone de sol/estrela; glow suave (desligado em LOW). Posição: canto inferior direito, acima da barra inferior, sem cobrir CTAs (telas com CTA fixo deslocam o FAB).
- Abre um bottom sheet com até 90% da altura: mensagens em balões (usuário à direita, `surface.high`; bot à esquerda, vidro), chips de sugestão no topo do teclado, indicador "digitando" de três pontos.
- Respostas com números mostram um mini-card (ex.: "Hoje você pode gastar **R$ 23,40**" + botão "Ver detalhes").

### 5.9 Estados vazios, erro e offline
- Ilustração leve (SVG/vetor, nunca imagem pesada) + uma frase + uma ação.
- Offline: faixa discreta "Sem internet. Mostrando dados de DD/MM." Nunca bloqueia a tela.
- **Skeleton loader:** blocos `surface.high` no formato do conteúdo final, com brilho deslizando (1,2 s por ciclo). Só aparece se a carga passar de 300 ms; com "Reduzir movimento", fica estático. Usado em clima, taxas, sincronização bancária e primeira abertura.

### 5.10 Ícones
- Biblioteca: Material Symbols Rounded (Apache 2.0), embutidos como SVG (sem fonte por CDN), traço consistente, 24 px padrão.
- Ícones de categoria com metáforas do dia a dia brasileiro (botijão de gás, ônibus, chip de celular, Pix).

### 5.11 Linha com swipe (SwipeRow)
- Usada em: lista de gastos, lista de tarefas, contas a pagar.
- Arrastar para a **esquerda** revela "Excluir" (fundo `negative`, ícone de lixeira + texto). Arrastar para a **direita** revela a ação positiva do contexto: "Pagar" (contas), "Concluir" (tarefas) ou "Editar" (gastos), com fundo `positive`/`neutral`.
- Limiares: até 40% da largura, soltar volta com mola (§6.3). Passou de 40% ou foi um arremesso rápido: executa.
- Excluir por swipe **não pede confirmação**: mostra snackbar "Gasto excluído · Desfazer" por 5 s.
- Alternativa obrigatória: as mesmas ações no menu de toque longo e no botão "⋯" da linha, e acessíveis por teclado e leitor de tela.
- Implementação: Pointer Events (mouse, toque e caneta) com animação por `transform`; o arrasto nunca é o único caminho para a ação.

---

## 6. Motion (animações e micro-interações)

### 6.1 Princípios
1. **Toda animação tem função:** mostrar de onde algo veio, confirmar uma ação ou indicar progresso. Animação decorativa em loop não entra.
2. **Rápida:** a maioria fica entre 150 e 300 ms. Ninguém espera animação para usar o app.
3. **Interrompível:** gestos e transições usam molas (`spring`) que podem ser interrompidas no meio.
4. **Barata:** animar apenas `transform` e `opacity` (translação, escala, opacidade, rotação). Nunca animar tamanho de layout em listas longas.
5. **Respeita o sistema:** com `prefers-reduced-motion` ligado no sistema ou a opção "Reduzir movimento" do app, tudo vira fade de 100 ms ou corte seco.

### 6.2 Tokens
| Token | Valor | Uso |
|---|---|---|
| `dur.instant` | 100 ms | Feedback de toque, fade reduzido |
| `dur.fast` | 150 ms | Chips, toggles, ícones |
| `dur.base` | 250 ms | Entrada de cards, mudança de aba |
| `dur.slow` | 400 ms | Transição entre telas, bottom sheet |
| `dur.count` | 600–900 ms | Números contando |
| `ease.standard` | `cubic-bezier(0.2, 0, 0, 1)` | Movimentos gerais |
| `ease.exit` | `cubic-bezier(0.3, 0, 1, 1)` | Saídas (mais rápidas que entradas) |
| `spring.snappy` | Mola com amortecimento alto (0,8), sem ricochete visível; biblioteca de animação definida na etapa 3 | Gestos, arrastar, sheets |
| `spring.bouncy` | Mola com ricochete leve (amortecimento ~0,55) | Só celebrações |

### 6.3 Comportamentos por componente
| Elemento | Comportamento |
|---|---|
| Botão / card tocável | Pressionar: escala → 0.96 em `dur.instant`; soltar: volta com `spring.snappy`. Vibração leve (haptic) nas ações de confirmar |
| Entrada da Home | Cards entram em cascata: fade + subir 16 px, `dur.base`, 40 ms de atraso entre cards, máximo 6 cards animados |
| Saldo / números | Contam do valor anterior ao novo (`animateFloatAsState`, `dur.count`), algarismos tabulares. Na primeira abertura não contam do zero; aparecem direto |
| Card → detalhe | Transição de elemento compartilhado (View Transitions API do navegador, com fade onde não houver suporte): o card se expande para virar a tela de detalhe, `dur.slow` |
| Troca de aba | Crossfade + deslocamento de 24 px no sentido da aba, `dur.base` |
| Bottom sheet (bot, lançamento) | Sobe com `spring.snappy`; arrastar para baixo acompanha o dedo e fecha se passar de 30% ou com velocidade alta |
| Kanban: arrastar | Ao levantar: escala 1.04, rotação 2°, sombra/glow aumenta; demais cards abrem espaço com `animateItem()`; ao soltar: assenta com `spring.snappy` + haptic |
| Kanban: mover para Concluído | Check desenhado (path animado, 300 ms) + card desliza para a coluna |
| Lançar gasto | Ao salvar, o valor "voa" para o card de saldo (translação + escala, 400 ms) e o saldo conta até o novo valor |
| Checkbox (tarefa, conta, lembrete) | Marca com escala 0.8 → 1.1 → 1 (`spring.bouncy`, ~250 ms) + haptic; o risco atravessa o texto da esquerda para a direita em 200 ms e o texto vai para `text.secondary` |
| SwipeRow | O fundo de ação aparece proporcional ao arrasto e o ícone cresce de 0.8 → 1 ao cruzar o limiar de 40% (+ vibração curta no limiar, onde o navegador suportar). Soltar antes: volta com uma mola de leve ricochete. Soltar depois: a linha sai pela borda (`dur.base`) e as vizinhas sobem com animação de layout (técnica FLIP) |
| Ícone de olho (ocultar valores) | Valores fazem crossfade para `R$ ••••` em `dur.fast`; nada de animação de contagem ao revelar |
| Sparkline | Ao entrar na tela, a linha é desenhada da esquerda para a direita (path trim, 500 ms, `ease.standard`) |
| Água | Cada toque: o anel avança com `spring.snappy` e uma gota sobe e some (200 ms) |
| Progresso de meta | Barra preenche com `ease.standard`, 600 ms, ao entrar na tela |
| Alerta de limite | Card do alerta faz um único "pulso" de escala (1 → 1.03 → 1), sem piscar em loop |
| Bot digitando | Três pontos com opacidade em onda (loop permitido só enquanto espera resposta) |
| Skeleton loader | Só se a carga passar de 300 ms; ao chegar o conteúdo, crossfade de `dur.fast` do skeleton para o real (detalhes em §5.9) |

### 6.4 Gamificação (sem pressão)
- **Celebração** (meta 100%, 7 dias de treino, semana dentro do orçamento): confete leve (30–40 partículas, 1,2 s, `spring.bouncy`) + mensagem curta. Em aparelho fraco: só o ícone com `spring.bouncy`.
- **Sequências** (dias seguidos de água/treino/registro): mostram o recorde. Quebrar a sequência **não** gera mensagem negativa; a próxima tela diz "Recomeçar é normal. Bora hoje?".
- **Selos simples** (primeiro gasto registrado, primeira meta, 30 dias de uso), guardados localmente.
- Nada de rankings, comparação com outras pessoas ou notificações de culpa.

### 6.5 Orçamento de desempenho
- Meta: 60 fps num celular de entrada; nenhum frame acima de 32 ms nas animações da Home (medir com o painel Performance do Chrome, com redução de CPU ligada, na etapa 3).
- Blur (`backdrop-filter`): no máximo 3 superfícies com blur visíveis ao mesmo tempo; zero em aparelho fraco.
- Glow animado: zero em LOW; no máximo 1 por tela em HIGH.

---

## 7. Acessibilidade e inclusão para o público-alvo

### 7.1 Visual e leitura
- WCAG 2.2 AA como piso (contraste §2.4, alvos ≥ 44 px §4.1).
- Funciona com fonte do sistema até 200%: layouts com `verticalScroll`, nada de altura fixa em card com texto.
- Modo **"Letra grande"** dentro do app (multiplicador 1.3×) para quem não sabe mudar no sistema.
- Ícones sempre acompanhados de rótulo na navegação e nas ações principais.

### 7.2 Leitores de tela (NVDA, TalkBack, VoiceOver) e teclado
- `contentDescription` em todo ícone acionável; elementos decorativos com `null`.
- Agrupar o card como um item só (elemento com `role="group"` e `aria-label` resumido): "Saldo total, mil duzentos e trinta reais, status positivo".
- Valores monetários com descrição falada (`R$ -12,30` → "menos doze reais e trinta centavos").
- Arrastar e soltar sempre com alternativa por menu (Kanban, reorganizar widgets).
- Web no computador: navegação completa por teclado (Tab/Shift+Tab, Enter, Esc fecha sheets), foco visível (anel de 2 px `sol.500`).

### 7.3 Linguagem
- Português simples, frases curtas, voz ativa, tratamento por "você".
- Evitar jargão; quando inevitável, explicar na hora: "Reserva de emergência (um dinheiro guardado só para imprevistos)".
- Nunca culpar: "Você passou R$ 15 do limite de hoje. Amanhã o limite se ajusta." em vez de "Você estourou o orçamento!".
- Ícones e exemplos com a realidade local: Pix, ônibus, botijão de gás, recarga de celular, feira.
- Revisar textos com o teste de usuários (PI etapa 8.3), principalmente com pessoas com pouca escolaridade.

### 7.4 Aparelho, dados e contexto
- Projetado primeiro para tela de 360 px de largura num celular de entrada, pelo navegador.
- Sem imagens pesadas nem vídeo; ilustrações vetoriais.
- Tudo funciona offline; nada essencial depende de internet.
- Tema escuro como padrão (economiza bateria em telas OLED e cansa menos a vista à noite), com tema claro e "seguir o sistema".
- Uso com uma mão: ações principais na metade inferior da tela; FAB e CTA ao alcance do polegar.

### 7.5 Saúde mental e conteúdo sensível
- Área de saúde mental com cores calmas (sem vermelho), sem contadores de "dias ruins".
- Contato do **CVV (188)** sempre a um toque na área de saúde mental, em linguagem acolhedora.
- Módulo de ciclo menstrual opcional, com linguagem neutra e inclusiva ("pessoas que menstruam" na explicação do módulo), e oculto por padrão da Home.
- `FLAG_SECURE` opcional e bloqueio do app para quem divide o celular com a família.

### 7.6 Checklist de acessibilidade por tela (usar em todo PR)
- [ ] Contraste conferido nos dois temas
- [ ] Fonte 200% sem corte
- [ ] Leitor de tela (NVDA no PC e o do celular): ordem de leitura lógica e todos os controles nomeados
- [ ] Alvos ≥ 44 px
- [ ] Nenhuma informação só por cor
- [ ] "Reduzir movimento" respeitado
- [ ] Funciona offline
- [ ] Textos revisados em linguagem simples

---

## 8. Implementação na web (resumo)
```css
/* src/ui/tokens.css: esboço; valores finais na etapa 3 do PI */
:root {
  --bg: #F4F7FE; --surface: #FFFFFF; --text-primary: #14162B;
  --sol-500: #FFB547; --positive: #047857; --neutral: #92400E; --negative: #B91C1C;
  --r-md: 16px; --dur-base: 250ms; --ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --glass-blur: 24px;
}
:root[data-theme="dark"] { --bg: #0E1020; --surface: #171A2E; --text-primary: #F4F5FA;
  --positive: #34D399; --neutral: #FBBF24; --negative: #F87171; }
:root[data-tier="low"], :root[data-reduce-effects] { --glass-blur: 0px; }
@media (prefers-reduced-motion: reduce) { :root { --dur-base: 100ms; } }
```
- O tema, o nível do aparelho (`data-tier="low"` quando há pouca memória ou o navegador não suporta `backdrop-filter`) e a preferência "Reduzir efeitos" ficam como atributos no `<html>`. Os componentes só leem variáveis CSS; nenhum decide isso sozinho.
- Os valores de cor acima são os da §2 (tema claro e escuro); a tabela da §2 continua sendo a fonte da verdade, medida na etapa 3.
- Tipografia em `rem`, para respeitar o tamanho de fonte e o zoom do navegador.
- Componentes React com HTML semântico (`button`, `nav`, `dialog`, `label`) antes de qualquer `div` com papel de botão. Animações por `transform` e `opacity`.
