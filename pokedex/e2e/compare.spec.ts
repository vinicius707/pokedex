import { test, expect } from '@playwright/test';

test.describe('Compare Pokemon', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/compare');
  });

  test('should display compare page', async ({ page }) => {
    const title = page.locator('.compare-view__title');
    await expect(title).toHaveText('Comparar Pokémon');
  });

  test('should display two search inputs', async ({ page }) => {
    const inputs = page.locator('.compare-view__input');
    await expect(inputs).toHaveCount(2);
  });

  test('should search for first pokemon', async ({ page }) => {
    const input = page.locator('.compare-view__input').first();
    await input.fill('pikachu');

    const searchButton = page.locator('.compare-view__search-btn').first();
    await searchButton.click();

    // Wait for pokemon to load
    await page.waitForSelector('.compare-view__pokemon', { timeout: 30000 });

    const pokemonName = page.locator('.compare-view__pokemon-name').first();
    await expect(pokemonName).toContainText('Pikachu');
  });

  test('should search for second pokemon', async ({ page }) => {
    const input = page.locator('.compare-view__input').last();
    await input.fill('charizard');

    const searchButton = page.locator('.compare-view__search-btn').last();
    await searchButton.click();

    // Wait for pokemon to load
    await page.waitForSelector('.compare-view__pokemon', { timeout: 30000 });

    const pokemonName = page.locator('.compare-view__pokemon-name').last();
    await expect(pokemonName).toContainText('Charizard');
  });

  test('should display hint when less than two pokemon selected', async ({
    page,
  }) => {
    const hint = page.locator('.compare-view__hint');
    await expect(hint).toBeVisible();
  });

  test('should display comparison when both pokemon selected', async ({
    page,
  }) => {
    // Search first pokemon
    await page.locator('.compare-view__input').first().fill('bulbasaur');
    await page.locator('.compare-view__search-btn').first().click();
    await page.waitForSelector('.compare-view__pokemon', { timeout: 30000 });

    // Search second pokemon
    await page.locator('.compare-view__input').last().fill('charmander');
    await page.locator('.compare-view__search-btn').last().click();

    // Wait for second pokemon
    await page.waitForFunction(
      () => document.querySelectorAll('.compare-view__pokemon').length === 2,
      { timeout: 30000 }
    );

    // Verify comparison is shown
    const comparison = page.locator('.compare-view__comparison');
    await expect(comparison).toBeVisible();
  });

  test('should show stats comparison', async ({ page }) => {
    // Search both pokemon
    await page.locator('.compare-view__input').first().fill('pikachu');
    await page.locator('.compare-view__search-btn').first().click();
    await page.waitForSelector('.compare-view__pokemon', { timeout: 30000 });

    await page.locator('.compare-view__input').last().fill('raichu');
    await page.locator('.compare-view__search-btn').last().click();

    await page.waitForFunction(
      () => document.querySelectorAll('.compare-view__pokemon').length === 2,
      { timeout: 30000 }
    );

    // Verify stats comparison
    const statsComparison = page.locator('.stats-comparison');
    await expect(statsComparison).toBeVisible();

    const statItems = page.locator('.stats-comparison__item');
    await expect(statItems).toHaveCount(6);
  });

  test('should clear pokemon selection', async ({ page }) => {
    // Search pokemon
    await page.locator('.compare-view__input').first().fill('pikachu');
    await page.locator('.compare-view__search-btn').first().click();
    await page.waitForSelector('.compare-view__pokemon', { timeout: 30000 });

    // Clear selection
    await page.locator('.compare-view__clear').click();

    // Verify pokemon is cleared
    const pokemon = page.locator('.compare-view__pokemon');
    await expect(pokemon).toHaveCount(0);
  });

  test('should show error for invalid pokemon', async ({ page }) => {
    const input = page.locator('.compare-view__input').first();
    await input.fill('notapokemon123');

    const searchButton = page.locator('.compare-view__search-btn').first();
    await searchButton.click();

    // Wait for error
    const error = page.locator('.compare-view__error').first();
    await expect(error).toBeVisible({ timeout: 30000 });
    await expect(error).toContainText('não encontrado');
  });

  test('should search with Enter key', async ({ page }) => {
    const input = page.locator('.compare-view__input').first();
    await input.fill('pikachu');
    await input.press('Enter');

    // Wait for pokemon to load
    await page.waitForSelector('.compare-view__pokemon', { timeout: 30000 });

    const pokemonName = page.locator('.compare-view__pokemon-name').first();
    await expect(pokemonName).toContainText('Pikachu');
  });

  test('should display pokemon types', async ({ page }) => {
    await page.locator('.compare-view__input').first().fill('pikachu');
    await page.locator('.compare-view__search-btn').first().click();

    await page.waitForSelector('.compare-view__type', { timeout: 30000 });

    const types = page.locator('.compare-view__type');
    const count = await types.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should navigate from navigation', async ({ page }) => {
    await page.goto('/');

    // Click compare link in navigation
    await page.locator('.app-nav__link', { hasText: 'Comparar' }).click();

    await expect(page).toHaveURL('/compare');
  });
});
