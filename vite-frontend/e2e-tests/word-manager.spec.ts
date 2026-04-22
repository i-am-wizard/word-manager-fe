import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('/api/word', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ word: 'hello' }),
      });
    } else if (route.request().method() === 'PUT') {
      const body = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ word: body.word }),
      });
    }
  });
});

test('1. Initial Page Load', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Word Manager' })).toBeVisible();
  await expect(page.getByText('hello')).toBeVisible();
});

test('2. Update Word - Happy Path', async ({ page }) => {
  let capturedBody: { word: string } | null = null;

  await page.route('/api/word', async (route) => {
    if (route.request().method() === 'PUT') {
      capturedBody = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ word: capturedBody!.word }),
      });
    } else {
      const currentWord = capturedBody?.word ?? 'hello';
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ word: currentWord }),
      });
    }
  });

  await page.goto('/');
  await expect(page.getByText('hello')).toBeVisible();

  await page.getByPlaceholder('Enter new word').fill('world');
  await page.getByRole('button', { name: 'Update Word' }).click();

  expect(capturedBody).toEqual({ word: 'world' });
  await expect(page.getByText('world')).toBeVisible();
});

test('3. Empty Input - Button Disabled', async ({ page }) => {
  await page.goto('/');
  const button = page.getByRole('button', { name: 'Update Word' });
  await expect(button).toBeDisabled();

  await page.getByPlaceholder('Enter new word').fill('something');
  await page.getByPlaceholder('Enter new word').clear();
  await expect(button).toBeDisabled();
});

test('4. Whitespace-Only Input', async ({ page }) => {
  await page.goto('/');
  await page.getByPlaceholder('Enter new word').fill('   ');
  await expect(page.getByRole('button', { name: 'Update Word' })).toBeDisabled();
});
