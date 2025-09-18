import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const Transactions = () => {
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

      console.log('Enviando datos:', data); // Para debug
      
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
      console.error('Error al guardar:', error.response?.data); // Para debug
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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Transacciones</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancelar' : `Agregar ${activeTab === 'gastos' ? 'Gasto' : 'Ingreso'}`}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: '20px' }}>
        <button 
          className={`btn ${activeTab === 'gastos' ? 'btn-danger' : 'btn-secondary'} mr-2`}
          onClick={() => setActiveTab('gastos')}
        >
          Gastos
        </button>
        <button 
          className={`btn ${activeTab === 'ingresos' ? 'btn-success' : 'btn-secondary'}`}
          onClick={() => setActiveTab('ingresos')}
        >
          Ingresos
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="card mb-3">
          <h3>Agregar {activeTab === 'gastos' ? 'Gasto' : 'Ingreso'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-2">
              <div className="form-group">
                <label>Monto</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  value={formData.monto}
                  onChange={(e) => setFormData({...formData, monto: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Fecha</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.fecha}
                  onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Descripción</label>
              <input
                type="text"
                className="form-control"
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                placeholder="Descripción de la transacción"
              />
            </div>

            {activeTab === 'gastos' && (
              <div className="form-group">
                <label>Categoría</label>
                <select
                  className="form-control"
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

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.es_recurrente}
                  onChange={(e) => setFormData({...formData, es_recurrente: e.target.checked})}
                />
                {' '}Es recurrente
              </label>
            </div>

            {formData.es_recurrente && (
              <div className="form-group">
                <label>Frecuencia (días)</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.frecuencia_dias}
                  onChange={(e) => setFormData({...formData, frecuencia_dias: e.target.value})}
                  placeholder="Ej: 30 para mensual"
                />
              </div>
            )}

            <button type="submit" className="btn btn-primary">
              Guardar
            </button>
          </form>
        </div>
      )}

      {/* Lista de transacciones */}
      <div className="card">
        <h3>{activeTab === 'gastos' ? 'Gastos' : 'Ingresos'} Registrados</h3>
        
        {loading ? (
          <p>Cargando...</p>
        ) : transactions.length === 0 ? (
          <p>No hay {activeTab} registrados</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Fecha</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Descripción</th>
                  {activeTab === 'gastos' && <th style={{ padding: '10px', textAlign: 'left' }}>Categoría</th>}
                  <th style={{ padding: '10px', textAlign: 'right' }}>Monto</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Recurrente</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(transaction => (
                  <tr key={transaction.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px' }}>{formatDate(transaction.fecha)}</td>
                    <td style={{ padding: '10px' }}>{transaction.descripcion || 'Sin descripción'}</td>
                    {activeTab === 'gastos' && (
                      <td style={{ padding: '10px' }}>
                        {transaction.categoria_info?.nombre || 'Sin categoría'}
                      </td>
                    )}
                    <td style={{ 
                      padding: '10px', 
                      textAlign: 'right',
                      color: activeTab === 'gastos' ? '#dc3545' : '#28a745',
                      fontWeight: 'bold'
                    }}>
                      {formatCurrency(transaction.monto)}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      {transaction.es_recurrente ? '✓' : '✗'}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      <button 
                        className="btn btn-danger"
                        style={{ fontSize: '12px', padding: '5px 10px' }}
                        onClick={() => handleDelete(transaction.id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;