import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const Budgets = () => {
  const { colors } = useTheme();
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
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '200px',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: `3px solid ${colors.border}`,
          borderTop: `3px solid ${colors.primary}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ color: colors.textSecondary }}>Cargando presupuestos...</p>
      </div>
    );
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
        <div className="modern-card animate-slide-in">
          <div className="modern-card-header">
            <div className="modern-card-title">
              <span>💰</span>
              Crear Presupuesto para {getCurrentMonth()}
            </div>
          </div>
          <form onSubmit={handleCreateBudget}>
            <div className="modern-form-group">
              <label className="modern-form-label">💵 Presupuesto Total Mensual</label>
              <input
                type="number"
                step="0.01"
                className="modern-form-control"
                value={formData.presupuesto_total}
                onChange={(e) => setFormData({...formData, presupuesto_total: e.target.value})}
                placeholder="Ej: 15000.00"
                required
              />
              <small style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>
                Este será tu límite total de gastos para el mes actual
              </small>
            </div>
            <button type="submit" className="modern-btn modern-btn-primary" style={{ width: '100%' }}>
              <span>💾</span>
              Crear Presupuesto
            </button>
          </form>
        </div>
      )}

      {/* Formulario para agregar presupuesto de categoría */}
      {showCategoryForm && currentBudget && (
        <div className="modern-card animate-slide-in">
          <div className="modern-card-header">
            <div className="modern-card-title">
              <span>🏷️</span>
              Agregar Presupuesto por Categoría
            </div>
          </div>
          <form onSubmit={handleAddCategoryBudget}>
            <div className="modern-grid modern-grid-2">
              <div className="modern-form-group">
                <label className="modern-form-label">🏷️ Categoría</label>
                <select
                  className="modern-form-control"
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
              <div className="modern-form-group">
                <label className="modern-form-label">💵 Límite Asignado</label>
                <input
                  type="number"
                  step="0.01"
                  className="modern-form-control"
                  value={categoryFormData.limite_asignado}
                  onChange={(e) => setCategoryFormData({...categoryFormData, limite_asignado: e.target.value})}
                  placeholder="Ej: 3000.00"
                  required
                />
              </div>
            </div>
            <div className="modern-form-group">
              <label className="modern-form-label">⚠️ Porcentaje de Alerta (%)</label>
              <input
                type="number"
                min="1"
                max="100"
                className="modern-form-control"
                value={categoryFormData.alerta_porcentaje}
                onChange={(e) => setCategoryFormData({...categoryFormData, alerta_porcentaje: e.target.value})}
              />
              <small style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>
                Te alertaremos cuando alcances este porcentaje del límite
              </small>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="modern-btn modern-btn-success" style={{ flex: 1 }}>
                <span>💾</span>
                Agregar Presupuesto
              </button>
              <button 
                type="button"
                onClick={() => setShowCategoryForm(false)}
                className="modern-btn modern-btn-secondary"
                style={{ flex: 1 }}
              >
                <span>✕</span>
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
          <div className="modern-card">
            <div className="modern-card-header">
              <div className="modern-card-title">
                <span>📊</span>
                Resumen de {getCurrentMonth()}
              </div>
            </div>
            
            <div className="modern-grid modern-grid-3" style={{ marginBottom: '1.5rem' }}>
              <div className="financial-metric" style={{ '--gradient': colors.primary }}>
                <div className="financial-metric-icon">💰</div>
                <div className="financial-metric-label">Presupuesto Total</div>
                <div className="financial-metric-value">
                  {formatCurrency(currentBudget.presupuesto_total)}
                </div>
              </div>
              
              <div className="financial-metric" style={{ '--gradient': colors.expense }}>
                <div className="financial-metric-icon">💸</div>
                <div className="financial-metric-label">Gastado</div>
                <div className="financial-metric-value">
                  {formatCurrency(currentBudget.gastado_actual)}
                </div>
              </div>
              
              <div className="financial-metric" style={{ 
                '--gradient': currentBudget.esta_excedido ? colors.expense : colors.income 
              }}>
                <div className="financial-metric-icon">
                  {currentBudget.esta_excedido ? '⚠️' : '✅'}
                </div>
                <div className="financial-metric-label">
                  {currentBudget.esta_excedido ? 'Excedido' : 'Disponible'}
                </div>
                <div className="financial-metric-value" style={{
                  color: currentBudget.esta_excedido ? colors.expense : colors.income
                }}>
                  {currentBudget.esta_excedido 
                    ? formatCurrency(currentBudget.gastado_actual - currentBudget.presupuesto_total)
                    : formatCurrency(currentBudget.presupuesto_restante || (currentBudget.presupuesto_total - currentBudget.gastado_actual))
                  }
                </div>
              </div>
            </div>

            {/* Barra de progreso general */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '0.5rem' 
              }}>
                <span style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: '500', 
                  color: colors.textPrimary 
                }}>
                  Progreso del mes
                </span>
                <span style={{ 
                  fontSize: '0.875rem', 
                  color: colors.textSecondary 
                }}>
                  {(currentBudget.porcentaje_gastado || 0).toFixed(1)}%
                </span>
              </div>
              <div style={{ 
                width: '100%', 
                height: '20px', 
                backgroundColor: colors.border, 
                borderRadius: '10px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${Math.min(currentBudget.porcentaje_gastado || 0, 100)}%`,
                  height: '100%',
                  background: currentBudget.esta_excedido ? colors.expense : 
                             (currentBudget.porcentaje_gastado || 0) > 80 ? '#fd7e14' : colors.income,
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>

            {/* Información adicional */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              fontSize: '0.875rem', 
              color: colors.textSecondary,
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              <span>📅 Días restantes: {currentBudget.dias_restantes_mes || 'N/A'}</span>
              <span>💡 Presupuesto diario sugerido: {formatCurrency(currentBudget.presupuesto_diario_sugerido || 0)}</span>
            </div>
          </div>

          {/* Presupuestos por categoría */}
          {currentBudget.category_budgets && currentBudget.category_budgets.length > 0 && (
            <div className="modern-card">
              <div className="modern-card-header">
                <div className="modern-card-title">
                  <span>📋</span>
                  Presupuestos por Categoría
                </div>
                <div style={{
                  background: `${colors.primary}15`,
                  color: colors.primary,
                  padding: '0.5rem 1rem',
                  borderRadius: '2rem',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}>
                  {currentBudget.category_budgets.length} categorías
                </div>
              </div>
              
              <div className="modern-grid modern-grid-2">
                {currentBudget.category_budgets.map(categoryBudget => (
                  <div 
                    key={categoryBudget.id} 
                    style={{
                      padding: '1.5rem',
                      background: colors.surfaceHover,
                      borderRadius: '1rem',
                      border: `1px solid ${colors.border}`,
                      borderLeft: `4px solid ${getStatusColor(categoryBudget.estado)}`,
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = colors.shadowLg;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      marginBottom: '1rem' 
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>
                          {getStatusIcon(categoryBudget.estado)}
                        </span>
                        <h4 style={{ 
                          margin: 0, 
                          fontWeight: '600', 
                          color: colors.textPrimary 
                        }}>
                          {categoryBudget.categoria_info?.nombre || categoryBudget.categoria_nombre || 'Categoría'}
                        </h4>
                      </div>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '1rem',
                        backgroundColor: getStatusColor(categoryBudget.estado),
                        color: 'white',
                        fontWeight: '600'
                      }}>
                        {(categoryBudget.estado || 'normal').toUpperCase()}
                      </span>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        fontSize: '0.875rem', 
                        color: colors.textSecondary,
                        marginBottom: '0.5rem' 
                      }}>
                        <span>💸 Gastado: {formatCurrency(categoryBudget.gastado_actual || 0)}</span>
                        <span>🎯 Límite: {formatCurrency(categoryBudget.limite_asignado || 0)}</span>
                      </div>
                      
                      <div style={{ 
                        width: '100%', 
                        height: '12px', 
                        backgroundColor: colors.border, 
                        borderRadius: '6px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${Math.min(categoryBudget.porcentaje_gastado || 0, 100)}%`,
                          height: '100%',
                          backgroundColor: getStatusColor(categoryBudget.estado),
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                      
                      <div style={{ 
                        textAlign: 'center', 
                        fontSize: '0.75rem', 
                        color: colors.textSecondary,
                        marginTop: '0.5rem' 
                      }}>
                        {(categoryBudget.porcentaje_gastado || 0).toFixed(1)}% utilizado
                      </div>
                    </div>

                    <div style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
                      <div style={{ marginBottom: '0.25rem' }}>
                        💰 Disponible: {formatCurrency((categoryBudget.limite_asignado || 0) - (categoryBudget.gastado_actual || 0))}
                      </div>
                      {categoryBudget.esta_excedido && (
                        <div style={{ 
                          color: colors.expense, 
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          ⚠️ Excedido por: {formatCurrency((categoryBudget.gastado_actual || 0) - (categoryBudget.limite_asignado || 0))}
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
            <div className="modern-card">
              <div className="modern-card-header">
                <div className="modern-card-title">
                  <span>💡</span>
                  Recomendaciones
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {budgetSummary.recomendaciones.map((rec, index) => (
                  <div 
                    key={index} 
                    style={{
                      padding: '1rem',
                      borderRadius: '0.75rem',
                      borderLeft: `4px solid ${
                        rec.tipo === 'warning' ? '#ffc107' :
                        rec.tipo === 'caution' ? '#17a2b8' : colors.income
                      }`,
                      background: rec.tipo === 'warning' ? '#fff3cd' : 
                                 rec.tipo === 'caution' ? '#d1ecf1' : `${colors.income}15`
                    }}
                  >
                    <h5 style={{ 
                      margin: '0 0 0.5rem 0', 
                      fontWeight: '600', 
                      color: colors.textPrimary 
                    }}>
                      {rec.titulo}
                    </h5>
                    <p style={{ 
                      margin: 0, 
                      fontSize: '0.875rem', 
                      color: colors.textSecondary 
                    }}>
                      {rec.mensaje}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="modern-card text-center">
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem', opacity: 0.7 }}>💰</div>
          <h3 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '600', 
            color: colors.textPrimary, 
            marginBottom: '0.5rem' 
          }}>
            No tienes presupuesto para este mes
          </h3>
          <p style={{ 
            color: colors.textSecondary, 
            marginBottom: '2rem',
            fontSize: '1.125rem'
          }}>
            Crea tu primer presupuesto mensual para empezar a controlar tus gastos
          </p>
          <button 
            className="modern-btn modern-btn-primary"
            onClick={() => setShowCreateForm(true)}
            style={{ fontSize: '1rem', padding: '1rem 2rem' }}
          >
            <span>💰</span>
            Crear Presupuesto
          </button>
        </div>
      )}
    </div>
  );
};

export default Budgets;