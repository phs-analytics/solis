import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { readFileSync } from 'node:fs';
import * as schema from './schema.ts';

const MIGRATIONS = [new URL('../../../src-tauri/migrations/0001_init.sql', import.meta.url)];

export function openDb(dbPath: string, key: Buffer) {
  if (key.length !== 32) throw new RangeError('key must be 32 bytes');
  const sqlite = new Database(dbPath);
  // SQLCipher v4: cipher must be chosen before the key; x'..' = raw key, skips SQLCipher's own KDF
  sqlite.pragma("cipher='sqlcipher'");
  sqlite.pragma('legacy=4');
  sqlite.pragma(`key="x'${key.toString('hex')}'"`);
  try {
    // throws SQLITE_NOTADB on a wrong key
    const version = sqlite.pragma('user_version', { simple: true }) as number;
    for (let i = version; i < MIGRATIONS.length; i++) {
      sqlite.exec(readFileSync(MIGRATIONS[i]!, 'utf8'));
      sqlite.pragma(`user_version=${i + 1}`);
    }
  } catch (err) {
    sqlite.close();
    throw err;
  }
  return { db: drizzle(sqlite, { schema }), sqlite };
}

export type Db = ReturnType<typeof openDb>['db'];
