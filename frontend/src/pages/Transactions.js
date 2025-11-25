import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  FiCoffee, 
  FiHome, 
  FiTrendingUp,
  FiPackage,
  FiShoppingCart
} from 'react-icons/fi';
import { 
  GiClothes,
  GiMeal,
  GiHealthNormal
} from 'react-icons/gi';
import { 
  MdOutlineDirectionsCar,
  MdOutlineSchool
} from 'react-icons/md';

const Transactions = () => {
  const { colors, isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('gastos');
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    monto: '',
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0],
    categoria: '',
    es_recurrente: false,
    frecuencia_dias: ''
  });

  useEffect(() => {
    fetchTransactions();
    if (activeTab === 'gastos') {
      fetchCategories();
    }
  }, [activeTab]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'gastos' ? '/transactions/gastos/' : '/transactions/ingresos/';
      const response = await api.get(endpoint);
      setTransactions(response.data.results || response.data);
    } catch (error) {
      toast.error('Error al cargar transacciones');
    } finally {
      setLoading(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = activeTab === 'gastos' ? '/transactions/gastos/' : '/transactions/ingresos/';
      const data = { ...formData };
      
      // Asegurar que es_recurrente sea un booleano
      data.es_recurrente = Boolean(data.es_recurrente);
      
      // Si no es recurrente, limpiar frecuencia_dias
      if (!data.es_recurrente) {
        data.frecuencia_dias = null;
      }
      
      // Limpiar campos no necesarios para ingresos
      if (activeTab === 'ingresos') {
        delete data.categoria;
      }


      
      await api.post(endpoint, data);
      toast.success(`${activeTab === 'gastos' ? 'Gasto' : 'Ingreso'} agregado exitosamente`);
      setShowForm(false);
      setFormData({
        monto: '',
        descripcion: '',
        fecha: new Date().toISOString().split('T')[0],
        categoria: '',
        es_recurrente: false,
        frecuencia_dias: ''
      });
      fetchTransactions();
    } catch (error) {
      // Error manejado con toast
      toast.error(error.response?.data?.detail || 'Error al guardar transacción');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta transacción?')) {
      try {
        const endpoint = activeTab === 'gastos' ? `/transactions/gastos/${id}/` : `/transactions/ingresos/${id}/`;
        await api.delete(endpoint);
        toast.success('Transacción eliminada');
        fetchTransactions();
      } catch (error) {
        toast.error('Error al eliminar transacción');
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
    return new Date(dateString).toLocaleDateString('es-MX');
  };

  const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const getCategoryIcon = (categoryName) => {
    if (!categoryName) return <FiPackage size={20} />;
    
    const name = categoryName.toLowerCase();
    
    if (name.includes('ropa') || name.includes('vestir') || name.includes('camisa')) {
      return <GiClothes size={20} />;
    }
    if (name.includes('comida') || name.includes('alimento') || name.includes('restaurante')) {
      return <GiMeal size={20} />;
    }
    if (name.includes('transporte') || name.includes('auto') || name.includes('gasolina')) {
      return <MdOutlineDirectionsCar size={20} />;
    }
    if (name.includes('salud') || name.includes('médico') || name.includes('medicina')) {
      return <GiHealthNormal size={20} />;
    }
    if (name.includes('educación') || name.includes('escuela') || name.includes('curso')) {
      return <MdOutlineSchool size={20} />;
    }
    if (name.includes('hogar') || name.includes('casa') || name.includes('vivienda')) {
      return <FiHome size={20} />;
    }
    if (name.includes('entretenimiento') || name.includes('ocio')) {
      return <FiCoffee size={20} />;
    }
    if (name.includes('compras') || name.includes('shopping')) {
      return <FiShoppingCart size={20} />;
    }
    
    return <FiPackage size={20} />;
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
          }}>
            💳 Transacciones
          </h1>
          <p style={{ 
            color: colors.textSecondary, 
            fontSize: '1.125rem',
            margin: 0 
          }}>
            Gestiona tus ingresos y gastos
          </p>
        </div>
        <button 
          className="modern-btn modern-btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          <span>{showForm ? '✕' : '+'}</span>
          {showForm ? 'Cancelar' : `Agregar ${activeTab === 'gastos' ? 'Gasto' : 'Ingreso'}`}
        </button>
      </div>

      {/* Segmented Control Moderno */}
      <div style={{ 
        display: 'flex', 
        gap: '0.25rem',
        marginBottom: '2rem',
        background: isDarkMode ? '#1F2937' : '#F3F4F6',
        padding: '0.375rem',
        borderRadius: '0.75rem',
        maxWidth: '400px'
      }}>
        <button 
          onClick={() => setActiveTab('gastos')}
          style={{
            flex: 1,
            padding: '0.625rem 1.25rem',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            background: activeTab === 'gastos' ? colors.surface : 'transparent',
            color: activeTab === 'gastos' ? colors.textPrimary : colors.textSecondary,
            boxShadow: activeTab === 'gastos' ? '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          <span>💸</span>
          Gastos
        </button>
        <button 
          onClick={() => setActiveTab('ingresos')}
          style={{
            flex: 1,
            padding: '0.625rem 1.25rem',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            background: activeTab === 'ingresos' ? colors.surface : 'transparent',
            color: activeTab === 'ingresos' ? colors.textPrimary : colors.textSecondary,
            boxShadow: activeTab === 'ingresos' ? '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          <span>💰</span>
          Ingresos
        </button>
      </div>

      {/* Formulario Moderno */}
      {showForm && (
        <div className="modern-card animate-slide-in" style={{ marginBottom: '2rem' }}>
          <div className="modern-card-header">
            <div className="modern-card-title">
              <span>{activeTab === 'gastos' ? '💸' : '💰'}</span>
              Agregar {activeTab === 'gastos' ? 'Gasto' : 'Ingreso'}
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modern-grid modern-grid-2">
              <div className="modern-form-group">
                <label className="modern-form-label">💵 Monto</label>
                <input
                  type="number"
                  step="0.01"
                  className="modern-form-control"
                  value={formData.monto}
                  onChange={(e) => setFormData({...formData, monto: e.target.value})}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="modern-form-group">
                <label className="modern-form-label">📅 Fecha</label>
                <input
                  type="date"
                  className="modern-form-control"
                  value={formData.fecha}
                  onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="modern-form-group">
              <label className="modern-form-label">📝 Descripción</label>
              <input
                type="text"
                className="modern-form-control"
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                placeholder="Descripción de la transacción"
              />
            </div>

            {activeTab === 'gastos' && (
              <div className="modern-form-group">
                <label className="modern-form-label">🏷️ Categoría</label>
                <select
                  className="modern-form-control"
                  value={formData.categoria}
                  onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                  required
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="modern-form-group">
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                cursor: 'pointer',
                color: colors.textPrimary,
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                <input
                  type="checkbox"
                  checked={formData.es_recurrente}
                  onChange={(e) => setFormData({...formData, es_recurrente: e.target.checked})}
                  style={{
                    width: '18px',
                    height: '18px',
                    accentColor: colors.primary
                  }}
                />
                🔄 Es recurrente
              </label>
            </div>

            {formData.es_recurrente && (
              <div className="modern-form-group animate-slide-in">
                <label className="modern-form-label">⏱️ Frecuencia (días)</label>
                <input
                  type="number"
                  className="modern-form-control"
                  value={formData.frecuencia_dias}
                  onChange={(e) => setFormData({...formData, frecuencia_dias: e.target.value})}
                  placeholder="Ej: 30 para mensual"
                />
              </div>
            )}

            <button 
              type="submit" 
              className={`modern-btn ${activeTab === 'gastos' ? 'modern-btn-danger' : 'modern-btn-success'}`}
              style={{ width: '100%', marginTop: '1rem' }}
            >
              <span>💾</span>
              Guardar {activeTab === 'gastos' ? 'Gasto' : 'Ingreso'}
            </button>
          </form>
        </div>
      )}

      {/* Lista de Transacciones Moderna */}
      <div className="modern-card">
        <div className="modern-card-header">
          <div className="modern-card-title">
            <span>{activeTab === 'gastos' ? '💸' : '💰'}</span>
            {activeTab === 'gastos' ? 'Gastos' : 'Ingresos'} Registrados
          </div>
          <div style={{
            background: activeTab === 'gastos' ? `${colors.expense}15` : `${colors.income}15`,
            color: activeTab === 'gastos' ? colors.expense : colors.income,
            padding: '0.5rem 1rem',
            borderRadius: '2rem',
            fontSize: '0.875rem',
            fontWeight: '600'
          }}>
            {transactions.length} {activeTab}
          </div>
        </div>
        
        {loading ? (
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
            <p style={{ color: colors.textSecondary }}>Cargando transacciones...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem 1rem',
            color: colors.textSecondary
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }}>
              {activeTab === 'gastos' ? '💸' : '💰'}
            </div>
            <h3 style={{ color: colors.textPrimary, marginBottom: '0.5rem' }}>
              No hay {activeTab} registrados
            </h3>
            <p style={{ margin: 0 }}>
              Comienza agregando tu primer {activeTab === 'gastos' ? 'gasto' : 'ingreso'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {transactions.map(transaction => (
                <div 
                  key={transaction.id} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    background: colors.surfaceHover,
                    borderRadius: '0.75rem',
                    border: `1px solid ${colors.border}`,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = colors.shadowLg;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                    {/* Icono Inteligente con fondo circular */}
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: isDarkMode ? '#374151' : '#F3F4F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: activeTab === 'gastos' ? '#FB7185' : '#10B981',
                      flexShrink: 0
                    }}>
                      {activeTab === 'gastos' 
                        ? getCategoryIcon(transaction.categoria_info?.nombre)
                        : <FiTrendingUp size={20} />
                      }
                    </div>
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Título con capitalize */}
                      <div style={{ 
                        fontWeight: '600', 
                        color: isDarkMode ? 'white' : colors.textPrimary,
                        marginBottom: '0.25rem',
                        textTransform: 'capitalize'
                      }}>
                        {capitalize(transaction.descripcion) || 'Sin descripción'}
                      </div>
                      {/* Metadatos en gris */}
                      <div style={{ 
                        fontSize: '0.875rem', 
                        color: isDarkMode ? '#9CA3AF' : '#6B7280',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        flexWrap: 'wrap'
                      }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          📅 {formatDate(transaction.fecha)}
                        </span>
                        {activeTab === 'gastos' && transaction.categoria_info && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            🏷️ {transaction.categoria_info.nombre}
                          </span>
                        )}
                        {transaction.es_recurrente && (
                          <span style={{ 
                            background: colors.primary + '20',
                            color: colors.primary,
                            padding: '0.125rem 0.5rem',
                            borderRadius: '0.375rem',
                            fontSize: '0.75rem',
                            fontWeight: '500'
                          }}>
                            🔄 Recurrente
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1rem',
                    flexShrink: 0
                  }}>
                    {/* Monto con color Rose-400 para gastos */}
                    <div style={{ 
                      textAlign: 'right',
                      fontWeight: '700',
                      fontSize: '1.25rem',
                      color: activeTab === 'gastos' ? '#FB7185' : colors.income
                    }}>
                      {formatCurrency(transaction.monto)}
                    </div>
                    
                    <button 
                      className="modern-btn modern-btn-danger"
                      style={{ 
                        padding: '0.5rem',
                        minWidth: 'auto',
                        fontSize: '0.875rem'
                      }}
                      onClick={() => handleDelete(transaction.id)}
                      title="Eliminar transacción"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;