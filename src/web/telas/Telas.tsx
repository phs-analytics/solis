import { useState } from 'react';
import { Money } from '../../domain/money.ts';
import { Anel, Barras, Card, IconButton, StatCard, Tarefa } from '../ui/components.tsx';
import { SolisAvatar } from '../assistente/Assistente.tsx';
import { FINANCAS, SAUDE, SEMANA, TAREFAS } from './exemplo.ts';

const real = (c: number) => Money.fromCentavos(c).toString();

function Olho({ oculto, onClick }: { oculto: boolean; onClick: () => void }) {
  return (
    <IconButton rotulo={oculto ? 'Mostrar valores' : 'Ocultar valores'} onClick={onClick}>
      <svg aria-hidden="true" viewBox="0 0 24 24" width="24" height="24">
        <path
          d={
            oculto
              ? 'M3 4l18 16M10 6.2A9 9 0 0 1 12 6c6 0 10 6 10 6a17 17 0 0 1-3 3.5M6.5 7.5C3.8 9.4 2 12 2 12s4 7 10 7c1.7 0 3.2-.5 4.5-1.2'
              : 'M12 5C6 5 2 12 2 12s4 7 10 7 10-7 10-7-4-7-10-7zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8z'
          }
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    </IconButton>
  );
}

function Saldo() {
  const [oculto, setOculto] = useState(false);
  return (
    <Card vidro>
      <div className="saldo-topo">
        <span className="rotulo-mono">Pode gastar hoje</span>
        <Olho oculto={oculto} onClick={() => setOculto(!oculto)} />
      </div>
      <p className="saldo-valor mono">{oculto ? 'R$ •••••' : real(FINANCAS.disponivelHoje)}</p>
      <p className="saldo-sub">
        Saldo em conta: <span className="tnum">{oculto ? '•••••' : real(FINANCAS.saldo)}</span>
      </p>
    </Card>
  );
}

export function VisaoGeral() {
  const feitas = 2;
  return (
    <>
      <header className="saudacao">
        <SolisAvatar size={72} state="happy" settleAfterMs={4000} ariaLabel="Assistente Solis" />
        <div>
          <p className="rotulo-mono">Sexta, 14 de novembro</p>
          <h1>Bom dia!</h1>
        </div>
      </header>
      <div className="grade grade-hero">
        <Saldo />
        <Card titulo="Hoje">
          <div className="aneis">
            <Anel
              rotulo="tarefas"
              valor={feitas}
              max={TAREFAS.length}
              texto={`${feitas}/${TAREFAS.length}`}
              cor="var(--neon-violet)"
            />
            <Anel
              rotulo="água"
              valor={SAUDE.aguaMl}
              max={SAUDE.metaAguaMl}
              texto={`${Math.round((SAUDE.aguaMl / SAUDE.metaAguaMl) * 100)}%`}
              cor="var(--neon-cyan)"
            />
            <Anel
              rotulo="sono"
              valor={SAUDE.sono.pontos}
              texto={`${SAUDE.sono.pontos}`}
              cor="var(--neon-green)"
            />
          </div>
        </Card>
      </div>
      <div className="grade grade-3">
        <StatCard
          rotulo="Receitas"
          valor={real(FINANCAS.receitas)}
          variacao="+4%"
          serie={FINANCAS.tendencia}
          cor="var(--positive)"
        />
        <StatCard
          rotulo="Despesas"
          valor={real(FINANCAS.despesas)}
          variacao="-12%"
          serie={[...FINANCAS.tendencia].reverse()}
          cor="var(--neon-coral)"
        />
        <StatCard
          rotulo="Passos"
          valor={SAUDE.passos.toLocaleString('pt-BR')}
          variacao="+8%"
          serie={[3, 5, 4, 6, 5, 7, 6]}
          cor="var(--neon-green)"
        />
      </div>
      <Card titulo="Próximas tarefas">
        <ListaTarefas limite={3} />
      </Card>
    </>
  );
}

