import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { FastifyInstance } from 'fastify';
import { buildApp, COOKIE } from '../../src/server/app.ts';

const ORIGIN = 'http://localhost:80';
const SENHA = 'Cavalo-Bateria-Grampo-42';
const fastKdf = { N: 1 << 10, r: 8, p: 1, maxmem: 32 * 1024 * 1024 };

let dataDir: string;
let t = 0;
let app: FastifyInstance;
const make = () => buildApp({ dataDir, kdfParams: fastKdf, delayPorErroMs: 0, now: () => t });

const post = (url: string, body: object, headers: Record<string, string> = {}) =>
  app.inject({
    method: 'POST',
    url,
    payload: body,
    headers: { origin: ORIGIN, host: 'localhost:80', ...headers },
  });

beforeEach(() => {
  dataDir = mkdtempSync(join(tmpdir(), 'solis-it-'));
  t = 0;
  app = make();
});
afterEach(() => app.close());

describe('autenticação', () => {
  it('começa não configurado e bloqueado', async () => {
    const r = await app.inject('/api/status');
    expect(r.json()).toEqual({ configurado: false, desbloqueado: false, autenticado: false });
  });

  it('recusa senha fraca no setup', async () => {
    expect((await post('/api/setup', { senha: '123456' })).statusCode).toBe(400);
  });

  it('setup cria sessão com cookie seguro', async () => {
    const r = await post('/api/setup', { senha: SENHA });
    expect(r.statusCode).toBe(200);
    const c = r.cookies.find((x) => x.name === COOKIE)!;
    expect(c).toMatchObject({ httpOnly: true, secure: true, sameSite: 'Strict', path: '/' });
    const s = await app.inject({ url: '/api/status', cookies: { [COOKIE]: c.value } });
    expect(s.json<{ autenticado: boolean }>().autenticado).toBe(true);
    expect((await post('/api/setup', { senha: SENHA })).statusCode).toBe(409);
  });

  it('reiniciar pede a senha; certa abre, errada não', async () => {
    await post('/api/setup', { senha: SENHA });
    await app.close();
    app = make();
    expect((await app.inject('/api/status')).json<{ desbloqueado: boolean }>().desbloqueado).toBe(
      false,
    );
    expect((await post('/api/login', { senha: 'outra-senha-qualquer' })).statusCode).toBe(401);
    expect((await post('/api/login', { senha: SENHA })).statusCode).toBe(200);
  });

  it('6ª tentativa errada é bloqueada; libera após 15 min', async () => {
    await post('/api/setup', { senha: SENHA });
    for (let i = 0; i < 5; i++)
      expect((await post('/api/login', { senha: 'errada' })).statusCode).toBe(401);
    expect((await post('/api/login', { senha: SENHA })).statusCode).toBe(429);
    t += 15 * 60 * 1000 + 1;
    expect((await post('/api/login', { senha: SENHA })).statusCode).toBe(200);
  });

  it('sessão expira após 30 min parado', async () => {
    const c = (await post('/api/setup', { senha: SENHA })).cookies[0]!;
    t += 30 * 60 * 1000 + 1;
    const s = await app.inject({ url: '/api/status', cookies: { [COOKIE]: c.value } });
    expect(s.json<{ autenticado: boolean }>().autenticado).toBe(false);
  });

  it('logout encerra a sessão', async () => {
    const c = (await post('/api/setup', { senha: SENHA })).cookies[0]!;
    await post('/api/logout', {}, { cookie: `${COOKIE}=${c.value}` });
    const s = await app.inject({ url: '/api/status', cookies: { [COOKIE]: c.value } });
    expect(s.json<{ autenticado: boolean }>().autenticado).toBe(false);
  });

  it('recusa Origin de outro site (SEC-06)', async () => {
    expect(
      (await post('/api/setup', { senha: SENHA }, { origin: 'https://evil.example' })).statusCode,
    ).toBe(403);
  });

  it('envia cabeçalhos de segurança (SEC-05)', async () => {
    const h = (await app.inject('/api/status')).headers;
    expect(h['content-security-policy']).toContain("frame-ancestors 'none'");
    expect(h['content-security-policy']).toContain("object-src 'none'");
    expect(h['referrer-policy']).toBe('no-referrer');
    expect(h['x-content-type-options']).toBe('nosniff');
  });
});
