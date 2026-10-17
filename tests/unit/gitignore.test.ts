import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

// SEC-10: dados pessoais e segredos nunca entram no Git.
function isIgnored(path: string): boolean {
  try {
    execFileSync('git', ['check-ignore', '-q', '--no-index', path]);
    return true;
  } catch {
    return false;
  }
}

describe('.gitignore', () => {
  it.each([
    'data/solis.db',
    'data/solis.kdf.json',
    'backups/solis-2026-10-17.db',
    'referencias/termos.pdf',
    'config/app.local.json',
    '.env',
    '.env.local',
    'extrato.ofx',
  ])('ignora %s', (path) => {
    expect(isIgnored(path)).toBe(true);
  });

  it.each(['data/README.md', 'backups/README.md', '.env.example'])('mantém %s', (path) => {
    expect(isIgnored(path)).toBe(false);
  });
});