export function Financas() {
  const total = FINANCAS.categorias.reduce((s, c) => s + c.centavos, 0);
  return (
    <>
      <h1>Finanças</h1>
      <div className="grade grade-hero">
        <Saldo />
        <Card titulo="Fluxo de caixa da semana">
          <Barras
            rotulo="Entradas e saídas por dia da semana"
            rotulos={SEMANA}
            valores={FINANCAS.entradas}
            negativos={FINANCAS.saidas}
            cor="var(--neon-green)"
          />
        </Card>
      </div>
      <div className="grade grade-2">
        <Card titulo="Para onde vai o dinheiro">
          <div className="barra-empilhada" aria-hidden="true">
            {FINANCAS.categorias.map((c) => (
              <span key={c.nome} style={{ flexGrow: c.centavos, background: c.cor }} />
            ))}
          </div>
          <ul className="lista">
            {FINANCAS.categorias.map((c) => (
              <li key={c.nome}>
                <span className="tag" style={{ ['--cor' as string]: c.cor }}>
                  {c.nome}
                </span>
                <span className="tnum">
                  {real(c.centavos)} · {Math.round((c.centavos / total) * 100)}%
                </span>
              </li>
            ))}
          </ul>
        </Card>
        <Card titulo="Últimos lançamentos">
          <ul className="lista">
            {FINANCAS.movimentos.map((m) => (
              <li key={m.desc}>
                <span>
                  <strong>{m.desc}</strong>
                  <br />
                  <span className="rotulo-mono">{m.quando}</span>
                </span>
                <span className={`tnum ${m.centavos > 0 ? 'positivo' : ''}`}>
                  {m.centavos > 0 ? '+' : ''}
                  {real(m.centavos)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}

function ListaTarefas({ limite }: { limite?: number }) {
  const [feitas, setFeitas] = useState<Set<number>>(new Set([3, 4]));
  return (
    <ul className="tarefas">
      {TAREFAS.slice(0, limite).map((t, i) => (
        <Tarefa
          key={t.titulo}
          {...t}
          feita={feitas.has(i)}
          onAlternar={() => {
            const n = new Set(feitas);
            if (!n.delete(i)) n.add(i);
            setFeitas(n);
          }}
        />
      ))}
    </ul>
  );
}

export function Tarefas() {
  return (
    <>
      <h1>Tarefas</h1>
      <div className="grade grade-3">
        <StatCard rotulo="Abertas" valor="3" />
        <StatCard rotulo="Para hoje" valor="2" />
        <StatCard rotulo="Feitas na semana" valor="11" variacao="+3" />
      </div>
      <Card titulo="Minhas tarefas">
        <ListaTarefas />
      </Card>
    </>
  );
}

export function Saude() {
  const pct = Math.round((SAUDE.aguaMl / SAUDE.metaAguaMl) * 100);
  return (
    <>
      <h1>Saúde</h1>
      <div className="grade grade-2">
        <Card titulo="Água de hoje">
          <div className="saude-agua">
            <Anel
              rotulo="da meta"
              valor={SAUDE.aguaMl}
              max={SAUDE.metaAguaMl}
              texto={`${pct}%`}
              cor="var(--neon-cyan)"
              tamanho={150}
            />
            <p className="mono">
              {SAUDE.aguaMl} / {SAUDE.metaAguaMl} ml
            </p>
          </div>
          <Barras
            rotulo="Água por dia da semana, em ml"
            rotulos={SEMANA}
            valores={SAUDE.aguaSemana}
            cor="var(--neon-cyan)"
          />
        </Card>
        <Card titulo="Sono">
          <div className="saude-agua">
            <Anel
              rotulo="pontos"
              valor={SAUDE.sono.pontos}
              texto={`${SAUDE.sono.pontos}`}
              cor="var(--neon-violet)"
              tamanho={150}
            />
            <p className="mono">{SAUDE.sono.horas} esta noite</p>
          </div>
          <Barras
            rotulo="Horas de sono por noite da semana"
            rotulos={SEMANA}
            valores={SAUDE.sono.semana}
            cor="var(--neon-violet)"
          />
        </Card>
      </div>
      <div className="grade grade-2">
        <StatCard
          rotulo="Passos hoje"
          valor={SAUDE.passos.toLocaleString('pt-BR')}
          serie={[3, 5, 4, 6, 5, 7, 6]}
          cor="var(--neon-green)"
        />
        <StatCard rotulo="Humor" valor={SAUDE.humor} />
      </div>
      <p className="ajuda">
        Precisa conversar? <strong>CVV: ligue 188</strong>, 24 horas, de graça.
      </p>
    </>
  );
}
