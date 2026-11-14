import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

// Reads tokens straight from the CSS so the test can't drift from what ships.
const css = readFileSync(new URL('../../src/web/ui/tokens.css', import.meta.url), 'utf8');

function bloco(seletor: string): Record<string, string> {
  const ini = css.indexOf(`${seletor} {`);
  const corpo = css.slice(ini, css.indexOf('}', ini));
  return Object.fromEntries(
    [...corpo.matchAll(/--([\w-]+):\s*([^;]+);/g)].map((m): [string, string] => [m[1]!, m[2]!]),
  );
}

const escuro = bloco(':root');
const claro = { ...escuro, ...bloco(":root[data-theme='light']") };

function hex(tema: Record<string, string>, nome: string): string {
  let v = tema[nome]!;
  while (v.startsWith('var(--')) v = tema[v.slice(6, -1)]!;
  if (!/^#[0-9a-f]{6}$/i.test(v)) throw new Error(`--${nome} não é hex: ${v}`);
  return v;
}

function luminancia(h: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(h.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contraste(a: string, b: string): number {
  const [l1, l2] = [luminancia(a), luminancia(b)].sort((x, y) => y - x) as [number, number];
  return (l1 + 0.05) / (l2 + 0.05);
}

// [frente, fundo, mínimo]: 4.5 texto, 3 componentes/ícones/foco (WCAG 2.2 AA)
const PARES: [string, string, number][] = [
  ['text-primary', 'bg', 4.5],
  ['text-primary', 'surface', 4.5],
  ['text-primary', 'surface-high', 4.5],
  ['text-secondary', 'bg', 4.5],
  ['text-secondary', 'surface', 4.5],
  ['text-on-sol', 'sol-500', 4.5],
  ['accent-text', 'bg', 4.5],
  ['accent-text', 'surface', 4.5],
  ['positive', 'surface', 4.5],
  ['neutral', 'surface', 4.5],
  ['negative', 'surface', 4.5],
  ['text-on-negative', 'negative', 4.5],
  ['focus', 'bg', 3],
  ['focus', 'surface', 3],
  ['field-border', 'surface', 3],
  ['field-border', 'bg', 3],
];

describe.each([
  ['escuro', escuro],
  ['claro', claro],
])('contraste no tema %s', (_nome, tema) => {
  it.each(PARES)('%s sobre %s ≥ %s', (frente, fundo, min) => {
    expect(contraste(hex(tema, frente), hex(tema, fundo))).toBeGreaterThanOrEqual(min);
  });
});
