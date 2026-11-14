import { describe, it, expect, beforeEach } from 'vitest';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { openDb } from '../../src/server/db/index.ts';
import { setting } from '../../src/server/db/schema.ts';

describe('banco cifrado', () => {
  let path: string;
  const key = randomBytes(32);
  beforeEach(() => {
    path = join(mkdtempSync(join(tmpdir(), 'solis-')), 't.db');
  });

  it('chave certa abre e persiste dados', () => {
    const a = openDb(path, key);
    a.db.insert(setting).values({ key: 'k', value: 'v', updatedAt: new Date() }).run();
    a.sqlite.close();
    const b = openDb(path, key);
    expect(b.db.select().from(setting).all()[0]?.value).toBe('v');
    b.sqlite.close();
  });

  it('chave errada falha', () => {
    openDb(path, key).sqlite.close();
    expect(() => openDb(path, randomBytes(32))).toThrow();
  });

  it('arquivo não é SQLite legível', () => {
    openDb(path, key).sqlite.close();
    expect(readFileSync(path).subarray(0, 15).toString()).not.toBe('SQLite format 3');
  });
});
