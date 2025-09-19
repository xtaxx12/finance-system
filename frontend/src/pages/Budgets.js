import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const Budgets = () => {
  const [currentBudget, setCurrentBudget] = useState(null);
  const [categories, setCategories] = useState([]);
  const [budgetSummary, setBudgetSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [formData, setFormData] = useState({
    presupuesto_total: ''
  });
  const [categoryFormData, setCategoryFormData] = useState({
    categoria: '',
    limite_asignado: '',
    alerta_porcentaje: 80
  });

  useEffect(() => {
    fetchCurrentBudget();
    fetchCategories();
  }, []);

  const fetchCurrentBudget = async () => {
    setLoading(true);
    try {
      const response = await api.get('/budgets/monthly/current_month/');
      setCurrentBudget(response.data);
      fetchBudgetSummary();
    } catch (error) {
      if (error.response?.status === 404) {
        setCurrentBudget(null);
      } else {
        toast.error('Error al cargar presupuesto');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchBudgetSummary = async () => {
    try {
      const response = await api.get('/budgets/monthly/summary/');
      setBudgetSummary(response.data);
    } catch (error) {
      // Silenciar error si no hay resumen disponible
      if (error.response?.status !== 404) {
        toast.error('Error al cargar resumen de presupuesto');
      }
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories/');
      setCategories(response.data.results || response.data);
    } catch (error) {
      toast.error('Error al cargar categorías');
    }
  };

  const handleCreateBudget = async (e) => {
    e.preventDefault();
    try {
      await api.post('/budgets/monthly/create_current_month/', formData);
      toast.success('Presupuesto mensual creado exitosamente');
      setShowCreateForm(false);
      setFormData({ presupuesto_total: '' });
      fetchCurrentBudget();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error al crear presupuesto';
      toast.error(errorMessage);
    }
  };

  const handleAddCategoryBudget = async (e) => {
    e.preventDefault();
    if (!currentBudget) return;

    try {
      await api.post(`/budgets/monthly/${currentBudget.id}/add_category_budget/`, categoryFormData);
      toast.success('Presupuesto de categoría agregado exitosamente');
      setShowCategoryForm(false);
      setCategoryFormData({ categoria: '', limite_asignado: '', alerta_porcentaje: 80 });
      fetchCurrentBudget();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error al agregar presupuesto de categoría';
      toast.error(errorMessage);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'saludable': return '#28a745';
      case 'moderado': return '#ffc107';
      case 'alerta': return '#fd7e14';
      case 'excedido': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusIcon = (estado) => {
    switch (estado) {
      case 'saludable': return '✅';
      case 'moderado': return '⚠️';
      case 'alerta': return '🚨';
      case 'excedido': return '❌';
      default: return '📊';
    }
  };

  const getCurrentMonth = () => {
    const now = new Date();
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return `${months[now.getMonth()]} ${now.getFullYear()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando presupuestos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              💰 Presupuestos Mensuales
            </h1>
            <p className="text-gray-600 text-lg">
              Controla tus gastos y mantente dentro de tus límites
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            {currentBudget && (
              <button 
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white transition-colors ${
                  showCategoryForm 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
                onClick={() => setShowCategoryForm(!showCategoryForm)}
              >
                <span className="mr-2">{showCategoryForm ? '✕' : '🏷️'}</span>
                {showCategoryForm ? 'Cancelar' : 'Agregar Categoría'}
              </button>
            )}
            {!currentBudget && (
              <button 
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white transition-colors ${
                  showCreateForm 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
                onClick={() => setShowCreateForm(!showCreateForm)}
              >
                <span className="mr-2">{showCreateForm ? '✕' : '💰'}</span>
                {showCreateForm ? 'Cancelar' : 'Crear Presupuesto'}
              </button>
            )}
          </div>
        </div>

        {/* Formulario para crear presupuesto mensual */}
        {showCreateForm && !currentBudget && (
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Crear Presupuesto para {getCurrentMonth()}
            </h3>
            <form onSubmit={handleCreateBudget} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Presupuesto Total Mensual
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.presupuesto_total}
                  onChange={(e) => setFormData({...formData, presupuesto_total: e.target.value})}
                  placeholder="Ej: 15000.00"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Este será tu límite total de gastos para el mes actual
                </p>
              </div>
              <button 
                type="submit" 
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                Crear Presupuesto
              </button>
            </form>
          </div>
        )}

        {/* Formulario para agregar presupuesto de categoría */}
        {showCategoryForm && currentBudget && (
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Agregar Presupuesto por Categoría
            </h3>
            <form onSubmit={handleAddCategoryBudget} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={categoryFormData.categoria}
                    onChange={(e) => setCategoryFormData({...categoryFormData, categoria: e.target.value})}
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.filter(cat => 
                      !currentBudget.category_budgets?.some(cb => cb.categoria === cat.id)
                    ).map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.nombre}</option>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={categoryFormData.limite_asignado}
                    onChange={(e) => setCategoryFormData({...categoryFormData, limite_asignado: e.target.value})}
                    placeholder="Ej: 3000.00"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Porcentaje de Alerta (%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={categoryFormData.alerta_porcentaje}
                  onChange={(e) => setCategoryFormData({...categoryFormData, alerta_porcentaje: e.target.value})}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Te alertaremos cuando alcances este porcentaje del límite
                </p>
              </div>
              <div className="flex space-x-3">
                <button 
                  type="submit" 
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors font-medium"
                >
                  Agregar Presupuesto
                </button>
                <button 
                  type="button"
                  onClick={() => setShowCategoryForm(false)}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors font-medium"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Resumen del presupuesto actual */}
        {currentBudget ? (
          <div>
            {/* Resumen general */}
            <div className="bg-white shadow rounded-lg p-6 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                📊 Resumen de {getCurrentMonth()}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <h4 className="text-sm font-medium text-blue-600 mb-2">Presupuesto Total</h4>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(currentBudget.presupuesto_total)}
                  </p>
                </div>
                <div className="text-center">
                  <h4 className="text-sm font-medium text-red-600 mb-2">Gastado</h4>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(currentBudget.gastado_actual)}
                  </p>
                </div>
                <div className="text-center">
                  <h4 className={`text-sm font-medium mb-2 ${
                    currentBudget.esta_excedido ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {currentBudget.esta_excedido ? 'Excedido' : 'Disponible'}
                  </h4>
                  <p className={`text-2xl font-bold ${
                    currentBudget.esta_excedido ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {currentBudget.esta_excedido 
                      ? formatCurrency(currentBudget.gastado_actual - currentBudget.presupuesto_total)
                      : formatCurrency(currentBudget.presupuesto_restante || (currentBudget.presupuesto_total - currentBudget.gastado_actual))
                    }
                  </p>
                </div>
              </div>

              {/* Barra de progreso general */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Progreso del mes</span>
                  <span className="text-sm text-gray-600">
                    {currentBudget.porcentaje_gastado?.toFixed(1) || '0.0'}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full transition-all duration-300 ${
                      currentBudget.esta_excedido ? 'bg-red-500' : 
                      (currentBudget.porcentaje_gastado || 0) > 80 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(currentBudget.porcentaje_gastado || 0, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Información adicional */}
              <div className="flex flex-col sm:flex-row sm:justify-between text-sm text-gray-600 space-y-1 sm:space-y-0">
                <span>Días restantes: {currentBudget.dias_restantes_mes || 'N/A'}</span>
                <span>Presupuesto diario sugerido: {formatCurrency(currentBudget.presupuesto_diario_sugerido || 0)}</span>
              </div>
            </div>

            {/* Presupuestos por categoría */}
            {currentBudget.category_budgets && currentBudget.category_budgets.length > 0 && (
              <div className="bg-white shadow rounded-lg p-6 mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  📋 Presupuestos por Categoría
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {currentBudget.category_budgets.map(categoryBudget => (
                    <div 
                      key={categoryBudget.id} 
                      className="bg-gray-50 rounded-lg p-4 border-l-4"
                      style={{ borderLeftColor: getStatusColor(categoryBudget.estado) }}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getStatusIcon(categoryBudget.estado)}</span>
                          <h4 className="font-medium text-gray-900">
                            {categoryBudget.categoria_info?.nombre || categoryBudget.categoria_nombre || 'Categoría'}
                          </h4>
                        </div>
                        <span 
                          className="text-xs px-2 py-1 rounded-full text-white font-medium"
                          style={{ backgroundColor: getStatusColor(categoryBudget.estado) }}
                        >
                          {(categoryBudget.estado || 'normal').toUpperCase()}
                        </span>
                      </div>

                      <div className="mb-3">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>Gastado: {formatCurrency(categoryBudget.gastado_actual || 0)}</span>
                          <span>Límite: {formatCurrency(categoryBudget.limite_asignado || 0)}</span>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="h-3 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${Math.min(categoryBudget.porcentaje_gastado || 0, 100)}%`,
                              backgroundColor: getStatusColor(categoryBudget.estado)
                            }}
                          ></div>
                        </div>
                        
                        <div className="text-center text-xs text-gray-500 mt-1">
                          {(categoryBudget.porcentaje_gastado || 0).toFixed(1)}% utilizado
                        </div>
                      </div>

                      <div className="text-xs text-gray-600">
                        <div>Disponible: {formatCurrency((categoryBudget.limite_asignado || 0) - (categoryBudget.gastado_actual || 0))}</div>
                        {categoryBudget.esta_excedido && (
                          <div className="text-red-600 font-bold mt-1">
                            Excedido por: {formatCurrency((categoryBudget.gastado_actual || 0) - (categoryBudget.limite_asignado || 0))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recomendaciones */}
            {budgetSummary && budgetSummary.recomendaciones && budgetSummary.recomendaciones.length > 0 && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  💡 Recomendaciones
                </h3>
                <div className="space-y-3">
                  {budgetSummary.recomendaciones.map((rec, index) => (
                    <div 
                      key={index} 
                      className={`p-4 rounded-lg border-l-4 ${
                        rec.tipo === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                        rec.tipo === 'caution' ? 'bg-blue-50 border-blue-400' : 
                        'bg-green-50 border-green-400'
                      }`}
                    >
                      <h5 className="font-medium text-gray-900 mb-1">{rec.titulo}</h5>
                      <p className="text-sm text-gray-700">{rec.mensaje}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <div className="text-6xl mb-6">💰</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No tienes presupuesto para este mes
            </h3>
            <p className="text-gray-600 mb-6">
              Crea tu primer presupuesto mensual para empezar a controlar tus gastos
            </p>
            <button 
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
              onClick={() => setShowCreateForm(true)}
            >
              Crear Presupuesto
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Budgets;