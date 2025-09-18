import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const Goals = () => {
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
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Metas de Ahorro</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancelar' : 'Nueva Meta'}
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="card mb-3">
          <h3>Crear Nueva Meta</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nombre de la Meta</label>
              <input
                type="text"
                className="form-control"
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                placeholder="Ej: Vacaciones en la playa"
                required
              />
            </div>

            <div className="form-group">
              <label>Descripción</label>
              <textarea
                className="form-control"
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                placeholder="Describe tu meta de ahorro"
                rows="3"
              />
            </div>

            <div className="grid grid-2">
              <div className="form-group">
                <label>Monto Objetivo</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  value={formData.monto_objetivo}
                  onChange={(e) => setFormData({...formData, monto_objetivo: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Monto Inicial (opcional)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  value={formData.monto_actual}
                  onChange={(e) => setFormData({...formData, monto_actual: e.target.value})}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Fecha Límite (opcional)</label>
              <input
                type="date"
                className="form-control"
                value={formData.fecha_limite}
                onChange={(e) => setFormData({...formData, fecha_limite: e.target.value})}
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Crear Meta
            </button>
          </form>
        </div>
      )}

      {/* Lista de metas */}
      {loading ? (
        <div className="text-center">Cargando metas...</div>
      ) : goals.length === 0 ? (
        <div className="card text-center">
          <h3>No tienes metas de ahorro</h3>
          <p>Crea tu primera meta para empezar a ahorrar de manera organizada</p>
        </div>
      ) : (
        <div className="grid grid-2">
          {goals.map(goal => (
            <div key={goal.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0' }}>{goal.nombre}</h3>
                  {goal.completada && (
                    <span style={{ 
                      backgroundColor: '#28a745', 
                      color: 'white', 
                      padding: '2px 8px', 
                      borderRadius: '12px', 
                      fontSize: '12px' 
                    }}>
                      ✓ Completada
                    </span>
                  )}
                </div>
                <button 
                  className="btn btn-danger"
                  style={{ fontSize: '12px', padding: '5px 10px' }}
                  onClick={() => handleDelete(goal.id)}
                >
                  Eliminar
                </button>
              </div>

              {goal.descripcion && (
                <p style={{ color: '#666', marginBottom: '15px' }}>{goal.descripcion}</p>
              )}

              {/* Barra de progreso */}
              <div style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span>{formatCurrency(goal.monto_actual)}</span>
                  <span>{formatCurrency(goal.monto_objetivo)}</span>
                </div>
                <div style={{ 
                  width: '100%', 
                  height: '20px', 
                  backgroundColor: '#e9ecef', 
                  borderRadius: '10px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${Math.min(goal.porcentaje_completado, 100)}%`,
                    height: '100%',
                    backgroundColor: getProgressColor(goal.porcentaje_completado),
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <div className="text-center mt-1">
                  <strong>{goal.porcentaje_completado.toFixed(1)}% completado</strong>
                </div>
              </div>

              {/* Información adicional */}
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                <div>Falta: {formatCurrency(goal.monto_faltante)}</div>
                <div>Fecha límite: {formatDate(goal.fecha_limite)}</div>
                {goal.dias_restantes !== null && (
                  <div>Días restantes: {goal.dias_restantes}</div>
                )}
                {goal.ahorro_mensual_sugerido && (
                  <div style={{ color: '#007bff', fontWeight: 'bold' }}>
                    Ahorro sugerido: {formatCurrency(goal.ahorro_mensual_sugerido)}/mes
                  </div>
                )}
              </div>

              {/* Acciones */}
              {!goal.completada && (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    className="btn btn-success"
                    style={{ flex: 1 }}
                    onClick={() => setShowAddSavings(showAddSavings === goal.id ? null : goal.id)}
                  >
                    Agregar Ahorro
                  </button>
                  
                  {goal.porcentaje_completado >= 100 && (
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleMarkCompleted(goal.id)}
                    >
                      Marcar Completada
                    </button>
                  )}
                </div>
              )}

              {/* Formulario para agregar ahorro */}
              {showAddSavings === goal.id && (
                <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                  <div className="form-group">
                    <label>Monto a agregar</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={savingsAmount}
                      onChange={(e) => setSavingsAmount(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#666', 
                    marginBottom: '10px',
                    padding: '8px',
                    backgroundColor: '#e3f2fd',
                    borderRadius: '4px',
                    border: '1px solid #bbdefb'
                  }}>
                    💡 <strong>Nota:</strong> Este monto se registrará automáticamente como un gasto de "Ahorro" 
                    para reflejar correctamente en tu balance financiero.
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      className="btn btn-success"
                      onClick={() => handleAddSavings(goal.id)}
                      disabled={!savingsAmount || parseFloat(savingsAmount) <= 0}
                    >
                      Confirmar Ahorro
                    </button>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowAddSavings(null);
                        setSavingsAmount('');
                      }}
                    >
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