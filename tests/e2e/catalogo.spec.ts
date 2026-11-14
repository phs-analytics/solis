import { test, expect, type Page } from '@playwright/test';
import { injectAxe, getViolations } from 'axe-playwright';

async function abrir(page: Page, tema: 'escuro' | 'claro') {
  await page.addInitScript((t) => {
    localStorage.setItem('solis.tema', t);
  }, tema);
  await page.goto('/#catalogo');
  await expect(page.getByRole('heading', { name: 'Catálogo de componentes' })).toBeVisible();
}

for (const tema of ['escuro', 'claro'] as const) {
  test(`axe sem violações no tema ${tema}`, async ({ page }) => {
    await abrir(page, tema);
    await expect(page.locator('html')).toHaveAttribute(
      'data-theme',
      tema === 'claro' ? 'light' : 'dark',
    );
    await injectAxe(page);
    expect(await getViolations(page)).toEqual([]);
  });
}

for (const largura of [360, 1280]) {
  test(`fonte 200% sem rolagem horizontal em ${largura}px`, async ({ page }) => {
    await page.setViewportSize({ width: largura, height: 800 });
    await abrir(page, 'escuro');
    await page.evaluate(() => (document.documentElement.style.fontSize = '200%'));
    const vaza = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(vaza).toBe(false);
  });
}

test('alvos de toque ≥ 44×44 px', async ({ page }) => {
  await abrir(page, 'escuro');
  const pequenos = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>('button, a, input')]
      .filter((el) => el.offsetParent !== null)
      .map((el) => ({ el: el.outerHTML.slice(0, 60), r: el.getBoundingClientRect() }))
      .filter(({ r }) => r.width < 44 || r.height < 44)
      .map(({ el }) => el),
  );
  expect(pequenos).toEqual([]);
});

test('tudo alcançável pelo teclado com foco visível', async ({ page }) => {
  await abrir(page, 'escuro');
  const total = await page.locator('button:not(:disabled), a[href], input:not(:disabled)').count();
  for (let i = 0; i < total; i++) {
    await page.keyboard.press('Tab');
    const outline = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      return getComputedStyle(el).outlineStyle;
    });
    expect(outline).not.toBe('none');
  }
});

test('reduzir efeitos tira o blur do vidro', async ({ page }) => {
  await abrir(page, 'escuro');
  await page.getByRole('button', { name: 'Reduzir efeitos' }).click();
  const filtro = await page
    .locator('.card-vidro')
    .first()
    .evaluate((el) => getComputedStyle(el).backdropFilter);
  expect(filtro).toBe('none');
});

test('campo de dinheiro preenche da direita', async ({ page }) => {
  await abrir(page, 'escuro');
  const campo = page.getByLabel('Valor', { exact: true });
  await campo.fill('');
  await campo.pressSequentially('4599');
  await expect(campo).toHaveValue(/R\$\s45,99/);
});
