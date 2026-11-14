import { useState } from 'react';
import {
  BotFab,
  Button,
  Card,
  Chip,
  EmptyState,
  IconButton,
  MoneyField,
  Navegacao,
  ProgressBar,
  Snackbar,
  TextField,
  type Rota,
} from './ui/components.tsx';
import { salvarReduzirEfeitos, salvarTema, temaSalvo, type Tema } from './ui/preferencias.ts';
import './catalogo.css';

/** Dev-only page (DS §5): every component in its documented states. Open /#catalogo. */
export default function Catalogo() {
  const [tema, setTema] = useState<Tema>(temaSalvo());
  const [efeitos, setEfeitos] = useState(
    document.documentElement.hasAttribute('data-reduce-effects'),
  );
  const [centavos, setCentavos] = useState(1250);
  const [chip, setChip] = useState(true);
  const [rota, setRota] = useState<Rota>('financas');
  const [snack, setSnack] = useState(false);

  return (
    <div className="catalogo">
      <main className="catalogo-conteudo">
        <h1>Catálogo de componentes</h1>

        <fieldset className="catalogo-controles">
          <legend>Ambiente</legend>
          {(['escuro', 'claro', 'sistema'] as const).map((t) => (
            <Chip
              key={t}
              selecionado={tema === t}
              onClick={() => {
                setTema(t);
                salvarTema(t);
              }}
            >
              Tema {t}
            </Chip>
          ))}
          <Chip
            selecionado={efeitos}
            onClick={() => {
              setEfeitos(!efeitos);
              salvarReduzirEfeitos(!efeitos);
            }}
          >
            Reduzir efeitos
          </Chip>
        </fieldset>
        <p className="catalogo-dica">
          Foco: use Tab. Zoom 200%: Ctrl + até 200%. Reduzir movimento: configuração do sistema.
        </p>

        <Card titulo="Botões">
          <div className="catalogo-linha">
            <Button>Salvar gasto</Button>
            <Button variante="secundario">Ver detalhes</Button>
            <Button variante="fantasma">Pular</Button>
            <Button variante="perigo">Apagar tudo</Button>
          </div>
          <div className="catalogo-linha">
            <Button disabled>Desabilitado</Button>
            <Button carregando>Salvando</Button>
            <IconButton rotulo="Ocultar valores">
              <svg aria-hidden="true" viewBox="0 0 24 24" width="24" height="24">
                <path d="M12 5C6 5 2 12 2 12s4 7 10 7 10-7 10-7-4-7-10-7zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8z" />
              </svg>
            </IconButton>
          </div>
        </Card>

        <div className="catalogo-grade">
          <Card titulo="Card sólido">
            <p>Versão sem blur, usada em aparelho fraco.</p>
          </Card>
          <Card titulo="Card de vidro" vidro>
            <p>Com blur; vira sólido com “Reduzir efeitos”.</p>
          </Card>
        </div>

        <Card titulo="Campos">
          <TextField rotulo="Descrição" placeholder="Ex.: feira" />
          <TextField rotulo="Descrição com erro" defaultValue="" erro="Escreva uma descrição." />
          <TextField rotulo="Desabilitado" disabled defaultValue="Não editável" />
          <MoneyField rotulo="Valor" centavos={centavos} onChange={setCentavos} />
        </Card>

        <Card titulo="Chips e progresso">
          <div className="catalogo-linha">
            <Chip selecionado={chip} onClick={() => setChip(!chip)}>
              Mercado
            </Chip>
            <Chip selecionado={!chip} onClick={() => setChip(!chip)}>
              Transporte
            </Chip>
            <Chip selecionado={false} disabled>
              Desabilitado
            </Chip>
          </div>
          <ProgressBar rotulo="Meta: reserva de emergência" valor={64} cor="var(--neon-green)" />
          <ProgressBar rotulo="Água de hoje" valor={1.2} max={2} cor="var(--neon-cyan)" />
        </Card>

        <Card titulo="Estado vazio">
          <EmptyState
            titulo="Nada aqui ainda. Que tal lançar o primeiro gasto?"
            acao={<Button variante="secundario">Lançar gasto</Button>}
          />
        </Card>

        <Card titulo="Aviso (snackbar)">
          <Button variante="secundario" onClick={() => setSnack(true)}>
            Mostrar aviso
          </Button>
        </Card>
      </main>

      <Navegacao atual={rota} onIr={setRota} />
      <BotFab onClick={() => setSnack(true)} />
      {snack ? (
        <Snackbar
          mensagem="Gasto excluído"
          acao={{ rotulo: 'Desfazer', onClick: () => undefined }}
          onFechar={() => setSnack(false)}
        />
      ) : null}
    </div>
  );
}
