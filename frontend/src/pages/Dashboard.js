import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import api from '../services/api';
import toast from 'react-hot-toast';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/transactions/gastos/dashboard/');
      setDashboardData(response.data);
    } catch (error) {
      toast.error('Error al cargar datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center">Cargando dashboard...</div>;
  }

  if (!dashboardData) {
    return <div className="text-center">Error al cargar datos</div>;
  }

  // Datos simplificados para mostrar sin gráficas por ahora

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  return (
    <div>
      <h1 className="mb-3">Dashboard Financiero</h1>
      
      {/* Resumen mensual */}
      <div className="grid grid-3 mb-3">
        <div className="card text-center">
          <h3 style={{ color: '#28a745' }}>Ingresos</h3>
          <h2>{formatCurrency(dashboardData.total_ingresos)}</h2>
        </div>
        
        <div className="card text-center">
          <h3 style={{ color: '#dc3545' }}>Gastos</h3>
          <h2>{formatCurrency(dashboardData.total_gastos)}</h2>
        </div>
        
        <div className="card text-center">
          <h3 style={{ color: dashboardData.balance >= 0 ? '#28a745' : '#dc3545' }}>
            Balance
          </h3>
          <h2 style={{ color: dashboardData.balance >= 0 ? '#28a745' : '#dc3545' }}>
            {formatCurrency(dashboardData.balance)}
          </h2>
        </div>
      </div>

      {/* Gastos por Categoría - Vista Simplificada */}
      <div className="grid grid-2">
        <div className="card">
          <h3 className="mb-3">Gastos por Categoría</h3>
          {dashboardData.gastos_por_categoria.length > 0 ? (
            <div>
              {dashboardData.gastos_por_categoria.map((categoria, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '10px',
                  marginBottom: '10px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '5px',
                  borderLeft: `4px solid ${categoria.color}`
                }}>
                  <span>{categoria.categoria}</span>
                  <strong>{formatCurrency(categoria.total)}</strong>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center">No hay gastos registrados este mes</p>
          )}
        </div>

        <div className="card">
          <h3 className="mb-3">Evolución Mensual</h3>
          {dashboardData.evolucion_mensual.length > 0 ? (
            <div>
              {dashboardData.evolucion_mensual.map((mes, index) => (
                <div key={index} style={{ 
                  padding: '10px',
                  marginBottom: '10px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '5px'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                    {mes.mes} {mes.año}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#28a745' }}>
                      Ingresos: {formatCurrency(mes.ingresos)}
                    </span>
                    <span style={{ color: '#dc3545' }}>
                      Gastos: {formatCurrency(mes.gastos)}
                    </span>
                  </div>
                  <div style={{ 
                    textAlign: 'center', 
                    fontWeight: 'bold',
                    color: mes.balance >= 0 ? '#28a745' : '#dc3545'
                  }}>
                    Balance: {formatCurrency(mes.balance)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center">No hay datos históricos</p>
          )}
        </div>
      </div>

      {/* Recomendaciones */}
      {dashboardData.gastos_por_categoria.length > 0 && (
        <div className="card mt-3">
          <h3 className="mb-3">💡 Recomendaciones de Ahorro</h3>
          <div className="grid grid-2">
            {dashboardData.gastos_por_categoria.slice(0, 2).map((categoria, index) => {
              const porcentaje = ((categoria.total / dashboardData.total_gastos) * 100).toFixed(1);
              const ahorroSugerido = categoria.total * 0.1;
              
              return (
                <div key={index} style={{ 
                  padding: '15px', 
                  backgroundColor: '#f8f9fa', 
                  borderRadius: '5px',
                  border: `3px solid ${categoria.color}`
                }}>
                  <h4>{categoria.categoria}</h4>
                  <p>Representa el {porcentaje}% de tus gastos totales</p>
                  <p>
                    <strong>Sugerencia:</strong> Reduciendo un 10% ahorrarías{' '}
                    <span style={{ color: '#28a745', fontWeight: 'bold' }}