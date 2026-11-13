import { test, expect, type Page } from '@playwright/test';
import { injectAxe, getViolations } from 'axe-playwright';

const SENHA = 'Cavalo-Bateria-Grampo-42';

async function semViolacoes(page: Page) {
  await injectAxe(page);
  expect(await getViolations(page)).toEqual([]);
}

test.describe.configure({ mode: 'serial' });

test('criar senha: recusa fraca, aceita forte', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Criar senha' })).toBeVisible();
  await semViolacoes(page);

  await page.getByLabel('Senha (mínimo 12 caracteres)').fill('solis2026');
  await page.getByLabel('Repita a senha').fill('solis2026');
  await page.getByRole('button', { name: 'Criar senha' }).click();
  await expect(page.getByRole('alert')).toBeVisible();

  await page.getByLabel('Senha (mínimo 12 caracteres)').fill(SENHA);
  await page.getByLabel('Repita a senha').fill(SENHA);
  await expect(page.getByText('Senha forte.')).toBeVisible();
  await page.getByRole('button', { name: 'Criar senha' }).click();
  await expect(page.getByText('Seus dados estão abertos.')).toBeVisible();
  await page.getByRole('button', { name: 'Sair' }).click();
  await expect(page.getByRole('heading', { name: 'Entrar no Solis' })).toBeVisible();
});

test('entrar de novo, só pelo teclado', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Entrar no Solis' })).toBeVisible();
  await semViolacoes(page);

  await page.getByLabel('Senha').fill('senha-errada-qualquer');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('alert')).toHaveText('Senha incorreta.');

  await page.getByLabel('Senha').fill(SENHA);
  await page.keyboard.press('Enter');
  await expect(page.getByText('Seus dados estão abertos.')).toBeVisible();
});

test('não pode ser aberto num iframe', async ({ request }) => {
  const r = await request.get('/');
  expect(r.headers()['content-security-policy']).toContain("frame-ancestors 'none'");
});
