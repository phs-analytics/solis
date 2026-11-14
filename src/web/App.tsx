import { useEffect, useState, type FormEvent } from 'react';
import { criarSenha, entrar, getStatus, sair, tocar, type CodigoErro, type Status } from './api.ts';
import type { AvaliacaoSenha } from '../domain/senha.ts';
import { Button, Card, TextField } from './ui/components.tsx';

const MENSAGENS: Partial<Record<CodigoErro, string>> = {
  'senha-incorreta': 'Senha incorreta.',
  'muitas-tentativas': 'Muitas tentativas. Espere 15 minutos.',
  'senha-fraca': 'Escolha uma senha mais forte.',
};
const MINUTO = 60_000;

export function App() {
  const [status, setStatus] = useState<Status | null>(null);
  const atualizar = () => void getStatus().then(setStatus);
  useEffect(atualizar, []);

  // The vault locks itself after 30 min idle; report activity and re-check status each minute.
  const autenticado = status?.autenticado ?? false;
  useEffect(() => {
    if (!autenticado) return;
    let ultimo = 0;
    const ativo = () => {
      if (Date.now() - ultimo > MINUTO) {
        ultimo = Date.now();
        void tocar();
      }
    };
    const t = setInterval(atualizar, MINUTO);
    addEventListener('pointerdown', ativo);
    addEventListener('keydown', ativo);
    return () => {
      clearInterval(t);
      removeEventListener('pointerdown', ativo);
      removeEventListener('keydown', ativo);
    };
  }, [autenticado]);

  if (!status)
    return (
      <main className="pagina" aria-busy="true">
        Carregando…
      </main>
    );
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
    const r = await criarSenha(senha);
    setEnviando(false);
    if (r.ok) onOk();
    else setErro(MENSAGENS[r.erro] ?? 'Não foi possível criar a senha.');
  }

  return (
    <main className="pagina">
      <h1>Criar senha</h1>
      <p className="aviso" role="note">
        Esta senha protege todos os seus dados.{' '}
        <strong>Se você esquecer, não tem como recuperar.</strong> Guarde num gerenciador de senhas.
      </p>
      <form onSubmit={(e) => void enviar(e)} noValidate>
        <TextField
          rotulo="Senha (mínimo 12 caracteres)"
          type="password"
          autoComplete="new-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          aria-describedby="forca"
        />
        <p id="forca" className="forca" aria-live="polite">
          {av ? (av.forte ? 'Senha forte.' : `Fraca. ${av.sugestao}`) : ''}
        </p>
        <TextField
          rotulo="Repita a senha"
          type="password"
          autoComplete="new-password"
          value={confirma}
          onChange={(e) => setConfirma(e.target.value)}
        />
        {erro && (
          <p role="alert" className="erro">
            {erro}
          </p>
        )}
        <Button type="submit" carregando={enviando}>
          Criar senha
        </Button>
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
    const r = await entrar(senha);
    setEnviando(false);
    if (r.ok) return onOk();
    setErro(MENSAGENS[r.erro] ?? 'Não foi possível entrar.');
    setSenha('');
  }

  return (
    <main className="pagina">
      <h1>Entrar no Solis</h1>
      <form onSubmit={(e) => void enviar(e)}>
        <TextField
          rotulo="Senha"
          type="password"
          autoComplete="current-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />
        {erro && (
          <p role="alert" className="erro">
            {erro}
          </p>
        )}
        <Button type="submit" carregando={enviando}>
          Entrar
        </Button>
      </form>
    </main>
  );
}

function Desbloqueado({ onSair }: { onSair: () => void }) {
  return (
    <main className="pagina">
      <h1>Solis</h1>
      <Card vidro>
        <p>Seus dados estão abertos.</p>
        <Button variante="secundario" onClick={() => void sair().then(onSair)}>
          Sair
        </Button>
      </Card>
    </main>
  );
}
