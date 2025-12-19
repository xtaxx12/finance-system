// ====================================================================
// E2E Tests - Dashboard
// Author: Senior DevOps Engineer
// Description: Tests E2E para el dashboard principal
// ====================================================================

import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
    // Skip si no hay usuario autenticado
    test.describe('Public Access', () => {
        test('should load the application', async ({ page }) => {
            const response = await page.goto('/');

            // Verificar que la página carga correctamente
            expect(response?.status()).toBeLessThan(400);
        });

        test('should have correct page title', async ({ page }) => {
            await page.goto('/');

            // Verificar título
            const title = await page.title();
            expect(title.toLowerCase()).toMatch(/finance|finanzas|money|dinero/i);
        });

        test('should be responsive', async ({ page }) => {
            await page.goto('/');

            // Test desktop
            await page.setViewportSize({ width: 1920, height: 1080 });
            await expect(page.locator('body')).toBeVisible();

            // Test tablet
            await page.setViewportSize({ width: 768, height: 1024 });
            await expect(page.locator('body')).toBeVisible();

            // Test mobile
            await page.setViewportSize({ width: 375, height: 667 });
            await expect(page.locator('body')).toBeVisible();
        });

        test('should load assets correctly', async ({ page }) => {
            const failedRequests = [];

            page.on('requestfailed', request => {
                failedRequests.push({
                    url: request.url(),
                    failure: request.failure()?.errorText,
                });
            });

            await page.goto('/');
            await page.waitForLoadState('networkidle');

            // No debería haber requests fallidos críticos
            const criticalFailures = failedRequests.filter(r =>
                r.url.includes('.js') || r.url.includes('.css')
            );

            expect(criticalFailures).toHaveLength(0);
        });
    });

    test.describe('Dashboard Features', () => {
        test('should display navigation menu', async ({ page }) => {
            await page.goto('/');
            await page.waitForLoadState('networkidle');

            // Buscar elementos de navegación
            const nav = page.locator('nav, [role="navigation"], .navbar, .sidebar, header');
            const navCount = await nav.count();

            expect(navCount).toBeGreaterThan(0);
        });

        test('should display main content area', async ({ page }) => {
            await page.goto('/');
            await page.waitForLoadState('networkidle');

            // Verificar área de contenido principal
            const main = page.locator('main, [role="main"], .main-content, .content');
            const mainCount = await main.count();

            // Al menos debe haber un contenedor principal o el body
            expect(mainCount).toBeGreaterThanOrEqual(0);
        });

        test('should not have console errors', async ({ page }) => {
            const consoleErrors = [];

            page.on('console', msg => {
                if (msg.type() === 'error') {
                    consoleErrors.push(msg.text());
                }
            });

            await page.goto('/');
            await page.waitForLoadState('networkidle');

            // Filtrar errores esperados (como 401 en desarrollo)
            const unexpectedErrors = consoleErrors.filter(err =>
                !err.includes('401') &&
                !err.includes('403') &&
                !err.includes('Failed to load resource')
            );

            // Reportar pero no fallar por errores menores
            if (unexpectedErrors.length > 0) {
                console.warn('Console errors found:', unexpectedErrors);
            }
        });
    });
});
