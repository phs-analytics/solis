import { useEffect, useState, type FormEvent } from 'react';
import { getStatus, post, type Status } from './api.ts';
import type { AvaliacaoSenha } from '../domain/senha.ts';

const MENSAGENS: Record<number, string> = {
  401: 'Senha incorreta.',
  429: 'Muitas tentativas. Espere 15 minutos.',
};

export function App() {
  const [status, setStatus] = useState<Status | null>(null);
  const atualizar = () => void getStatus().then(setStatus);
  useEffect(atualizar, []);

  if (!status) return <main aria-busy="true">Carregando…</main>;
  if (status.autenticado) return <Desbloqueado onSair={atualizar} />;
  return status.configurado ? <Entrar onOk={atualizar} /> : <CriarSenha onOk={atualizar} />;
}

function CriarSenha({ onOk }: { onOk: () => void }) {
  const [senha, setSenha] = useState('');
  const [confirma, setConfirma] = useState('');
  const [av, setAv] = useState<AvaliacaoSenha | null>(null);
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    let vivo = true;
    // zxcvbn dictionaries are large; load only on this screen
    void import('../domain/senha.ts').then(
      (m) => vivo && setAv(senha ? m.avaliarSenha(senha) : null),
    );
    return () => {
      vivo = false;
    };
  }, [senha]);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (senha !== confirma) return setErro('As senhas não são iguais.');
    if (!av?.forte) return setErro('Escolha uma senha mais forte.');
    setEnviando(true);
    const r = await post('/api/setup', { senha });
    setEnviando(false);
    if (r.ok) onOk();
    else setErro(r.data.sugestao || 'Não foi possível criar a senha.');
  }

  return (
    <main>
      <h1>Criar senha</h1>
      <p className="aviso" role="note">
        Esta senha cifra todos os seus dados.{' '}
        <strong>Se você esquecer, não há como recuperar.</strong> Guarde-a num gerenciador de
        senhas.
      </p>
      <form onSubmit={(e) => void enviar(e)} noValidate>
        <label htmlFor="senha">Senha (mínimo 12 caracteres)</label>
        <input
          id="senha"
          type="password"
          autoComplete="new-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          aria-describedby="forca"
        />
        <meter
          id="forca-medidor"
          min={0}
          max={4}
          value={av?.pontuacao ?? 0}
          aria-label="Força da senha"
        />
        <p id="forca" aria-live="polite">
          {av ? (av.forte ? 'Senha forte.' : `Fraca. ${av.sugestao}`) : ''}
        </p>
        <label htmlFor="confirma">Repita a senha</label>
        <input
          id="confirma"
          type="password"
          autoComplete="new-password"
          value={confirma}
          onChange={(e) => setConfirma(e.target.value)}
        />
        {erro && <p role="alert">{erro}</p>}
        <button type="submit" disabled={enviando}>
          {enviando ? 'Criando…' : 'Criar senha'}
        </button>
      </form>
    </main>
  );
}

function Entrar({ onOk }: { onOk: () => void }) {
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    const r = await post('/api/login', { senha });
    setEnviando(false);
    if (r.ok) return onOk();
    setErro(MENSAGENS[r.status] ?? 'Não foi possível entrar.');
    setSenha('');
  }

  return (
    <main>
      <h1>Entrar no Solis</h1>
      <form onSubmit={(e) => void enviar(e)}>
        <label htmlFor="senha">Senha</label>
        <input
          id="senha"
          type="password"
          autoComplete="current-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />
        {erro && <p role="alert">{erro}</p>}
        <button type="submit" disabled={enviando}>
          {enviando ? 'Abrindo…' : 'Entrar'}
        </button>
      </form>
    </main>
  );
}

function Desbloqueado({ onSair }: { onSair: () => void }) {
  return (
    <main>
      <h1>Solis</h1>
      <p>Seus dados estão abertos.</p>
      <button type="button" onClick={() => void post('/api/logout').then(onSair)}>
        Sair
      </button>
    </main>
  );
}
