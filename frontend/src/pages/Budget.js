import React, { useState, useEffect } from 'react';
import { budgetApi } from '../services/budgetApi';
import { categoriesApi } from '../services/categoriesApi';

const Budget = () => {
  const [currentBudget, setCurrentBudget] = useState(null);
  const [budgetSummary, setBudgetSummary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  // Estados para formularios
  const [budgetForm, setBudgetForm] = useState({
    presupuesto_total: '',
    descripcion: ''
  });

  const [categoryForm, setCategoryForm] = useState({
    categoria: '',
    limite_asignado: '',
    alerta_porcentaje: 80
  });

  useEffect(() => {
    loadBudgetData();
    loadCategories();
  }, []);

  const loadBudgetData = async () => {
    try {
      setLoading(true);
      const budget = await budgetApi.getCurrentMonthBudget();
      
      if (budget) {
        setCurrentBudget(budget);
        const summary = await budgetApi.getBudgetSummary();
        setBudgetSummary(summary);
        setShowCreateForm(false);
      } else {
        setShowCreateForm(true);
      }
    } catch (error) {
      // Error manejado con estado
      setError('Error al cargar el presupuesto');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await categoriesApi.getCategories();
      setCategories(categoriesData.results || categoriesData);
    } catch (error) {
      // Error silenciado
    }
  };

  const handleCreateBudget = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await budgetApi.createCurrentMonthBudget(budgetForm);
      setBudgetForm({ presupuesto_total: '', descripcion: '' });
      await loadBudgetData();
    } catch (error) {
      // Error manejado con estado
      setError(error.response?.data?.error || 'Error al crear el presupuesto');
    }
  };

  const handleAddCategoryBudget = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await budgetApi.addCategoryBudget(currentBudget.id, categoryForm);
      setCategoryForm({ categoria: '', limite_asignado: '', alerta_porcentaje: 80 });
      setShowCategoryForm(false);
      await loadBudgetData();
    } catch (error) {
      // Error manejado con estado
      setError(error.response?.data?.error || 'Error al agregar presupuesto de categoría');
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando presupuesto...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Presupuesto</h1>
          <p className="mt-2 text-gray-600">Gestiona tu presupuesto mensual y controla tus gastos</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {showCreateForm ? (
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Crear Presupuesto del Mes Actual
            </h2>
            <form onSubmit={handleCreateBudget} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Presupuesto Total
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={budgetForm.presupuesto_total}
                  onChange={(e) => setBudgetForm({...budgetForm, presupuesto_total: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción (opcional)
                </label>
                <input
                  type="text"
                  value={budgetForm.descripcion}
                  onChange={(e) => setBudgetForm({...budgetForm, descripcion: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Crear Presupuesto
              </button>
            </form>
          </div>
        ) : currentBudget && (
          <>
            {/* Resumen General */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Presupuesto Total</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {formatCurrency(currentBudget.presupuesto_total)}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Gastado</h3>
                <p className="text-3xl font-bold text-red-600">
                  {formatCurrency(currentBudget.gastado_actual)}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Disponible</h3>
                <p className={`text-3xl font-bold ${currentBudget.disponible >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(currentBudget.disponible)}
                </p>
              </div>
            </div>

            {/* Barra de Progreso General */}
            <div className="bg-white p-6 rounded-lg shadow mb-8">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium text-gray-900">Progreso del Mes</h3>
                <span className="text-sm text-gray-600">
                  {currentBudget.porcentaje_gastado?.toFixed(1)}% gastado
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full transition-all duration-300 ${getProgressColor(currentBudget.porcentaje_gastado)}`}
                  style={{ width: `${Math.min(currentBudget.porcentaje_gastado, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Presupuestos por Categoría */}
            <div className="bg-white shadow rounded-lg p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Presupuestos por Categoría
                </h2>
                <button
                  onClick={() => setShowCategoryForm(!showCategoryForm)}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Agregar Categoría
                </button>
              </div>

              {showCategoryForm && (
                <form onSubmit={handleAddCategoryBudget} className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Categoría
                      </label>
                      <select
                        value={categoryForm.categoria}
                        onChange={(e) => setCategoryForm({...categoryForm, categoria: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Seleccionar categoría</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Límite Asignado
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={categoryForm.limite_asignado}
                        onChange={(e) => setCategoryForm({...categoryForm, limite_asignado: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Alerta (%)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={categoryForm.alerta_porcentaje}
                        onChange={(e) => setCategoryForm({...categoryForm, alerta_porcentaje: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Agregar
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCategoryForm(false)}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-4">
                {currentBudget.category_budgets?.map(categoryBudget => (
                  <div key={categoryBudget.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-gray-900">
                        {categoryBudget.categoria_nombre}
                      </h4>
                      <div className="text-sm text-gray-600">
                        {formatCurrency(categoryBudget.gastado_actual)} / {formatCurrency(categoryBudget.limite_asignado)}
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div
                        className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(categoryBudget.porcentaje_gastado)}`}
                        style={{ width: `${Math.min(categoryBudget.porcentaje_gastado, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className={categoryBudget.esta_excedido ? 'text-red-600' : 'text-gray-600'}>
                        {categoryBudget.porcentaje_gastado?.toFixed(1)}% gastado
                      </span>
                      <span className={categoryBudget.disponible >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(categoryBudget.disponible)} disponible
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alertas y Recomendaciones */}
            {budgetSummary?.recomendaciones?.length > 0 && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Recomendaciones
                </h2>
                <div className="space-y-3">
                  {budgetSummary.recomendaciones.map((rec, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-l-4 ${
                        rec.tipo === 'warning' ? 'bg-red-50 border-red-400' :
                        rec.tipo === 'caution' ? 'bg-yellow-50 border-yellow-400' :
                        'bg-blue-50 border-blue-400'
                      }`}
                    >
                      <h4 className="font-medium text-gray-900">{rec.titulo}</h4>
                      <p className="text-gray-700 mt-1">{rec.mensaje}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Budget;