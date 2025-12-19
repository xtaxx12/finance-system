// ====================================================================
// E2E Test Fixtures - Finance System
// Author: Senior DevOps Engineer
// Description: Fixtures base para tests E2E
// ====================================================================

import { test as base, expect } from '@playwright/test';

// Configuración del servidor API para tests
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';

/**
 * Usuario de prueba para tests
 */
const testUser = {
    username: 'testuser_e2e',
    email: 'e2e@test.com',
    password: 'TestPass123!',
};

/**
 * Extended test con fixtures personalizados
 */
export const test = base.extend({
    // Fixture: Usuario autenticado
    authenticatedPage: async ({ page }, use) => {
        // Navegar al login
        await page.goto('/login');

        // Esperar a que cargue la página
        await page.waitForLoadState('networkidle');

        // Intentar login
        await page.fill('input[name="username"], input[type="text"]', testUser.username);
        await page.fill('input[name="password"], input[type="password"]', testUser.password);
        await page.click('button[type="submit"]');

        // Esperar redirección al dashboard
        await page.waitForURL(/\/(dashboard|home)?$/);

        await use(page);
    },

    // Fixture: API client helper
    apiHelper: async ({ request }, use) => {
        const helper = {
            baseUrl: API_BASE_URL,

            // Obtener CSRF token
            async getCsrfToken() {
                const response = await request.get(`${API_BASE_URL}/api/auth/csrf/`);
                const data = await response.json();
                return data.csrfToken;
            },

            // Login via API
            async login(username = testUser.username, password = testUser.password) {
                const csrfToken = await this.getCsrfToken();
                const response = await request.post(`${API_BASE_URL}/api/auth/login/`, {
                    data: { username, password },
                    headers: { 'X-CSRFToken': csrfToken },
                });
                return response;
            },

            // Crear transacción de prueba
            async createTransaction(type, data, csrfToken) {
                const endpoint = type === 'income' ? 'ingresos' : 'gastos';
                return await request.post(`${API_BASE_URL}/api/transactions/${endpoint}/`, {
                    data,
                    headers: { 'X-CSRFToken': csrfToken },
                });
            },
        };

        await use(helper);
    },
});

export { expect };
export { testUser };
