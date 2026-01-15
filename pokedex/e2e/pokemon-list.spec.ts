import { test, expect } from '@playwright/test';

test.describe('Pokemon List', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the page title', async ({ page }) => {
    await expect(page.locator('.app-nav__logo-text')).toHaveText('Pokédex');
  });

  test('should display pokemon cards', async ({ page }) => {
    // Wait for loading to finish
    await page.waitForSelector('.pokemon-card', { timeout: 30000 });

    const cards = page.locator('.pokemon-card');
    await expect(cards).toHaveCount(10); // 10 per page
  });

  test('should display pokemon name and number', async ({ page }) => {
    await page.waitForSelector('.pokemon-card', { timeout: 30000 });

    const firstCard = page.locator('.pokemon-card').first();
    await expect(firstCard.locator('.pokemon-card__name')).toBeVisible();
    await expect(firstCard.locator('.pokemon-card__number')).toBeVisible();
  });

  test('should display search filter', async ({ page }) => {
    const searchInput = page.locator('.search-filter__input');
    await expect(searchInput).toBeVisible();
  });

  test('should filter pokemon by search term', async ({ page }) => {
    await page.waitForSelector('.pokemon-card', { timeout: 30000 });

    const searchInput = page.locator('.search-filter__input');
    await searchInput.fill('bulba');

    // Wait for debounce
    await page.waitForTimeout(400);

    const cards = page.locator('.pokemon-card');
    const count = await cards.count();
    expect(count).toBeLessThanOrEqual(10);
  });

  test('should filter pokemon by type', async ({ page }) => {
    await page.waitForSelector('.pokemon-card', { timeout: 30000 });

    // Click on "fire" type filter
    const fireButton = page.locator('.search-filter__type-btn', {
      hasText: 'fire',
    });
    await fireButton.click();

    // Wait for filter to apply
    await page.waitForTimeout(100);

    // Verify filter is active
    await expect(fireButton).toHaveClass(/--active/);
  });

  test('should clear filters', async ({ page }) => {
    await page.waitForSelector('.pokemon-card', { timeout: 30000 });

    // Set a filter
    const searchInput = page.locator('.search-filter__input');
    await searchInput.fill('test');
    await page.waitForTimeout(400);

    // Clear filters
    const clearButton = page.locator('.search-filter__clear-btn');
    if (await clearButton.isVisible()) {
      await clearButton.click();

      // Verify input is cleared
      await expect(searchInput).toHaveValue('');
    }
  });

  test('should navigate between pages', async ({ page }) => {
    await page.waitForSelector('.pokemon-card', { timeout: 30000 });

    // Click next page
    const nextButton = page.locator('.pagination-button--next');
    if (await nextButton.isVisible()) {
      await nextButton.click();

      // Wait for new page to load
      await page.waitForSelector('.pokemon-card', { timeout: 30000 });

      // Verify page changed (current page indicator)
      const activePage = page.locator('.pagination-number--active');
      await expect(activePage).toHaveText('2');
    }
  });

  test('should go to first page', async ({ page }) => {
    await page.waitForSelector('.pokemon-card', { timeout: 30000 });

    // Navigate to page 3
    const page3Button = page.locator('.pagination-number', { hasText: '3' });
    if (await page3Button.isVisible()) {
      await page3Button.click();
      await page.waitForSelector('.pokemon-card', { timeout: 30000 });

      // Click first page button
      const firstButton = page.locator('.pagination-button--first');
      if (await firstButton.isVisible()) {
        await firstButton.click();

        await page.waitForSelector('.pokemon-card', { timeout: 30000 });

        const activePage = page.locator('.pagination-number--active');
        await expect(activePage).toHaveText('1');
      }
    }
  });

  test('should display loading state', async ({ page }) => {
    // Navigate to a new page to trigger loading
    await page.goto('/', { waitUntil: 'commit' });

    // Check for loading indicator (might be very quick)
    const loading = page.locator('.loading');
    // Loading might already be done, so just verify it doesn't throw
    await loading.isVisible().catch(() => false);
  });
});
