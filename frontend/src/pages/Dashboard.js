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

  // Configuración de gráficos
  const pieData = {
    labels: dashboardData.gastos_por_categoria.map(item => item.categoria),
    datasets: [
      {
        data: dashboardData.gastos_por_categoria.map(item => item.total),
        backgroundColor: dashboardData.gastos_por_categoria.map(item => item.color),
        borderWidth: 2,
        borderColor: '#fff',
        hoverBorderWidth: 3,
        hoverBorderColor: '#333'
      }
    ]
  };

  const barData = {
    labels: dashboardData.evolucion_mensual.map(item => `${item.mes.substring(0, 3)} ${item.año}`),
    datasets: [
      {
        label: 'Ingresos',
        data: dashboardData.evolucion_mensual.map(item => item.ingresos),
        backgroundColor: '#28a745',
        borderColor: '#1e7e34',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Gastos',
        data: dashboardData.evolucion_mensual.map(item => item.gastos),
        backgroundColor: '#dc3545',
        borderColor: '#c82333',
        borderWidth: 1,
        borderRadius: 4,
      }
    ]
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = formatCurrency(context.parsed);
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      title: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatCurrency(value);
          }
        },
        grid: {
          color: '#e9ecef'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

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

      {/* Gráficos Interactivos */}
      <div className="grid grid-2">
        <div className="card">
          <h3 className="mb-3">📊 Gastos por Categoría</h3>
          {dashboardData.gastos_por_categoria.length > 0 ? (
            <div style={{ height: '350px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Pie data={pieData} options={pieOptions} />
            </div>
          ) : (
            <div style={{ height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="text-center">
                <p style={{ fontSize: '48px', margin: '0' }}>📈</p>
                <p style={{ color: '#666', margin: '10px 0' }}>No hay gastos registrados este mes</p>
                <p style={{ fontSize: '14px', color: '#999' }}>Agrega algunos gastos para ver el gráfico</p>
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="mb-3">📈 Evolución Mensual</h3>
          {dashboardData.evolucion_mensual.length > 0 ? (
            <div style={{ height: '350px' }}>
              <Bar data={barData} options={barOptions} />
            </div>
          ) : (
            <div style={{ height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="text-center">
                <p style={{ fontSize: '48px', margin: '0' }}>📊</p>
                <p style={{ color: '#666', margin: '10px 0' }}>No hay datos históricos</p>
                <p style={{ fontSize: '14px', color: '#999' }}>Los datos aparecerán conforme uses la aplicación</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Vista de Lista Complementaria */}
      {dashboardData.gastos_por_categoria.length > 0 && (
        <div className="grid grid-2 mt-3">
          <div className="card">
            <h4 className="mb-3">📋 Detalle por Categoría</h4>
            <div>
              {dashboardData.gastos_por_categoria.map((categoria, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '12px',
                  marginBottom: '8px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  borderLeft: `4px solid ${categoria.color}`,
                  transition: 'all 0.2s ease'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ 
                      width: '12px', 
                      height: '12px', 
                      backgroundColor: categoria.color,
                      borderRadius: '50%',
                      marginRight: '10px'
                    }}></div>
                    <span style={{ fontWeight: '500' }}>{categoria.categoria}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 'bold', color: '#dc3545' }}>
                      {formatCurrency(categoria.total)}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {((categoria.total / dashboardData.total_gastos) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h4 className="mb-3">📅 Resumen Mensual</h4>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {dashboardData.evolucion_mensual.slice().reverse().map((mes, index) => (
                <div key={index} style={{ 
                  padding: '12px',
                  marginBottom: '8px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  border: `1px solid ${mes.balance >= 0 ? '#28a745' : '#dc3545'}20`
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
                    {mes.mes} {mes.año}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px' }}>
                    <div style={{ color: '#28a745' }}>
                      <strong>Ingresos:</strong><br />
                      {formatCurrency(mes.ingresos)}
                    </div>
                    <div style={{ color: '#dc3545' }}>
                      <strong>Gastos:</strong><br />
                      {formatCurrency(mes.gastos)}
                    </div>
                  </div>
                  <div style={{ 
                    textAlign: 'center', 
                    fontWeight: 'bold',
                    color: mes.balance >= 0 ? '#28a745' : '#dc3545',
                    marginTop: '8px',
                    padding: '4px',
                    borderRadius: '4px',
                    backgroundColor: mes.balance >= 0 ? '#28a74510' : '#dc354510'
                  }}>
                    Balance: {formatCurrency(mes.balance)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
                    <span style={{ color: '#28a745', fontWeight: 'bold' }}>
                      {formatCurrency(ahorroSugerido)}
                    </span>
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;