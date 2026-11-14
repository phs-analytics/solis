import { invoke } from '@tauri-apps/api/core';

export interface Status {
  configurado: boolean;
  desbloqueado: boolean;
  autenticado: boolean;
}

export type CodigoErro =
  | 'senha-fraca'
  | 'ja-configurado'
  | 'nao-configurado'
  | 'senha-incorreta'
  | 'muitas-tentativas'
  | 'interno';

export type Resultado = { ok: true } | { ok: false; erro: CodigoErro };

export const getStatus = () => invoke<Status>('status');
export const tocar = () => invoke<void>('tocar');
export const sair = () => invoke<void>('sair');

/** Rust's `Erro` arrives as "senha-incorreta" or, for internal errors, { interno: "..." }. */
async function chamar(cmd: string, args: Record<string, unknown>): Promise<Resultado> {
  try {
    await invoke(cmd, args);
    return { ok: true };
  } catch (e) {
    return { ok: false, erro: typeof e === 'string' ? (e as CodigoErro) : 'interno' };
  }
}

export const criarSenha = (senha: string) => chamar('criar_senha', { senha });
export const entrar = (senha: string) => chamar('entrar', { senha });
