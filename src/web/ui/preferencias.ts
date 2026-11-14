export type Tema = 'escuro' | 'claro' | 'sistema';

const CHAVE_TEMA = 'solis.tema';
const CHAVE_EFEITOS = 'solis.reduzirEfeitos';

function ler(chave: string): string | null {
  try {
    return localStorage.getItem(chave);
  } catch {
    return null;
  }
}
function gravar(chave: string, valor: string | null) {
  try {
    if (valor === null) localStorage.removeItem(chave);
    else localStorage.setItem(chave, valor);
  } catch {
    /* private mode: preference just isn't remembered */
  }
}

export function temaSalvo(): Tema {
  const t = ler(CHAVE_TEMA);
  return t === 'claro' || t === 'escuro' ? t : 'sistema';
}

/** DS §8: theme, device tier and "reduce effects" live as attributes on <html>. */
export function aplicarPreferencias(
  tema: Tema = temaSalvo(),
  reduzirEfeitos = ler(CHAVE_EFEITOS) === '1',
) {
  const html = document.documentElement;
  const claro =
    tema === 'claro' || (tema === 'sistema' && matchMedia('(prefers-color-scheme: light)').matches);
  html.dataset.theme = claro ? 'light' : 'dark';
  const memoria = (navigator as { deviceMemory?: number }).deviceMemory;
  html.dataset.tier =
    !CSS.supports('backdrop-filter', 'blur(1px)') || (memoria !== undefined && memoria <= 2)
      ? 'low'
      : 'high';
  html.toggleAttribute('data-reduce-effects', reduzirEfeitos);
}

export function salvarTema(tema: Tema) {
  gravar(CHAVE_TEMA, tema === 'sistema' ? null : tema);
  aplicarPreferencias(tema);
}

export function salvarReduzirEfeitos(ligado: boolean) {
  gravar(CHAVE_EFEITOS, ligado ? '1' : null);
  aplicarPreferencias(temaSalvo(), ligado);
}

export function seguirSistema() {
  matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => {
    if (temaSalvo() === 'sistema') aplicarPreferencias();
  });
}
