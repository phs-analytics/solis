import { useEffect, useRef, useState } from 'react';
import { createAvatar } from '@bible-strong/avatar-react';
import avatar from './new-avatar.avatar.json' with { type: 'json' };
import { BotFab, Button } from '../ui/components.tsx';

// Checks the file once, at import.
export const SolisAvatar = createAvatar(avatar);

const ROTULO = 'Assistente Solis';

/** Floating button + panel. Answers arrive in etapa 9; for now it greets and shows its states. */
export function Assistente() {
  const [aberto, setAberto] = useState(false);
  const [estado, setEstado] = useState('idle');
  const painel = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = painel.current;
    if (!d) return;
    if (aberto && !d.open) d.showModal();
    if (!aberto && d.open) d.close();
  }, [aberto]);

  return (
    <>
      <BotFab
        onClick={() => {
          setEstado('waking');
          setAberto(true);
        }}
      >
        <SolisAvatar size={48} state="idle" settleAfterMs={6000} ariaLabel={ROTULO} />
      </BotFab>
      <dialog
        ref={painel}
        className="assistente card card-vidro"
        aria-labelledby="assistente-titulo"
        onClose={() => setAberto(false)}
      >
        <SolisAvatar
          size={140}
          state={estado}
          ariaLabel={ROTULO}
          onStateChange={(s) => s && setEstado(s)}
        />
        <h2 id="assistente-titulo">Olá! Eu sou o Solis.</h2>
        <p>
          Em breve vou responder perguntas como “quanto posso gastar hoje?”, com os seus dados e sem
          mandar nada para fora do aparelho.
        </p>
        <div className="assistente-acoes">
          <Button variante="secundario" onClick={() => setEstado('thinking')}>
            Pensar
          </Button>
          <Button variante="secundario" onClick={() => setEstado('happy')}>
            Comemorar
          </Button>
          <Button onClick={() => setAberto(false)}>Fechar</Button>
        </div>
      </dialog>
    </>
  );
}
