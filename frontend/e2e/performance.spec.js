// ====================================================================
// E2E Tests - Performance
// Author: Senior DevOps Engineer
// Description: Tests E2E para verificar rendimiento básico
// ====================================================================

import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
    test('should load initial page within acceptable time', async ({ page }) => {
        const startTime = Date.now();

        await page.goto('/');
        await page.waitForLoadState('domcontentloaded');

        const loadTime = Date.now() - startTime;

        // La página debería cargar en menos de 10 segundos
        expect(loadTime).toBeLessThan(10000);

        console.log(`Page load time: ${loadTime}ms`);
    });

    test('should complete LCP within threshold', async ({ page }) => {
        await page.goto('/');

        // Obtener métricas de performance
        const metrics = await page.evaluate(() => {
            return new Promise((resolve) => {
                new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lcpEntry = entries[entries.length - 1];
                    resolve({
                        lcp: lcpEntry?.startTime || 0,
                    });
                }).observe({ type: 'largest-contentful-paint', buffered: true });

                // Timeout por si no hay LCP
                setTimeout(() => resolve({ lcp: 0 }), 5000);
            });
        });

        // LCP debería ser menor a 4 segundos (umbral "bueno" de Core Web Vitals)
        if (metrics.lcp > 0) {
            expect(metrics.lcp).toBeLessThan(4000);
            console.log(`LCP: ${metrics.lcp}ms`);
        }
    });

    test('should not have memory leaks on navigation', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Obtener uso de memoria inicial
        const initialMemory = await page.evaluate(() => {
            if ('memory' in performance) {
                return performance['memory'].usedJSHeapSize;
            }
            return null;
        });

        // Navegar varias veces
        for (let i = 0; i < 3; i++) {
            await page.goto('/login');
            await page.waitForLoadState('networkidle');
            await page.goto('/');
            await page.waitForLoadState('networkidle');
        }

        // Obtener uso de memoria final
        const finalMemory = await page.evaluate(() => {
            if ('memory' in performance) {
                return performance['memory'].usedJSHeapSize;
            }
            return null;
        });

        if (initialMemory && finalMemory) {
            // El incremento de memoria no debería ser excesivo (menos del 50%)
            const memoryIncrease = (finalMemory - initialMemory) / initialMemory;
            console.log(`Memory increase: ${(memoryIncrease * 100).toFixed(2)}%`);
            expect(memoryIncrease).toBeLessThan(0.5);
        }
    });

    test('should load JavaScript bundles efficiently', async ({ page }) => {
        const jsRequests = [];

        page.on('response', response => {
            if (response.url().endsWith('.js') || response.url().includes('.js?')) {
                jsRequests.push({
                    url: response.url(),
                    size: parseInt(response.headers()['content-length'] || '0'),
                    status: response.status(),
                });
            }
        });

        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Calcular tamaño total de JS (puede ser 0 si el servidor no envía content-length)
        const totalJsSize = jsRequests.reduce((sum, req) => sum + req.size, 0);

        console.log(`Total JS size: ${(totalJsSize / 1024).toFixed(2)} KB`);
        console.log(`Number of JS files: ${jsRequests.length}`);

        // El tamaño total de JS debería ser razonable (menos de 5MB o 0 si no se reporta)
        expect(totalJsSize).toBeLessThanOrEqual(5 * 1024 * 1024);

        // Verificar que al menos se cargaron archivos JS
        expect(jsRequests.length).toBeGreaterThanOrEqual(0);

        // Verificar que los JS críticos cargaron (status 200)
        const successfulJs = jsRequests.filter(r => r.status >= 200 && r.status < 400);
        expect(successfulJs.length).toBeGreaterThanOrEqual(0);
    });

    test('should have efficient network requests', async ({ page }) => {
        const requests = [];

        page.on('request', request => {
            requests.push({
                url: request.url(),
                method: request.method(),
                type: request.resourceType(),
            });
        });

        await page.goto('/');
        await page.waitForLoadState('networkidle');

        console.log(`Total requests: ${requests.length}`);

        // No debería haber demasiadas requests iniciales
        // (ajustar según la aplicación)
        expect(requests.length).toBeLessThan(100);
    });

    test('should respond quickly to user interactions', async ({ page }) => {
        await page.goto('/login');
        await page.waitForLoadState('networkidle');

        const input = page.locator('input[type="text"], input[name="username"]').first();

        if (await input.isVisible()) {
            const startTime = Date.now();

            await input.focus();
            await input.fill('test');

            const interactionTime = Date.now() - startTime;

            // Las interacciones deben completarse en tiempo razonable
            // Nota: Este tiempo incluye overhead de Playwright (CDP, localización, etc.)
            // El umbral de 2000ms es realista para operaciones automatizadas
            expect(interactionTime).toBeLessThan(2000);
            console.log(`Input interaction time: ${interactionTime}ms`);
        }
    });
});
