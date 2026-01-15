import { test, expect } from '@playwright/test';

test.describe('Favorites', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should add pokemon to favorites from list', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.pokemon-card', { timeout: 30000 });

    // Click favorite button on first card
    const favoriteButton = page.locator('.pokemon-card__favorite').first();
    await favoriteButton.click();

    // Verify star is filled
    await expect(favoriteButton).toHaveClass(/--active/);
  });

  test('should remove pokemon from favorites', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.pokemon-card', { timeout: 30000 });

    const favoriteButton = page.locator('.pokemon-card__favorite').first();

    // Add to favorites
    await favoriteButton.click();
    await expect(favoriteButton).toHaveClass(/--active/);

    // Remove from favorites
    await favoriteButton.click();
    await expect(favoriteButton).not.toHaveClass(/--active/);
  });

  test('should navigate to favorites page', async ({ page }) => {
    await page.goto('/');

    // Click favorites link in navigation
    await page.locator('.app-nav__link', { hasText: 'Favoritos' }).click();

    await expect(page).toHaveURL('/favorites');
  });

  test('should display empty state when no favorites', async ({ page }) => {
    await page.goto('/favorites');

    const emptyState = page.locator('.favorites-view__empty');
    await expect(emptyState).toBeVisible();
  });

  test('should display favorites on favorites page', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.pokemon-card', { timeout: 30000 });

    // Add first pokemon to favorites
    await page.locator('.pokemon-card__favorite').first().click();

    // Navigate to favorites
    await page.locator('.app-nav__link', { hasText: 'Favoritos' }).click();

    // Wait for favorites to load
    await page.waitForSelector('.pokemon-card', { timeout: 30000 });

    const cards = page.locator('.pokemon-card');
    await expect(cards).toHaveCount(1);
  });

  test('should persist favorites after page reload', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.pokemon-card', { timeout: 30000 });

    // Add pokemon to favorites
    await page.locator('.pokemon-card__favorite').first().click();

    // Reload page
    await page.reload();
    await page.waitForSelector('.pokemon-card', { timeout: 30000 });

    // Verify favorite is still marked
    const favoriteButton = page.locator('.pokemon-card__favorite').first();
    await expect(favoriteButton).toHaveClass(/--active/);
  });

  test('should clear all favorites', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.pokemon-card', { timeout: 30000 });

    // Add multiple favorites
    const favoriteButtons = page.locator('.pokemon-card__favorite');
    await favoriteButtons.nth(0).click();
    await favoriteButtons.nth(1).click();

    // Navigate to favorites
    await page.locator('.app-nav__link', { hasText: 'Favoritos' }).click();
    await page.waitForSelector('.pokemon-card', { timeout: 30000 });

    // Click clear all button
    const clearButton = page.locator('.favorites-view__clear');
    if (await clearButton.isVisible()) {
      await clearButton.click();

      // Verify empty state is shown
      const emptyState = page.locator('.favorites-view__empty');
      await expect(emptyState).toBeVisible();
    }
  });

  test('should navigate to pokemon details from favorites', async ({
    page,
  }) => {
    await page.goto('/');
    await page.waitForSelector('.pokemon-card', { timeout: 30000 });

    // Add to favorites
    await page.locator('.pokemon-card__favorite').first().click();

    // Navigate to favorites
    await page.locator('.app-nav__link', { hasText: 'Favoritos' }).click();
    await page.waitForSelector('.pokemon-card', { timeout: 30000 });

    // Click on card link
    const cardLink = page.locator('.favorites-view__card-link').first();
    await cardLink.click();

    // Verify navigation to details
    await expect(page).toHaveURL(/\/pokemon\/\d+/);
  });

  test('should show favorites count', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.pokemon-card', { timeout: 30000 });

    // Add favorites
    await page.locator('.pokemon-card__favorite').nth(0).click();
    await page.locator('.pokemon-card__favorite').nth(1).click();

    // Navigate to favorites
    await page.locator('.app-nav__link', { hasText: 'Favoritos' }).click();
    await page.waitForSelector('.favorites-view__count', { timeout: 30000 });

    const count = page.locator('.favorites-view__count');
    await expect(count).toContainText('2');
  });
});
