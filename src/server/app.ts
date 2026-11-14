import Fastify, { type FastifyInstance, type FastifyRequest } from 'fastify';
import helmet from '@fastify/helmet';
import cookie from '@fastify/cookie';
import fastifyStatic from '@fastify/static';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { openDb, type Db } from './db/index.ts';
import { deriveKey, readOrCreateSalt, KDF_PARAMS } from './kdf.ts';
import { avaliarSenha } from '../domain/senha.ts';

export interface AppOptions {
  dataDir: string;
  webDir?: string;
  kdfParams?: typeof KDF_PARAMS;
  /** ms per consecutive failure; tests pass 0 */
  delayPorErroMs?: number;
  now?: () => number;
}

export const COOKIE = '__Host-solis';
const IDLE_MS = 30 * 60 * 1000;
const JANELA_MS = 15 * 60 * 1000;
const MAX_ERROS = 5;

const senhaBody = {
  body: {
    type: 'object',
    required: ['senha'],
    additionalProperties: false,
    properties: { senha: { type: 'string', minLength: 1, maxLength: 1024 } },
  },
} as const;

export function buildApp(opts: AppOptions): FastifyInstance {
  const now = opts.now ?? Date.now;
  const kdfParams = opts.kdfParams ?? KDF_PARAMS;
  const delayMs = opts.delayPorErroMs ?? 1000;
  const dbPath = join(opts.dataDir, 'solis.db');
  const kdfPath = join(opts.dataDir, 'solis.kdf.json');

  let db: Db | null = null;
  let chave: Buffer | null = null;
  let close: (() => void) | null = null;
  const sessoes = new Map<string, number>();
  let erros: number[] = [];
  let errosSeguidos = 0;

  const app = Fastify({ logger: false, bodyLimit: 16 * 1024 });

  app.register(helmet, {
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", 'data:'],
        fontSrc: ["'self'"],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'none'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
      },
    },
    referrerPolicy: { policy: 'no-referrer' },
  });
  app.register(cookie);
  if (opts.webDir && existsSync(opts.webDir)) {
    app.register(fastifyStatic, { root: opts.webDir });
  }

  // SEC-06: any state-changing request must come from our own origin
  app.addHook('onRequest', async (req, reply) => {
    if (req.method === 'GET' || req.method === 'HEAD') return;
    if (req.headers.origin !== `${req.protocol}://${req.host}`) {
      return reply.code(403).send({ erro: 'origem' });
    }
  });

  function sessaoValida(req: FastifyRequest): boolean {
    const token = req.cookies[COOKIE];
    if (!token) return false;
    const visto = sessoes.get(token);
    if (visto === undefined || now() - visto > IDLE_MS) {
      sessoes.delete(token);
      return false;
    }
    sessoes.set(token, now());
    return true;
  }

  function novaSessao(): string {
    const token = randomBytes(32).toString('base64url');
    sessoes.set(token, now());
    return token;
  }

  const cookieOpts = { httpOnly: true, secure: true, sameSite: 'strict', path: '/' } as const;

  app.get('/api/status', (req) =>
    Promise.resolve({
      configurado: existsSync(dbPath),
      desbloqueado: db !== null,
      autenticado: sessaoValida(req),
    }),
  );

  app.post<{ Body: { senha: string } }>('/api/setup', { schema: senhaBody }, async (req, reply) => {
    if (existsSync(dbPath)) return reply.code(409).send({ erro: 'ja-configurado' });
    const av = avaliarSenha(req.body.senha);
    if (!av.forte) return reply.code(400).send({ erro: 'senha-fraca', sugestao: av.sugestao });
    const key = await deriveKey(req.body.senha, readOrCreateSalt(kdfPath), kdfParams);
    const aberto = openDb(dbPath, key);
    db = aberto.db;
    chave = key;
    close = () => aberto.sqlite.close();
    return reply.setCookie(COOKIE, novaSessao(), cookieOpts).send({ ok: true });
  });

  app.post<{ Body: { senha: string } }>('/api/login', { schema: senhaBody }, async (req, reply) => {
    if (!existsSync(dbPath)) return reply.code(409).send({ erro: 'nao-configurado' });
    erros = erros.filter((t) => now() - t < JANELA_MS);
    if (erros.length >= MAX_ERROS) return reply.code(429).send({ erro: 'muitas-tentativas' });

    const key = await deriveKey(req.body.senha, readOrCreateSalt(kdfPath), kdfParams);
    let ok: boolean;
    if (chave) {
      ok = timingSafeEqual(key, chave);
    } else {
      try {
        const aberto = openDb(dbPath, key);
        db = aberto.db;
        chave = key;
        close = () => aberto.sqlite.close();
        ok = true;
      } catch {
        ok = false;
      }
    }

    if (!ok) {
      erros.push(now());
      errosSeguidos++;
      await new Promise((r) => setTimeout(r, delayMs * errosSeguidos));
      return reply.code(401).send({ erro: 'senha-incorreta' });
    }
    errosSeguidos = 0;
    return reply.setCookie(COOKIE, novaSessao(), cookieOpts).send({ ok: true });
  });

  app.post('/api/logout', (req, reply) => {
    const token = req.cookies[COOKIE];
    if (token) sessoes.delete(token);
    return reply.clearCookie(COOKIE, { path: '/' }).send({ ok: true });
  });

  app.addHook('onClose', (_app, done) => {
    close?.();
    done();
  });
  return app;
}
