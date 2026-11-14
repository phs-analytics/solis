import {
  useEffect,
  useId,
  type CSSProperties,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { Money } from '../../domain/money.ts';

type Variante = 'primario' | 'secundario' | 'fantasma' | 'perigo';

export function Button({
  variante = 'primario',
  carregando = false,
  children,
  disabled,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: Variante; carregando?: boolean }) {
  return (
    <button
      type="button"
      {...rest}
      className={`btn btn-${variante}`}
      disabled={disabled || carregando}
      aria-busy={carregando || undefined}
    >
      {carregando ? <span className="spinner" aria-hidden="true" /> : null}
      <span className={carregando ? 'btn-rotulo-oculto' : undefined}>{children}</span>
    </button>
  );
}

export function IconButton({
  rotulo,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { rotulo: string }) {
  return (
    <button type="button" {...rest} className="btn-icone" aria-label={rotulo} title={rotulo}>
      {children}
    </button>
  );
}

export function Card({
  vidro = false,
  titulo,
  children,
}: {
  vidro?: boolean;
  titulo?: string;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <section
      className={vidro ? 'card card-vidro' : 'card'}
      aria-labelledby={titulo ? id : undefined}
    >
      {titulo ? (
        <h2 id={id} className="card-titulo">
          {titulo}
        </h2>
      ) : null}
      {children}
    </section>
  );
}

export function TextField({
  rotulo,
  erro,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { rotulo: string; erro?: string }) {
  const id = useId();
  return (
    <div className="campo">
      <label htmlFor={id}>{rotulo}</label>
      <input
        id={id}
        {...rest}
        aria-invalid={erro ? true : undefined}
        aria-describedby={erro ? `${id}-erro` : rest['aria-describedby']}
      />
      {erro ? (
        <p id={`${id}-erro`} className="campo-erro">
          <span aria-hidden="true">⚠</span> {erro}
        </p>
      ) : null}
    </div>
  );
}

/** Digits fill from the right: "1250" → 1250 centavos (R$ 12,50). */
export function digitosParaCentavos(texto: string): number {
  const d = texto.replace(/\D/g, '').slice(0, 13);
  return d ? Number(d) : 0;
}

export function MoneyField({
  rotulo,
  centavos,
  onChange,
  erro,
}: {
  rotulo: string;
  centavos: number;
  onChange: (c: number) => void;
  erro?: string;
}) {
  return (
    <TextField
      rotulo={rotulo}
      className="campo-dinheiro"
      inputMode="numeric"
      autoComplete="off"
      value={Money.fromCentavos(centavos).toString()}
      onChange={(e) => onChange(digitosParaCentavos(e.target.value))}
      {...(erro ? { erro } : {})}
    />
  );
}

export function Chip({
  selecionado,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { selecionado: boolean }) {
  return (
    <button type="button" {...rest} className="chip" aria-pressed={selecionado}>
      {selecionado ? <span aria-hidden="true">✓ </span> : null}
      {children}
    </button>
  );
}

export function ProgressBar({
  rotulo,
  valor,
  max = 100,
  cor = 'var(--neon-green)',
}: {
  rotulo: string;
  valor: number;
  max?: number;
  cor?: string;
}) {
  const pct = Math.round((Math.min(valor, max) / max) * 100);
  return (
    <div className="progresso">
      <div className="progresso-topo">
        <span>{rotulo}</span>
        <span className="tnum">{pct}%</span>
      </div>
      {/* React sets style via CSSOM, which CSP style-src 'self' allows */}
      <progress
        value={pct}
        max={100}
        aria-label={rotulo}
        style={{ ['--cor']: cor } as CSSProperties}
      />
    </div>
  );
}

export function EmptyState({ titulo, acao }: { titulo: string; acao?: ReactNode }) {
  return (
    <div className="vazio">
      <svg aria-hidden="true" viewBox="0 0 64 64" width="64" height="64">
        <circle cx="32" cy="32" r="14" fill="var(--sol-500)" />
        <g stroke="var(--sol-500)" strokeWidth="4" strokeLinecap="round">
          <path d="M32 6v6M32 52v6M6 32h6M52 32h6M13 13l4 4M47 47l4 4M13 51l4-4M47 17l4-4" />
        </g>
      </svg>
      <p>{titulo}</p>
      {acao}
    </div>
  );
}

const ICONES: Record<string, string> = {
  inicio: 'M4 11 12 4l8 7v9h-5v-6H9v6H4z',
  tarefas: 'M4 6h3M4 12h3M4 18h3M10 6h10M10 12h10M10 18h10',
  financas: 'M3 7h18v12H3zM3 11h18M7 15h4',
  saude: 'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z',
};

export type Rota = 'inicio' | 'financas' | 'tarefas' | 'saude';
export const ROTAS: [Rota, string][] = [
  ['inicio', 'Visão geral'],
  ['financas', 'Finanças'],
  ['tarefas', 'Tarefas'],
  ['saude', 'Saúde'],
];

export function Navegacao({ atual, onIr }: { atual: Rota; onIr: (r: Rota) => void }) {
  return (
    <nav className="nav" aria-label="Principal">
      <p className="nav-marca" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="28" height="28">
          <circle cx="12" cy="12" r="6" fill="var(--sol-500)" />
        </svg>
        Solis
      </p>
      <ul>
        {ROTAS.map(([rota, nome]) => (
          <li key={rota}>
            <a
              href={`#${rota}`}
              aria-current={rota === atual ? 'page' : undefined}
              data-modulo={rota}
              onClick={(e) => {
                e.preventDefault();
                onIr(rota);
              }}
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" width="24" height="24">
                <path d={ICONES[rota]} />
              </svg>
              {nome}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function BotFab({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" className="bot-fab" aria-label="Abrir assistente Solis" onClick={onClick}>
      {children}
    </button>
  );
}

export function StatCard({
  rotulo,
  valor,
  variacao,
  serie,
  cor = 'var(--sol-500)',
}: {
  rotulo: string;
  valor: string;
  variacao?: string;
  serie?: number[];
  cor?: string;
}) {
  return (
    <div className="card stat">
      <span className="rotulo-mono">{rotulo}</span>
      <span className="stat-valor">{valor}</span>
      <div className="stat-rodape">
        {variacao ? (
          <span className="variacao" data-sinal={variacao[0]}>
            {variacao}
          </span>
        ) : (
          <span />
        )}
        {serie ? <Sparkline valores={serie} cor={cor} /> : null}
      </div>
    </div>
  );
}

/** Decorative trend line; the number next to it carries the meaning. */
export function Sparkline({ valores, cor }: { valores: number[]; cor: string }) {
  const min = Math.min(...valores);
  const amp = Math.max(...valores) - min || 1;
  const pts = valores
    .map((v, i) => `${(i / (valores.length - 1)) * 80},${22 - ((v - min) / amp) * 20}`)
    .join(' ');
  return (
    <svg className="sparkline" aria-hidden="true" viewBox="0 0 80 24" width="80" height="24">
      <polyline points={pts} fill="none" stroke={cor} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

export function Anel({
  rotulo,
  valor,
  max = 100,
  texto,
  cor = 'var(--sol-500)',
  tamanho = 120,
}: {
  rotulo: string;
  valor: number;
  max?: number;
  texto: string;
  cor?: string;
  tamanho?: number;
}) {
  const r = 42;
  const volta = 2 * Math.PI * r;
  const frac = Math.min(valor, max) / max;
  return (
    <div className="anel" role="img" aria-label={`${rotulo}: ${texto}`}>
      <svg viewBox="0 0 100 100" width={tamanho} height={tamanho} aria-hidden="true">
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--outline)" strokeWidth="10" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={cor}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${frac * volta} ${volta}`}
          transform="rotate(-90 50 50)"
        />
      </svg>
      <span className="anel-centro" aria-hidden="true">
        <span className="anel-valor">{texto}</span>
        <span className="rotulo-mono">{rotulo}</span>
      </span>
    </div>
  );
}

/** Bar chart; positive and optional negative series share one zero line. */
export function Barras({
  rotulo,
  rotulos,
  valores,
  negativos,
  cor = 'var(--sol-500)',
  corNegativa = 'var(--neon-coral)',
}: {
  rotulo: string;
  rotulos: string[];
  valores: number[];
  negativos?: number[];
  cor?: string;
  corNegativa?: string;
}) {
  const max = Math.max(...valores, ...(negativos ?? [0]), 1);
  const alt = negativos ? 50 : 90;
  const zero = negativos ? 60 : 100;
  const passo = 300 / valores.length;
  const larg = Math.min(passo * 0.55, 28);
  return (
    <svg className="grafico" viewBox="0 0 300 130" role="img" aria-label={rotulo}>
      {valores.map((v, i) => {
        const x = i * passo + (passo - larg) / 2;
        const h = (v / max) * alt;
        const n = negativos ? ((negativos[i] ?? 0) / max) * alt : 0;
        return (
          <g key={i}>
            <rect x={x} y={zero - h} width={larg} height={h} rx="6" fill={cor} />
            {negativos ? (
              <rect x={x} y={zero + 2} width={larg} height={n} rx="6" fill={corNegativa} />
            ) : null}
            <text x={x + larg / 2} y="126" textAnchor="middle">
              {rotulos[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function Tag({ cor, children }: { cor: string; children: ReactNode }) {
  return (
    <span className="tag" style={{ ['--cor']: cor } as CSSProperties}>
      {children}
    </span>
  );
}

export function Tarefa({
  titulo,
  projeto,
  cor,
  quando,
  feita,
  onAlternar,
}: {
  titulo: string;
  projeto: string;
  cor: string;
  quando: string;
  feita: boolean;
  onAlternar: () => void;
}) {
  const id = useId();
  return (
    <li className="tarefa">
      <input id={id} type="checkbox" checked={feita} onChange={onAlternar} />
      <div className="tarefa-texto">
        <label htmlFor={id}>{titulo}</label>
        <span className="tarefa-meta">
          <Tag cor={cor}>{projeto}</Tag>
          <span>{quando}</span>
        </span>
      </div>
    </li>
  );
}

export function Snackbar({
  mensagem,
  acao,
  onFechar,
  duracaoMs = 5000,
}: {
  mensagem: string;
  acao?: { rotulo: string; onClick: () => void };
  onFechar: () => void;
  duracaoMs?: number;
}) {
  useEffect(() => {
    const t = setTimeout(onFechar, duracaoMs);
    return () => clearTimeout(t);
  }, [onFechar, duracaoMs]);
  return (
    <div className="snackbar" role="status">
      <span>{mensagem}</span>
      {acao ? (
        <button
          type="button"
          className="btn btn-fantasma"
          onClick={() => {
            acao.onClick();
            onFechar();
          }}
        >
          {acao.rotulo}
        </button>
      ) : null}
    </div>
  );
}
