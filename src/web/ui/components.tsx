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
  agenda: 'M5 5h14v15H5zM5 9h14M9 3v4M15 3v4',
  financas: 'M3 7h18v12H3zM3 11h18M7 15h4',
  saude: 'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z',
};

export type Rota = 'inicio' | 'agenda' | 'financas' | 'saude';
const ROTAS: [Rota, string][] = [
  ['inicio', 'Início'],
  ['agenda', 'Agenda'],
  ['financas', 'Finanças'],
  ['saude', 'Saúde'],
];

export function Navegacao({ atual, onIr }: { atual: Rota; onIr: (r: Rota) => void }) {
  return (
    <nav className="nav" aria-label="Principal">
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

export function BotFab({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="bot-fab" aria-label="Abrir assistente Solis" onClick={onClick}>
      <svg aria-hidden="true" viewBox="0 0 24 24" width="28" height="28">
        <path d="M12 2l2.4 7.2H22l-6 4.6 2.3 7.2L12 16.6 5.7 21l2.3-7.2-6-4.6h7.6z" />
      </svg>
    </button>
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
