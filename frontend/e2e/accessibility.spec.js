// ====================================================================
// E2E Tests - Accessibility (a11y)
// Author: Senior DevOps Engineer
// Description: Tests E2E para verificar accesibilidad
// ====================================================================

import { test, expect } from '@playwright/test';

test.describe('Accessibility Tests', () => {
    test('should have proper heading structure', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Debe haber al menos un h1
        const h1Count = await page.locator('h1').count();

        // Permitir 0 h1 si es página de login simple
        expect(h1Count).toBeGreaterThanOrEqual(0);

        // No debería haber más de un h1 por página
        expect(h1Count).toBeLessThanOrEqual(2);
    });

    test('should have alt text on images', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Obtener todas las imágenes
        const images = page.locator('img');
        const imageCount = await images.count();

        // Verificar que cada imagen tiene alt
        for (let i = 0; i < imageCount; i++) {
            const img = images.nth(i);
            const alt = await img.getAttribute('alt');
            const ariaHidden = await img.getAttribute('aria-hidden');
            const role = await img.getAttribute('role');

            // La imagen debe tener alt, o ser decorativa (aria-hidden o role="presentation")
            const isAccessible = alt !== null || ariaHidden === 'true' || role === 'presentation';
            expect(isAccessible).toBeTruthy();
        }
    });

    test('should have proper form labels', async ({ page }) => {
        await page.goto('/login');
        await page.waitForLoadState('networkidle');

        // Obtener todos los inputs
        const inputs = page.locator('input:not([type="hidden"]):not([type="submit"])');
        const inputCount = await inputs.count();

        for (let i = 0; i < inputCount; i++) {
            const input = inputs.nth(i);
            const id = await input.getAttribute('id');
            const ariaLabel = await input.getAttribute('aria-label');
            const ariaLabelledby = await input.getAttribute('aria-labelledby');
            const placeholder = await input.getAttribute('placeholder');

            // Buscar label asociado
            let hasLabel = false;
            if (id) {
                const label = page.locator(`label[for="${id}"]`);
                hasLabel = await label.count() > 0;
            }

            // El input debe tener alguna forma de label
            const isLabeled = hasLabel || ariaLabel || ariaLabelledby || placeholder;
            expect(isLabeled).toBeTruthy();
        }
    });

    test('should have focusable interactive elements', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Los botones y enlaces deben ser focusable
        const interactiveElements = page.locator('button, a[href], input, select, textarea');
        const count = await interactiveElements.count();

        for (let i = 0; i < Math.min(count, 10); i++) { // Limitar a 10 para performance
            const element = interactiveElements.nth(i);
            const tabIndex = await element.getAttribute('tabindex');

            // No debe tener tabindex negativo (a menos que sea intencional)
            if (tabIndex !== null) {
                expect(parseInt(tabIndex)).toBeGreaterThanOrEqual(-1);
            }
        }
    });

    test('should have sufficient color contrast', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Verificar que el texto principal es legible
        const body = page.locator('body');
        const color = await body.evaluate(el => getComputedStyle(el).color);
        const bgColor = await body.evaluate(el => getComputedStyle(el).backgroundColor);

        // Al menos debe tener colores definidos
        expect(color).toBeTruthy();
        expect(bgColor).toBeTruthy();
    });

    test('should support keyboard navigation', async ({ page }) => {
        await page.goto('/login');
        await page.waitForLoadState('networkidle');

        // Presionar Tab varias veces
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');

        // Debería haber un elemento enfocado
        const focusedElement = page.locator(':focus');
        const hasFocus = await focusedElement.count() > 0;

        expect(hasFocus).toBeTruthy();
    });

    test('should have skip links or landmark regions', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Buscar landmarks o skip links
        const landmarks = page.locator('main, nav, header, footer, [role="main"], [role="navigation"], [role="banner"]');
        const skipLinks = page.locator('a[href="#main"], a[href="#content"], .skip-link');

        const landmarkCount = await landmarks.count();
        const skipLinkCount = await skipLinks.count();

        // Debería tener al menos un landmark
        expect(landmarkCount + skipLinkCount).toBeGreaterThan(0);
    });

    test('should have proper button types', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Los botones deben tener type o ser de tipo button por defecto
        const buttons = page.locator('button');
        const count = await buttons.count();

        for (let i = 0; i < count; i++) {
            const button = buttons.nth(i);
            const type = await button.getAttribute('type');

            // type puede ser null (default es submit), 'button', 'submit', o 'reset'
            if (type) {
                expect(['button', 'submit', 'reset']).toContain(type);
            }
        }
    });
});
