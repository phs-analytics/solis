import { test, expect, type Page } from '@playwright/test';
import { injectAxe, getViolations } from 'axe-playwright';
import { ipcFalso } from './ipc-falso.ts';

const SENHA = 'Cavalo-Bateria-Grampo-42';
const TELAS = [
  ['Visão geral', 'Bom dia!'],
  ['Finanças', 'Finanças'],
  ['Tarefas', 'Tarefas'],
  ['Saúde', 'Saúde'],
] as const;

async function entrar(page: Page, tema: 'escuro' | 'claro' = 'escuro') {
  await page.addInitScript((t) => localStorage.setItem('solis.tema', t), tema);
  await ipcFalso(page, SENHA);
  await page.goto('/');
  await page.getByLabel('Senha').fill(SENHA);
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Bom dia!' })).toBeVisible();
}

for (const tema of ['escuro', 'claro'] as const) {
  test(`as 4 telas sem violações de acessibilidade no tema ${tema}`, async ({ page }) => {
    await entrar(page, tema);
    const nav = page.getByRole('navigation', { name: 'Principal' });
    for (const [link, titulo] of TELAS) {
      await nav.getByRole('link', { name: link }).click();
      await expect(page.getByRole('heading', { level: 1, name: titulo })).toBeVisible();
      await injectAxe(page);
      expect(await getViolations(page)).toEqual([]);
    }
  });
}

for (const largura of [360, 1280]) {
  test(`navegação e sem rolagem horizontal em ${largura}px`, async ({ page }) => {
    await page.setViewportSize({ width: largura, height: 800 });
    await entrar(page);
    for (const [link, titulo] of TELAS) {
      await page.getByRole('navigation').getByRole('link', { name: link }).click();
      await expect(page.getByRole('heading', { level: 1, name: titulo })).toBeVisible();
      const vaza = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(vaza, titulo).toBe(false);
    }
  });
}

test('ocultar valores esconde o saldo', async ({ page }) => {
  await entrar(page);
  await page.getByRole('button', { name: 'Ocultar valores' }).click();
  await expect(page.getByText('R$ •••••')).toBeVisible();
  await page.getByRole('button', { name: 'Mostrar valores' }).click();
  await expect(page.getByText('R$ •••••')).toHaveCount(0);
});

test('marcar tarefa risca o texto', async ({ page }) => {
  await entrar(page);
  await page.getByRole('link', { name: 'Tarefas' }).click();
  const caixa = page.getByRole('checkbox', { name: 'Pagar a conta de luz' });
  await caixa.check();
  await expect(caixa).toBeChecked();
});

test('avatar aparece, abre o assistente e troca de estado', async ({ page }) => {
  await entrar(page);
  const avatar = page.getByRole('img', { name: 'Assistente Solis' }).first();
  await expect(avatar).toBeVisible();
  const caixa = await avatar.boundingBox();
  expect(caixa?.width).toBeCloseTo(72, 0);

  await page.getByRole('button', { name: 'Abrir assistente Solis' }).click();
  const painel = page.getByRole('dialog', { name: 'Olá! Eu sou o Solis.' });
  await expect(painel).toBeVisible();
  await painel.getByRole('button', { name: 'Pensar' }).click();
  await painel.getByRole('button', { name: 'Fechar' }).click();
  await expect(painel).toBeHidden();
});
