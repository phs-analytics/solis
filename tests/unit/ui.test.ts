import { describe, it, expect } from 'vitest';
import { digitosParaCentavos } from '../../src/web/ui/components.tsx';

describe('campo de dinheiro', () => {
  it('preenche da direita para a esquerda', () => {
    expect(digitosParaCentavos('1250')).toBe(1250);
    expect(digitosParaCentavos('R$ 12,503')).toBe(12503);
  });
  it('vazio vira zero', () => {
    expect(digitosParaCentavos('R$ ')).toBe(0);
  });
  it('limita a 13 dígitos (abaixo de Number.MAX_SAFE_INTEGER)', () => {
    expect(digitosParaCentavos('9'.repeat(20))).toBe(9_999_999_999_999);
  });
});
