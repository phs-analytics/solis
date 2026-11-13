import { scrypt, randomBytes } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt) as (
  pw: string,
  salt: Buffer,
  len: number,
  opts: { N: number; r: number; p: number; maxmem: number },
) => Promise<Buffer>;

export const KDF_PARAMS = { N: 1 << 17, r: 8, p: 1, maxmem: 256 * 1024 * 1024 };

export function readOrCreateSalt(kdfPath: string): Buffer {
  if (existsSync(kdfPath)) {
    const { salt } = JSON.parse(readFileSync(kdfPath, 'utf8')) as { salt: string };
    return Buffer.from(salt, 'hex');
  }
  const salt = randomBytes(32);
  writeFileSync(kdfPath, JSON.stringify({ salt: salt.toString('hex') }), { mode: 0o600 });
  return salt;
}

export function deriveKey(password: string, salt: Buffer, params = KDF_PARAMS): Promise<Buffer> {
  return scryptAsync(password, salt, 32, params);
}
