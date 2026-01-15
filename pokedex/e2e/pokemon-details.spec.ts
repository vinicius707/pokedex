import { test, expect } from '@playwright/test';

test.describe('Pokemon Details', () => {
  test('should navigate to pokemon details on card click', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.pokemon-card', { timeout: 30000 });

    // Click on first pokemon card
    const firstCard = page.locator('.pokemon-card').first();
    await firstCard.click();

    // Verify navigation to details page
    await expect(page).toHaveURL(/\/pokemon\/\d+/);
  });

  test('should display pokemon details', async ({ page }) => {
    await page.goto('/pokemon/1');

    // Wait for details to load
    await page.waitForSelector('.pokemon-details__name', { timeout: 30000 });

    // Verify pokemon name is displayed
    const name = page.locator('.pokemon-details__name');
    await expect(name).toBeVisible();
  });

  test('should display pokemon stats', async ({ page }) => {
    await page.goto('/pokemon/1');
    await page.waitForSelector('.stats-chart', { timeout: 30000 });

    // Verify stats are displayed
    const statsChart = page.locator('.stats-chart');
    await expect(statsChart).toBeVisible();

    // Check for individual stat items
    const statItems = page.locator('.stats-chart__item');
    await expect(statItems).toHaveCount(6); // HP, Attack, Defense, Sp. Atk, Sp. Def, Speed
  });

  test('should display pokemon abilities', async ({ page }) => {
    await page.goto('/pokemon/1');
    await page.waitForSelector('.pokemon-details__abilities', { timeout: 30000 });

    const abilities = page.locator('.pokemon-details__ability');
    const count = await abilities.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display evolution chain', async ({ page }) => {
    await page.goto('/pokemon/1');
    await page.waitForSelector('.evolution-chain', { timeout: 30000 });

    const evolutionChain = page.locator('.evolution-chain');
    await expect(evolutionChain).toBeVisible();
  });

  test('should toggle favorite from details page', async ({ page }) => {
    await page.goto('/pokemon/1');
    await page.waitForSelector('.pokemon-details__favorite', { timeout: 30000 });

    const favoriteButton = page.locator('.pokemon-details__favorite');
    const initialState = await favoriteButton.textContent();

    // Click to toggle
    await favoriteButton.click();

    // Verify state changed
    const newState = await favoriteButton.textContent();
    expect(newState).not.toBe(initialState);
  });

  test('should navigate back to list', async ({ page }) => {
    await page.goto('/pokemon/1');
    await page.waitForSelector('.pokemon-details__back', { timeout: 30000 });

    // Click back button
    await page.locator('.pokemon-details__back').click();

    // Verify navigation back to list
    await expect(page).toHaveURL('/');
  });

  test('should display pokemon image', async ({ page }) => {
    await page.goto('/pokemon/1');
    await page.waitForSelector('.pokemon-details__image', { timeout: 30000 });

    const image = page.locator('.pokemon-details__image');
    await expect(image).toBeVisible();
  });

  test('should display pokemon types', async ({ page }) => {
    await page.goto('/pokemon/1');
    await page.waitForSelector('.pokemon-details__type', { timeout: 30000 });

    const types = page.locator('.pokemon-details__type');
    const count = await types.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should navigate to evolution pokemon', async ({ page }) => {
    await page.goto('/pokemon/1');
    await page.waitForSelector('.evolution-chain__link', { timeout: 30000 });

    // Click on second evolution
    const evolutionLinks = page.locator('.evolution-chain__link');
    const count = await evolutionLinks.count();

    if (count > 1) {
      await evolutionLinks.nth(1).click();

      // Verify navigation to new pokemon
      await expect(page).toHaveURL(/\/pokemon\/\d+/);
    }
  });
});
