import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const Budgets = () => {
  const { colors, isDarkMode } = useTheme();
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
      console.error('Error fetching budget summary:', error);
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
    return <div className="text-center">Cargando presupuestos...</div>;
  }

  return (
    <div className="container animate-fade-in">
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem' 
      }}>
        <div>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: '700', 
            color: colors.textPrimary,
            marginBottom: '0.5rem',
          }}>
            💰 Presupuestos Mensuales
          </h1>
          <p style={{ 
            color: colors.textSecondary, 
            fontSize: '1.125rem',
            margin: 0 
          }}>
            Controla tus gastos y mantente dentro de tus límites
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {currentBudget && (
            <button 
              className="modern-btn modern-btn-success"
              onClick={() => setShowCategoryForm(!showCategoryForm)}
            >
              <span>{showCategoryForm ? '✕' : '🏷️'}</span>
              {showCategoryForm ? 'Cancelar' : 'Agregar Categoría'}
            </button>
          )}
          {!currentBudget && (
            <button 
              className="modern-btn modern-btn-primary"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              <span>{showCreateForm ? '✕' : '💰'}</span>
              {showCreateForm ? 'Cancelar' : 'Crear Presupuesto'}
            </button>
          )}
        </div>
      </div>

      {/* Formulario para crear presupuesto mensual */}
      {showCreateForm && !currentBudget && (
        <div className="card mb-3">
          <h3>Crear Presupuesto para {getCurrentMonth()}</h3>
          <form onSubmit={handleCreateBudget}>
            <div className="form-group">
              <label>Presupuesto Total Mensual</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                value={formData.presupuesto_total}
                onChange={(e) => setFormData({...formData, presupuesto_total: e.target.value})}
                placeholder="Ej: 15000.00"
                required
              />
              <small style={{ color: '#666' }}>
                Este será tu límite total de gastos para el mes actual
              </small>
            </div>
            <button type="submit" className="btn btn-primary">
              Crear Presupuesto
            </button>
          </form>
        </div>
      )}

      {/* Formulario para agregar presupuesto de categoría */}
      {showCategoryForm && currentBudget && (
        <div className="card mb-3">
          <h3>Agregar Presupuesto por Categoría</h3>
          <form onSubmit={handleAddCategoryBudget}>
            <div className="grid grid-2">
              <div className="form-group">
                <label>Categoría</label>
                <select
                  className="form-control"
                  value={categoryFormData.categoria}
                  onChange={(e) => setCategoryFormData({...categoryFormData, categoria: e.target.value})}
                  required
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.filter(cat => 
                    !currentBudget.category_budgets.some(cb => cb.categoria === cat.id)
                  ).map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Límite Asignado</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  value={categoryFormData.limite_asignado}
                  onChange={(e) => setCategoryFormData({...categoryFormData, limite_asignado: e.target.value})}
                  placeholder="Ej: 3000.00"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Porcentaje de Alerta (%)</label>
              <input
                type="number"
                min="1"
                max="100"
                className="form-control"
                value={categoryFormData.alerta_porcentaje}
                onChange={(e) => setCategoryFormData({...categoryFormData, alerta_porcentaje: e.target.value})}
              />
              <small style={{ color: '#666' }}>
                Te alertaremos cuando alcances este porcentaje del límite
              </small>
            </div>
            <button type="submit" className="btn btn-success">
              Agregar Presupuesto
            </button>
          </form>
        </div>
      )}

      {/* Resumen del presupuesto actual */}
      {currentBudget ? (
        <div>
          {/* Resumen general */}
          <div className="card mb-3">
            <h3>📊 Resumen de {getCurrentMonth()}</h3>
            <div className="grid grid-3">
              <div style={{ textAlign: 'center' }}>
                <h4 style={{ color: '#007bff' }}>Presupuesto Total</h4>
                <h2>{formatCurrency(currentBudget.presupuesto_total)}</h2>
              </div>
              <div style={{ textAlign: 'center' }}>
                <h4 style={{ color: '#dc3545' }}>Gastado</h4>
                <h2>{formatCurrency(currentBudget.gastado_actual)}</h2>
              </div>
              <div style={{ textAlign: 'center' }}>
                <h4 style={{ color: currentBudget.esta_excedido ? '#dc3545' : '#28a745' }}>
                  {currentBudget.esta_excedido ? 'Excedido' : 'Disponible'}
                </h4>
                <h2 style={{ color: currentBudget.esta_excedido ? '#dc3545' : '#28a745' }}>
                  {currentBudget.esta_excedido 
                    ? formatCurrency(currentBudget.gastado_actual - currentBudget.presupuesto_total)
                    : formatCurrency(currentBudget.presupuesto_restante)
                  }
                </h2>
              </div>
            </div>

            {/* Barra de progreso general */}
            <div style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span>Progreso del mes</span>
                <span>{currentBudget.porcentaje_gastado.toFixed(1)}%</span>
              </div>
              <div style={{ 
                width: '100%', 
                height: '20px', 
                backgroundColor: '#e9ecef', 
                borderRadius: '10px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${Math.min(currentBudget.porcentaje_gastado, 100)}%`,
                  height: '100%',
                  backgroundColor: currentBudget.esta_excedido ? '#dc3545' : 
                                 currentBudget.porcentaje_gastado > 80 ? '#fd7e14' : '#28a745',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>

            {/* Información adicional */}
            <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#666' }}>
              <span>Días restantes: {currentBudget.dias_restantes_mes}</span>
              <span>Presupuesto diario sugerido: {formatCurrency(currentBudget.presupuesto_diario_sugerido)}</span>
            </div>
          </div>

          {/* Presupuestos por categoría */}
          {currentBudget.category_budgets && currentBudget.category_budgets.length > 0 && (
            <div className="card mb-3">
              <h3>📋 Presupuestos por Categoría</h3>
              <div className="grid grid-2">
                {currentBudget.category_budgets.map(categoryBudget => (
                  <div key={categoryBudget.id} style={{
                    padding: '15px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    border: `3px solid ${getStatusColor(categoryBudget.estado)}`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '20px' }}>{getStatusIcon(categoryBudget.estado)}</span>
                        <h4 style={{ margin: 0 }}>{categoryBudget.categoria_info.nombre}</h4>
                      </div>
                      <span style={{ 
                        fontSize: '12px', 
                        padding: '2px 8px', 
                        borderRadius: '12px',
                        backgroundColor: getStatusColor(categoryBudget.estado),
                        color: 'white'
                      }}>
                        {categoryBudget.estado.toUpperCase()}
                      </span>
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '5px' }}>
                        <span>Gastado: {formatCurrency(categoryBudget.gastado_actual)}</span>
                        <span>Límite: {formatCurrency(categoryBudget.limite_asignado)}</span>
                      </div>
                      
                      <div style={{ 
                        width: '100%', 
                        height: '12px', 
                        backgroundColor: '#e9ecef', 
                        borderRadius: '6px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${Math.min(categoryBudget.porcentaje_gastado, 100)}%`,
                          height: '100%',
                          backgroundColor: getStatusColor(categoryBudget.estado),
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                      
                      <div style={{ textAlign: 'center', fontSize: '12px', marginTop: '5px' }}>
                        {categoryBudget.porcentaje_gastado.toFixed(1)}% utilizado
                      </div>
                    </div>

                    <div style={{ fontSize: '12px', color: '#666' }}>
                      <div>Disponible: {formatCurrency(categoryBudget.limite_restante)}</div>
                      {categoryBudget.esta_excedido && (
                        <div style={{ color: '#dc3545', fontWeight: 'bold' }}>
                          Excedido por: {formatCurrency(categoryBudget.gastado_actual - categoryBudget.limite_asignado)}
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
            <div className="card">
              <h3>💡 Recomendaciones</h3>
              <div>
                {budgetSummary.recomendaciones.map((rec, index) => (
                  <div key={index} style={{
                    padding: '12px',
                    marginBottom: '10px',
                    backgroundColor: rec.tipo === 'warning' ? '#fff3cd' : 
                                   rec.tipo === 'caution' ? '#d1ecf1' : '#f8f9fa',
                    borderLeft: `4px solid ${
                      rec.tipo === 'warning' ? '#ffc107' :
                      rec.tipo === 'caution' ? '#17a2b8' : '#28a745'
                    }`,
                    borderRadius: '4px'
                  }}>
                    <h5 style={{ margin: '0 0 5px 0' }}>{rec.titulo}</h5>
                    <p style={{ margin: 0, fontSize: '14px' }}>{rec.mensaje}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="card text-center">
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>💰</div>
          <h3>No tienes presupuesto para este mes</h3>
          <p>Crea tu primer presupuesto mensual para empezar a controlar tus gastos</p>
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateForm(true)}
          >
            Crear Presupuesto
          </button>
        </div>
      )}
    </div>
  );
};

export default Budgets;