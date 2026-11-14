/* eslint-disable @typescript-eslint/prefer-promise-reject-errors -- Tauri rejects invoke() with the serialized Rust error, a plain string */
import type { Page } from '@playwright/test';

/**
 * Stands in for the Rust core (src-tauri/src/cofre.rs) behind window.__TAURI_INTERNALS__,
 * which is what @tauri-apps/api's invoke() calls. Mirrors the command names and error codes.
 */
export async function ipcFalso(page: Page, senhaInicial?: string) {
  await page.addInitScript((inicial) => {
    let senha: string | null = inicial ?? null;
    let aberto = false;
    const w = window as unknown as { __TAURI_INTERNALS__: unknown };
    w.__TAURI_INTERNALS__ = {
      invoke(cmd: string, args: { senha?: string }) {
        switch (cmd) {
          case 'status':
            return Promise.resolve({
              configurado: senha !== null,
              desbloqueado: aberto,
              autenticado: aberto,
            });
          case 'criar_senha':
            if (senha !== null) return Promise.reject('ja-configurado');
            if ((args.senha ?? '').length < 12) return Promise.reject('senha-fraca');
            senha = args.senha!;
            aberto = true;
            return Promise.resolve(null);
          case 'entrar':
            if (args.senha !== senha) return Promise.reject('senha-incorreta');
            aberto = true;
            return Promise.resolve(null);
          case 'sair':
            aberto = false;
            return Promise.resolve(null);
          case 'tocar':
            return Promise.resolve(null);
          default:
            return Promise.reject(`comando desconhecido: ${cmd}`);
        }
      },
      transformCallback: () => 0,
    };
  }, senhaInicial);
}
