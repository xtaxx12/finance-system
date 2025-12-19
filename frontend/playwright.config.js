// ====================================================================
// Playwright Configuration - Finance System E2E Tests
// Author: Senior DevOps Engineer
// ====================================================================

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    // Directorio de tests
    testDir: './e2e',

    // Paralelización
    fullyParallel: true,

    // Fallar el build si dejaste test.only
    forbidOnly: !!process.env.CI,

    // Reintentos en CI
    retries: process.env.CI ? 2 : 0,

    // Workers
    workers: process.env.CI ? 1 : undefined,

    // Reporter
    reporter: [
        ['html', { open: 'never' }],
        ['json', { outputFile: 'playwright-report/results.json' }],
        ['github'],
    ],

    // Configuración global de tests
    use: {
        // Base URL
        baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',

        // Recoger trazas en caso de fallo
        trace: 'on-first-retry',

        // Screenshots
        screenshot: 'only-on-failure',

        // Video
        video: 'on-first-retry',

        // Timeouts
        actionTimeout: 15000,
        navigationTimeout: 30000,
    },

    // Timeouts globales
    timeout: 60000,
    expect: {
        timeout: 10000,
    },

    // Proyectos (navegadores)
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
        },
        // Tests mobile
        {
            name: 'Mobile Chrome',
            use: { ...devices['Pixel 5'] },
        },
        {
            name: 'Mobile Safari',
            use: { ...devices['iPhone 12'] },
        },
    ],

    // Servidor de desarrollo local
    // Deshabilitado por defecto - iniciar manualmente con: npm run dev
    // Para habilitar webServer automático, descomenta el bloque siguiente
    // webServer: {
    //     command: 'npm run dev',
    //     url: 'http://localhost:3000',
    //     reuseExistingServer: true,
    //     timeout: 120000,
    // },
});
