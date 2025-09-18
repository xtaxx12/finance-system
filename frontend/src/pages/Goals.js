import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const Goals = () => {
  const { colors, isDarkMode } = useTheme();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showAddSavings, setShowAddSavings] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    monto_objetivo: '',
    monto_actual: '0',
    fecha_limite: ''
  });
  const [savingsAmount, setSavingsAmount] = useState('');

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const response = await api.get('/goals/');
      setGoals(response.data.results || response.data);
    } catch (error) {
      toast.error('Error al cargar metas');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/goals/', formData);
      toast.success('Meta creada exitosamente');
      setShowForm(false);
      setFormData({
        nombre: '',
        descripcion: '',
        monto_objetivo: '',
        monto_actual: '0',
        fecha_limite: ''
      });
      fetchGoals();
    } catch (error) {
      toast.error('Error al crear meta');
    }
  };

  const handleAddSavings = async (goalId) => {
    try {
      const response = await api.post(`/goals/${goalId}/add_savings/`, {
        amount: savingsAmount
      });
      
      // Mostrar mensaje personalizado si está disponible
      const message = response.data.message || 'Ahorro agregado exitosamente';
      toast.success(message);
      
      setSavingsAmount('');
      setShowAddSavings(null);
      fetchGoals();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error al agregar ahorro';
      toast.error(errorMessage);
    }
  };

  const handleMarkCompleted = async (goalId) => {
    try {
      await api.post(`/goals/${goalId}/mark_completed/`);
      toast.success('Meta marcada como completada');
      fetchGoals();
    } catch (error) {
      toast.error('Error al marcar meta como completada');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta meta?')) {
      try {
        await api.delete(`/goals/${id}/`);
        toast.success('Meta eliminada');
        fetchGoals();
      } catch (error) {
        toast.error('Error al eliminar meta');
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha límite';
    return new Date(dateString).toLocaleDateString('es-MX');
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return '#28a745';
    if (percentage >= 75) return '#17a2b8';
    if (percentage >= 50) return '#ffc107';
    return '#dc3545';
  };

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
            background: colors.gradientPrimary,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            🎯 Metas de Ahorro
          </h1>
          <p style={{ 
            color: colors.textSecondary, 
            fontSize: '1.125rem',
            margin: 0 
          }}>
            Planifica y alcanza tus objetivos financieros
          </p>
        </div>
        <button 
          className="modern-btn modern-btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          <span>{showForm ? '✕' : '🎯'}</span>
          {showForm ? 'Cancelar' : 'Nueva Meta'}
        </button>
      </div>

      {/* Formulario Moderno */}
      {showForm && (
        <div className="modern-card animate-slide-in" style={{ marginBottom: '2rem' }}>
          <div className="modern-card-header">
            <div className="modern-card-title">
              <span>🎯</span>
              Crear Nueva Meta
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modern-form-group">
              <label className="modern-form-label">🏷️ Nombre de la Meta</label>
              <input
                type="text"
                className="modern-form-control"
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                placeholder="Ej: Vacaciones en la playa"
                required
              />
            </div>

            <div className="modern-form-group">
              <label className="modern-form-label">📝 Descripción</label>
              <textarea
                className="modern-form-control"
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                placeholder="Describe tu meta de ahorro"
                rows="3"
                style={{ resize: 'vertical', minHeight: '80px' }}
              />
            </div>

            <div className="modern-grid modern-grid-2">
              <div className="modern-form-group">
                <label className="modern-form-label">💰 Monto Objetivo</label>
                <input
                  type="number"
                  step="0.01"
                  className="modern-form-control"
                  value={formData.monto_objetivo}
                  onChange={(e) => setFormData({...formData, monto_objetivo: e.target.value})}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="modern-form-group">
                <label className="modern-form-label">💵 Monto Inicial (opcional)</label>
                <input
                  type="number"
                  step="0.01"
                  className="modern-form-control"
                  value={formData.monto_actual}
                  onChange={(e) => setFormData({...formData, monto_actual: e.target.value})}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="modern-form-group">
              <label className="modern-form-label">📅 Fecha Límite (opcional)</label>
              <input
                type="date"
                className="modern-form-control"
                value={formData.fecha_limite}
                onChange={(e) => setFormData({...formData, fecha_limite: e.target.value})}
              />
            </div>

            <button type="submit" className="modern-btn modern-btn-success" style={{ width: '100%' }}>
              <span>🎯</span>
              Crear Meta
            </button>
          </form>
        </div>
      )}

      {/* Lista de Metas Moderna */}
      {loading ? (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '300px',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: `4px solid ${colors.border}`,
            borderTop: `4px solid ${colors.primary}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ color: colors.textSecondary, fontSize: '1.125rem' }}>
            Cargando metas...
          </p>
        </div>
      ) : goals.length === 0 ? (
        <div className="modern-card text-center">
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem', opacity: 0.5 }}>🎯</div>
          <h3 style={{ color: colors.textPrimary, marginBottom: '1rem' }}>
            No tienes metas de ahorro
          </h3>
          <p style={{ color: colors.textSecondary, marginBottom: '2rem' }}>
            Crea tu primera meta para empezar a ahorrar de manera organizada
          </p>
          <button 
            className="modern-btn modern-btn-primary"
            onClick={() => setShowForm(true)}
          >
            <span>🎯</span>
            Crear Primera Meta
          </button>
        </div>
      ) : (
        <div className="modern-grid modern-grid-2">
          {goals.map(goal => (
            <div key={goal.id} className="modern-card animate-fade-in" style={{ position: 'relative' }}>
              {/* Header de la Meta */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start', 
                marginBottom: '1.5rem' 
              }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ 
                    margin: '0 0 0.5rem 0',
                    color: colors.textPrimary,
                    fontSize: '1.5rem',
                    fontWeight: '700'
                  }}>
                    {goal.nombre}
                  </h3>
                  {goal.completada && (
                    <span style={{ 
                      background: colors.gradientIncome,
                      color: 'white', 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '2rem', 
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      ✓ Completada
                    </span>
                  )}
                </div>
                <button 
                  className="modern-btn modern-btn-danger"
                  style={{ 
                    padding: '0.5rem',
                    minWidth: 'auto',
                    fontSize: '0.875rem'
                  }}
                  onClick={() => handleDelete(goal.id)}
                  title="Eliminar meta"
                >
                  🗑️
                </button>
              </div>

              {goal.descripcion && (
                <p style={{ 
                  color: colors.textSecondary, 
                  marginBottom: '1.5rem',
                  lineHeight: '1.5'
                }}>
                  {goal.descripcion}
                </p>
              )}

              {/* Barra de Progreso Moderna */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '0.75rem' 
                }}>
                  <div style={{ 
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: colors.income
                  }}>
                    {formatCurrency(goal.monto_actual)}
                  </div>
                  <div style={{ 
                    fontSize: '1rem',
                    color: colors.textSecondary
                  }}>
                    de {formatCurrency(goal.monto_objetivo)}
                  </div>
                </div>
                
                <div style={{ 
                  width: '100%', 
                  height: '12px', 
                  backgroundColor: colors.border, 
                  borderRadius: '6px',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <div style={{
                    width: `${Math.min(goal.porcentaje_completado, 100)}%`,
                    height: '100%',
                    background: getProgressColor(goal.porcentaje_completado) === '#28a745' ? colors.gradientIncome :
                               getProgressColor(goal.porcentaje_completado) === '#17a2b8' ? 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)' :
                               getProgressColor(goal.porcentaje_completado) === '#ffc107' ? 'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)' :
                               'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                    transition: 'width 0.5s ease',
                    borderRadius: '6px'
                  }} />
                </div>
                
                <div style={{ 
                  textAlign: 'center',
                  marginTop: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: colors.textPrimary
                }}>
                  {goal.porcentaje_completado.toFixed(1)}% completado
                </div>
              </div>

              {/* Información Adicional */}
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginBottom: '1.5rem',
                padding: '1rem',
                background: colors.surfaceHover,
                borderRadius: '0.75rem',
                border: `1px solid ${colors.border}`
              }}>
                <div>
                  <div style={{ 
                    fontSize: '0.75rem',
                    color: colors.textSecondary,
                    marginBottom: '0.25rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Falta
                  </div>
                  <div style={{ 
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: colors.textPrimary
                  }}>
                    {formatCurrency(goal.monto_faltante)}
                  </div>
                </div>
                
                <div>
                  <div style={{ 
                    fontSize: '0.75rem',
                    color: colors.textSecondary,
                    marginBottom: '0.25rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Fecha límite
                  </div>
                  <div style={{ 
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: colors.textPrimary
                  }}>
                    {formatDate(goal.fecha_limite)}
                  </div>
                </div>
                
                {goal.dias_restantes !== null && (
                  <div>
                    <div style={{ 
                      fontSize: '0.75rem',
                      color: colors.textSecondary,
                      marginBottom: '0.25rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Días restantes
                    </div>
                    <div style={{ 
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: goal.dias_restantes <= 30 ? colors.expense : colors.textPrimary
                    }}>
                      {goal.dias_restantes}
                    </div>
                  </div>
                )}
                
                {goal.ahorro_mensual_sugerido && (
                  <div>
                    <div style={{ 
                      fontSize: '0.75rem',
                      color: colors.textSecondary,
                      marginBottom: '0.25rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Ahorro sugerido/mes
                    </div>
                    <div style={{ 
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: colors.primary
                    }}>
                      {formatCurrency(goal.ahorro_mensual_sugerido)}
                    </div>
                  </div>
                )}
              </div>

              {/* Acciones */}
              {!goal.completada && (
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                  <button 
                    className="modern-btn modern-btn-success"
                    style={{ flex: 1 }}
                    onClick={() => setShowAddSavings(showAddSavings === goal.id ? null : goal.id)}
                  >
                    <span>💰</span>
                    {showAddSavings === goal.id ? 'Cancelar' : 'Agregar Ahorro'}
                  </button>
                  
                  {goal.porcentaje_completado >= 100 && (
                    <button 
                      className="modern-btn modern-btn-primary"
                      onClick={() => handleMarkCompleted(goal.id)}
                    >
                      <span>✅</span>
                      Completar
                    </button>
                  )}
                </div>
              )}

              {/* Formulario para Agregar Ahorro */}
              {showAddSavings === goal.id && (
                <div className="animate-slide-in" style={{ 
                  padding: '1.5rem',
                  background: colors.surfaceHover,
                  borderRadius: '0.75rem',
                  border: `1px solid ${colors.border}`
                }}>
                  <div style={{ 
                    fontSize: '0.875rem', 
                    color: colors.textSecondary,
                    marginBottom: '1rem',
                    padding: '0.75rem',
                    background: colors.primary + '10',
                    borderRadius: '0.5rem',
                    border: `1px solid ${colors.primary}20`
                  }}>
                    💡 <strong>Nota:</strong> Este monto se registrará automáticamente como un gasto de "Ahorro" 
                    para reflejar correctamente en tu balance financiero.
                  </div>
                  
                  <div className="modern-form-group">
                    <label className="modern-form-label">💵 Monto a agregar</label>
                    <input
                      type="number"
                      step="0.01"
                      className="modern-form-control"
                      value={savingsAmount}
                      onChange={(e) => setSavingsAmount(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button 
                      className="modern-btn modern-btn-success"
                      style={{ flex: 1 }}
                      onClick={() => handleAddSavings(goal.id)}
                      disabled={!savingsAmount || parseFloat(savingsAmount) <= 0}
                    >
                      <span>💾</span>
                      Confirmar Ahorro
                    </button>
                    <button 
                      className="modern-btn modern-btn-secondary"
                      onClick={() => {
                        setShowAddSavings(null);
                        setSavingsAmount('');
                      }}
                    >
                      <span>✕</span>
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Goals;