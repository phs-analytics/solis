// shortcut: fixed sample data so the screens can be reviewed; replaced by the vault in etapas 5–8.
export const SEMANA = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export const FINANCAS = {
  disponivelHoje: 11243,
  saldo: 1535090,
  receitas: 300000,
  despesas: 369433,
  entradas: [420, 380, 510, 300, 460, 220, 390],
  saidas: [310, 260, 420, 280, 350, 180, 300],
  tendencia: [12, 14, 13, 17, 16, 19, 22],
  categorias: [
    { nome: 'Mercado', centavos: 96000, cor: 'var(--neon-coral)' },
    { nome: 'Moradia', centavos: 140000, cor: 'var(--neon-cyan)' },
    { nome: 'Transporte', centavos: 42000, cor: 'var(--neon-violet)' },
    { nome: 'Saúde', centavos: 31000, cor: 'var(--neon-green)' },
  ],
  movimentos: [
    { desc: 'Salário', quando: 'Hoje', centavos: 300000 },
    { desc: 'Feira', quando: 'Ontem', centavos: -18450 },
    { desc: 'Conta de luz', quando: '12/11', centavos: -21390 },
    { desc: 'Farmácia', quando: '10/11', centavos: -4590 },
  ],
};

export const TAREFAS = [
  { titulo: 'Pagar a conta de luz', projeto: 'Casa', cor: 'var(--neon-coral)', quando: 'Hoje' },
  {
    titulo: 'Revisar o orçamento do mês',
    projeto: 'Finanças',
    cor: 'var(--sol-500)',
    quando: 'Hoje',
  },
  {
    titulo: 'Marcar consulta no dentista',
    projeto: 'Saúde',
    cor: 'var(--neon-green)',
    quando: 'Amanhã',
  },
  { titulo: 'Ler 20 páginas', projeto: 'Pessoal', cor: 'var(--neon-violet)', quando: 'Sex' },
  { titulo: 'Fazer backup no pendrive', projeto: 'Solis', cor: 'var(--neon-cyan)', quando: 'Dom' },
];

export const SAUDE = {
  aguaMl: 1400,
  metaAguaMl: 2200,
  aguaSemana: [1800, 2100, 1600, 2300, 1400, 0, 0],
  sono: { pontos: 87, horas: '7h 42m', semana: [6.5, 7.2, 7.8, 6.9, 7.7, 8.1, 7.4] },
  passos: 4386,
  humor: 'Bem',
};
