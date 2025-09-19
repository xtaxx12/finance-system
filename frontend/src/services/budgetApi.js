import api from './api';

export const budgetApi = {
  // Obtener presupuesto del mes actual
  getCurrentMonthBudget: async () => {
    try {
      const response = await api.get('/budgets/monthly/current_month/');
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null; // No hay presupuesto para este mes
      }
      throw error;
    }
  },

  // Crear presupuesto para el mes actual
  createCurrentMonthBudget: async (budgetData) => {
    const response = await api.post('/budgets/monthly/create_current_month/', budgetData);
    return response.data;
  },

  // Obtener resumen completo de presupuestos
  getBudgetSummary: async () => {
    const response = await api.get('/budgets/monthly/summary/');
    return response.data;
  },

  // Agregar presupuesto para una categoría
  addCategoryBudget: async (budgetId, categoryData) => {
    const response = await api.post(`/budgets/monthly/${budgetId}/add_category_budget/`, categoryData);
    return response.data;
  },

  // Obtener todos los presupuestos mensuales
  getMonthlyBudgets: async () => {
    const response = await api.get('/budgets/monthly/');
    return response.data;
  },

  // Obtener presupuestos por categoría
  getCategoryBudgets: async () => {
    const response = await api.get('/budgets/categories/');
    return response.data;
  },

  // Obtener alertas de presupuesto
  getBudgetAlerts: async () => {
    const response = await api.get('/budgets/alerts/');
    return response.data;
  },

  // Descartar una alerta
  dismissAlert: async (alertId) => {
    const response = await api.post(`/budgets/alerts/${alertId}/dismiss/`);
    return response.data;
  },

  // Actualizar presupuesto mensual
  updateMonthlyBudget: async (budgetId, budgetData) => {
    const response = await api.put(`/budgets/monthly/${budgetId}/`, budgetData);
    return response.data;
  },

  // Eliminar presupuesto mensual
  deleteMonthlyBudget: async (budgetId) => {
    const response = await api.delete(`/budgets/monthly/${budgetId}/`);
    return response.data;
  }
};