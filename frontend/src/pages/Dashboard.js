import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, LineElement, PointElement } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { useTheme } from '../contexts/ThemeContext';
import { useBalance } from '../contexts/BalanceContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  CreditCard, 
  DollarSign,
  AlertCircle,
  User
} from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, LineElement, PointElement);

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { colors } = useTheme();
  const { balance, totalDebt, availableBalance } = useBalance();

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
    return (
      <div className="container">
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '60vh',
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
            Cargando dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="container">
        <div className="modern-card text-center">
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
          <h3 style={{ color: colors.textPrimary, marginBottom: '0.5rem' }}>
            Error al cargar datos
          </h3>
          <p style={{ color: colors.textSecondary }}>
            No se pudieron cargar los datos del dashboard
          </p>
        </div>
      </div>
    );
  }

  // Configuración de gráficos con tema
  const pieData = {
    labels: dashboardData.gastos_por_categoria.map(item => item.categoria),
    datasets: [
      {
        data: dashboardData.gastos_por_categoria.map(item => item.total),
        backgroundColor: dashboardData.gastos_por_categoria.map(item => item.color),
        borderWidth: 3,
        borderColor: colors.surface,
        hoverBorderWidth: 4,
        hoverBorderColor: colors.primary,
        hoverOffset: 8
      }
    ]
  };

  const barData = {
    labels: dashboardData.evolucion_mensual.map(item => `${item.mes.substring(0, 3)} ${item.año}`),
    datasets: [
      {
        label: 'Ingresos',
        data: dashboardData.evolucion_mensual.map(item => item.ingresos),
        backgroundColor: colors.income,
        borderColor: colors.income,
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
      {
        label: 'Gastos',
        data: dashboardData.evolucion_mensual.map(item => item.gastos),
        backgroundColor: colors.expense,
        borderColor: colors.expense,
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }
    ]
  };

  // Gráfico de Líneas para Flujo de Caja
  const lineData = {
    labels: dashboardData.evolucion_mensual.map(item => `${item.mes.substring(0, 3)} ${item.año}`),
    datasets: [
      {
        label: 'Ingresos',
        data: dashboardData.evolucion_mensual.map(item => item.ingresos),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
      {
        label: 'Gastos',
        data: dashboardData.evolucion_mensual.map(item => item.gastos),
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#EF4444',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      }
    ]
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: {
            size: 13,
            family: 'Inter',
            weight: '500'
          },
          color: '#1E293B'
        }
      },
      tooltip: {
        backgroundColor: 'white',
        titleColor: '#1E293B',
        bodyColor: '#64748B',
        borderColor: '#E2E8F0',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return formatCurrency(value);
          },
          color: '#64748B',
          font: {
            size: 12,
            family: 'Inter'
          }
        },
        grid: {
          color: '#F1F5F9',
          drawBorder: false
        }
      },
      x: {
        ticks: {
          color: '#64748B',
          font: {
            size: 12,
            family: 'Inter'
          }
        },
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

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 13,
            family: 'Inter',
            weight: '500'
          },
          color: colors.textPrimary
        }
      },
      tooltip: {
        backgroundColor: colors.surface,
        titleColor: colors.textPrimary,
        bodyColor: colors.textSecondary,
        borderColor: colors.border,
        borderWidth: 1,
        cornerRadius: 12,
        padding: 12,
        callbacks: {
          label: function (context) {
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
          pointStyle: 'circle',
          padding: 20,
          font: {
            size: 13,
            family: 'Inter',
            weight: '500'
          },
          color: colors.textPrimary
        }
      },
      tooltip: {
        backgroundColor: colors.surface,
        titleColor: colors.textPrimary,
        bodyColor: colors.textSecondary,
        borderColor: colors.border,
        borderWidth: 1,
        cornerRadius: 12,
        padding: 12,
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return formatCurrency(value);
          },
          color: colors.textSecondary,
          font: {
            size: 12,
            family: 'Inter'
          }
        },
        grid: {
          color: colors.border,
          drawBorder: false
        }
      },
      x: {
        ticks: {
          color: colors.textSecondary,
          font: {
            size: 12,
            family: 'Inter'
          }
        },
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
    <div style={{ 
      minHeight: '100vh',
      background: '#F8FAFC',
      paddingBottom: '2rem'
    }}>
      {/* Header Moderno con Avatar */}
      <div style={{
        background: 'white',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        padding: '1rem 2rem',
        marginBottom: '2rem',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#1E293B',
              margin: 0
            }}>
              Dashboard Financiero
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: '600',
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
            }}>
              <User size={20} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
        {/* Subtítulo */}
        <div style={{ marginBottom: '2rem' }}>
          <p style={{
            color: '#64748B',
            fontSize: '0.95rem',
            margin: 0
          }}>
            Resumen de tu situación financiera actual
          </p>
        </div>

        {/* Tarjetas KPI Modernas */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {/* Ingresos */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <TrendingUp size={24} color="#2563EB" />
              </div>
            </div>
            <div style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '0.5rem' }}>
              Ingresos del Mes
            </div>
            <div style={{ fontSize: '1.875rem', fontWeight: '700', color: '#1E293B', marginBottom: '0.5rem' }}>
              {formatCurrency(dashboardData.total_ingresos)}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <TrendingUp size={16} />
              <span>+{((dashboardData.total_ingresos / Math.max(dashboardData.total_gastos, 1)) * 100).toFixed(1)}%</span>
            </div>
          </div>

          {/* Gastos */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#FEF2F2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <TrendingDown size={24} color="#EF4444" />
              </div>
            </div>
            <div style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '0.5rem' }}>
              Gastos del Mes
            </div>
            <div style={{ fontSize: '1.875rem', fontWeight: '700', color: '#1E293B', marginBottom: '0.5rem' }}>
              {formatCurrency(dashboardData.total_gastos)}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <TrendingDown size={16} />
              <span>{((dashboardData.total_gastos / Math.max(dashboardData.total_ingresos, 1)) * 100).toFixed(1)}%</span>
            </div>
          </div>

          {/* Balance */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: dashboardData.balance >= 0 ? '#EFF6FF' : '#FEF2F2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Wallet size={24} color={dashboardData.balance >= 0 ? '#2563EB' : '#EF4444'} />
              </div>
            </div>
            <div style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '0.5rem' }}>
              Balance Actual
            </div>
            <div style={{ fontSize: '1.875rem', fontWeight: '700', color: '#1E293B', marginBottom: '0.5rem' }}>
              {formatCurrency(dashboardData.balance)}
            </div>
            <div style={{ 
              fontSize: '0.875rem', 
              color: dashboardData.balance >= 0 ? '#10B981' : '#EF4444',
              fontWeight: '500'
            }}>
              {dashboardData.balance >= 0 ? 'Positivo' : 'Negativo'}
            </div>
          </div>

          {/* Deudas */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#FEF3C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CreditCard size={24} color="#F59E0B" />
              </div>
            </div>
            <div style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '0.5rem' }}>
              Deudas Pendientes
            </div>
            <div style={{ fontSize: '1.875rem', fontWeight: '700', color: '#1E293B', marginBottom: '0.5rem' }}>
              {formatCurrency(totalDebt)}
            </div>
            <div style={{ 
              fontSize: '0.875rem', 
              color: totalDebt > 0 ? '#F59E0B' : '#10B981',
              fontWeight: '500'
            }}>
              {totalDebt > 0 ? 'Pendiente' : 'Sin deudas'}
            </div>
          </div>
        </div>

        {/* Resumen de Préstamos - Diseño Limpio */}
        {totalDebt > 0 && (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            marginBottom: '2rem'
          }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                color: '#1E293B',
                margin: '0 0 0.5rem 0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <CreditCard size={24} color="#2563EB" />
                Resumen de Préstamos
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>
                Estado actual de tus deudas y compromisos financieros
              </p>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                padding: '1.5rem',
                background: 'white',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                textAlign: 'center'
              }}>
                <div style={{ 
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#FEF3C7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.75rem'
                }}>
                  <DollarSign size={20} color="#F59E0B" />
                </div>
                <div style={{ color: '#64748B', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  Total Adeudado
                </div>
                <div style={{ color: '#1E293B', fontSize: '1.5rem', fontWeight: '700' }}>
                  {formatCurrency(totalDebt)}
                </div>
              </div>

              <div style={{
                padding: '1.5rem',
                background: 'white',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                textAlign: 'center'
              }}>
                <div style={{ 
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: balance >= totalDebt ? '#DCFCE7' : '#FEE2E2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.75rem'
                }}>
                  <Wallet size={20} color={balance >= totalDebt ? '#10B981' : '#EF4444'} />
                </div>
                <div style={{ color: '#64748B', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  Balance Disponible
                </div>
                <div style={{ 
                  color: '#1E293B', 
                  fontSize: '1.5rem', 
                  fontWeight: '700' 
                }}>
                  {formatCurrency(availableBalance)}
                </div>
              </div>

              <div style={{
                padding: '1.5rem',
                background: 'white',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                textAlign: 'center'
              }}>
                <div style={{ 
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#EFF6FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.75rem'
                }}>
                  <TrendingUp size={20} color="#2563EB" />
                </div>
                <div style={{ color: '#64748B', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  Ratio Deuda/Ingresos
                </div>
                <div style={{ 
                  color: '#1E293B', 
                  fontSize: '1.5rem', 
                  fontWeight: '700' 
                }}>
                  {dashboardData?.total_ingresos > 0 ? 
                    `${((totalDebt / dashboardData.total_ingresos) * 100).toFixed(1)}%` : 
                    'N/A'
                  }
                </div>
              </div>
            </div>

            {/* Barra de Progreso de Deuda */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '0.5rem',
                fontSize: '0.875rem'
              }}>
                <span style={{ color: '#64748B' }}>Progreso de pago</span>
                <span style={{ color: '#2563EB', fontWeight: '600' }}>
                  {balance >= totalDebt ? '100%' : `${((balance / totalDebt) * 100).toFixed(1)}%`}
                </span>
              </div>
              <div style={{
                width: '100%',
                height: '12px',
                background: '#E2E8F0',
                borderRadius: '999px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${Math.min((balance / totalDebt) * 100, 100)}%`,
                  height: '100%',
                  background: balance >= totalDebt ? 
                    'linear-gradient(90deg, #10B981 0%, #059669 100%)' :
                    'linear-gradient(90deg, #2563EB 0%, #1E40AF 100%)',
                  transition: 'width 0.5s ease',
                  borderRadius: '999px'
                }} />
              </div>
            </div>

            {balance < totalDebt && (
              <div style={{
                padding: '1rem',
                background: '#FEF3C7',
                borderRadius: '8px',
                border: '1px solid #FDE68A',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem'
              }}>
                <AlertCircle size={20} color="#F59E0B" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: '600', color: '#92400E', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                    Balance insuficiente
                  </div>
                  <div style={{ color: '#A16207', fontSize: '0.875rem' }}>
                    Tu balance actual no cubre el total de tus deudas. Considera generar más ingresos o renegociar tus préstamos.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Gráfico Principal - Flujo de Caja */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          marginBottom: '2rem'
        }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              color: '#1E293B',
              margin: '0 0 0.5rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <TrendingUp size={24} color="#2563EB" />
              Flujo de Caja
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>
              Comparación de ingresos vs gastos a lo largo del tiempo
            </p>
          </div>

          {dashboardData.evolucion_mensual.length > 0 ? (
            <div style={{ height: '350px' }}>
              <Line data={lineData} options={lineOptions} />
            </div>
          ) : (
            <div style={{
              height: '350px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: '1rem',
              background: '#F8FAFC',
              borderRadius: '8px'
            }}>
              <TrendingUp size={48} color="#CBD5E1" />
              <div style={{ textAlign: 'center' }}>
                <h4 style={{ color: '#1E293B', marginBottom: '0.5rem', fontSize: '1rem' }}>
                  Sin historial disponible
                </h4>
                <p style={{ color: '#64748B', margin: 0, fontSize: '0.875rem' }}>
                  Los datos aparecerán conforme uses la aplicación
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Gráficos Secundarios */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {/* Distribución de Gastos */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                color: '#1E293B',
                margin: '0 0 0.5rem 0'
              }}>
                Distribución de Gastos
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>
                Gastos organizados por categoría
              </p>
            </div>

            {dashboardData.gastos_por_categoria.length > 0 ? (
              <div style={{ height: '300px', position: 'relative' }}>
                <Pie data={pieData} options={pieOptions} />
              </div>
            ) : (
              <div style={{
                height: '300px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '1rem',
                background: '#F8FAFC',
                borderRadius: '8px'
              }}>
                <Wallet size={48} color="#CBD5E1" />
                <div style={{ textAlign: 'center' }}>
                  <h4 style={{ color: '#1E293B', marginBottom: '0.5rem', fontSize: '1rem' }}>
                    Sin gastos registrados
                  </h4>
                  <p style={{ color: '#64748B', margin: 0, fontSize: '0.875rem' }}>
                    Agrega algunos gastos para ver la distribución
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Evolución Temporal */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                color: '#1E293B',
                margin: '0 0 0.5rem 0'
              }}>
                Evolución Mensual
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>
                Comparación mensual de ingresos y gastos
              </p>
            </div>

            {dashboardData.evolucion_mensual.length > 0 ? (
              <div style={{ height: '300px' }}>
                <Bar data={barData} options={barOptions} />
              </div>
            ) : (
              <div style={{
                height: '300px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '1rem',
                background: '#F8FAFC',
                borderRadius: '8px'
              }}>
                <TrendingUp size={48} color="#CBD5E1" />
                <div style={{ textAlign: 'center' }}>
                  <h4 style={{ color: '#1E293B', marginBottom: '0.5rem', fontSize: '1rem' }}>
                    Sin historial disponible
                  </h4>
                  <p style={{ color: '#64748B', margin: 0, fontSize: '0.875rem' }}>
                    Los datos aparecerán conforme uses la aplicación
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Análisis Detallado */}
        {dashboardData.gastos_por_categoria.length > 0 && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            {/* Análisis por Categoría */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '2rem',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ 
                  fontSize: '1.125rem', 
                  fontWeight: '600', 
                  color: '#1E293B',
                  margin: '0 0 0.5rem 0'
                }}>
                  Análisis por Categoría
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {dashboardData.gastos_por_categoria.map((categoria, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem',
                    background: '#F8FAFC',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#F1F5F9';
                    e.currentTarget.style.borderColor = '#CBD5E1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#F8FAFC';
                    e.currentTarget.style.borderColor = '#E2E8F0';
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        backgroundColor: categoria.color,
                        borderRadius: '50%'
                      }} />
                      <div>
                        <div style={{
                          fontWeight: '600',
                          color: '#1E293B',
                          marginBottom: '0.25rem',
                          fontSize: '0.875rem'
                        }}>
                          {categoria.categoria}
                        </div>
                        <div style={{
                          fontSize: '0.75rem',
                          color: '#64748B'
                        }}>
                          {((categoria.total / dashboardData.total_gastos) * 100).toFixed(1)}% del total
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontWeight: '700',
                        color: '#1E293B',
                        fontSize: '1rem'
                      }}>
                        {formatCurrency(categoria.total)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Historial Mensual */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '2rem',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ 
                  fontSize: '1.125rem', 
                  fontWeight: '600', 
                  color: '#1E293B',
                  margin: '0 0 0.5rem 0'
                }}>
                  Historial Mensual
                </h3>
              </div>

              <div style={{
                maxHeight: '400px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                {dashboardData.evolucion_mensual.slice().reverse().map((mes, index) => (
                  <div key={index} style={{
                    padding: '1rem',
                    background: '#F8FAFC',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    borderLeft: `4px solid ${mes.balance >= 0 ? '#10B981' : '#EF4444'}`
                  }}>
                    <div style={{
                      fontWeight: '600',
                      color: '#1E293B',
                      marginBottom: '0.75rem',
                      fontSize: '1rem'
                    }}>
                      {mes.mes} {mes.año}
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '1rem',
                      marginBottom: '0.75rem'
                    }}>
                      <div>
                        <div style={{
                          fontSize: '0.75rem',
                          color: '#64748B',
                          marginBottom: '0.25rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          Ingresos
                        </div>
                        <div style={{
                          fontWeight: '600',
                          color: '#10B981',
                          fontSize: '0.875rem'
                        }}>
                          {formatCurrency(mes.ingresos)}
                        </div>
                      </div>
                      <div>
                        <div style={{
                          fontSize: '0.75rem',
                          color: '#64748B',
                          marginBottom: '0.25rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          Gastos
                        </div>
                        <div style={{
                          fontWeight: '600',
                          color: '#EF4444',
                          fontSize: '0.875rem'
                        }}>
                          {formatCurrency(mes.gastos)}
                        </div>
                      </div>
                    </div>
                    <div style={{
                      textAlign: 'center',
                      fontWeight: '600',
                      color: mes.balance >= 0 ? '#10B981' : '#EF4444',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      background: mes.balance >= 0 ? '#DCFCE7' : '#FEE2E2',
                      fontSize: '0.875rem'
                    }}>
                      Balance: {formatCurrency(mes.balance)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recomendaciones Inteligentes */}
        {dashboardData.gastos_por_categoria.length > 0 && (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            marginBottom: '2rem'
          }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                color: '#1E293B',
                margin: '0 0 0.5rem 0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <DollarSign size={24} color="#2563EB" />
                Recomendaciones Inteligentes
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>
                Oportunidades de ahorro identificadas
              </p>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem'
            }}>
              {dashboardData.gastos_por_categoria.slice(0, 2).map((categoria, index) => {
                const porcentaje = ((categoria.total / dashboardData.total_gastos) * 100).toFixed(1);
                const ahorroSugerido = categoria.total * 0.1;

                return (
                  <div key={index} style={{
                    padding: '1.5rem',
                    background: '#F8FAFC',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    position: 'relative'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      marginBottom: '1rem'
                    }}>
                      <div style={{
                        width: '10px',
                        height: '10px',
                        backgroundColor: categoria.color,
                        borderRadius: '50%'
                      }} />
                      <h4 style={{
                        margin: 0,
                        color: '#1E293B',
                        fontSize: '1rem',
                        fontWeight: '600'
                      }}>
                        {categoria.categoria}
                      </h4>
                    </div>

                    <p style={{
                      color: '#64748B',
                      marginBottom: '1rem',
                      lineHeight: '1.5',
                      fontSize: '0.875rem'
                    }}>
                      Representa el <strong>{porcentaje}%</strong> de tus gastos totales
                    </p>

                    <div style={{
                      padding: '1rem',
                      background: 'white',
                      borderRadius: '6px',
                      border: '1px solid #E2E8F0'
                    }}>
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#64748B',
                        marginBottom: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        <DollarSign size={14} color="#10B981" />
                        Potencial de ahorro
                      </div>
                      <div style={{
                        fontSize: '1.25rem',
                        fontWeight: '700',
                        color: '#10B981'
                      }}>
                        {formatCurrency(ahorroSugerido)}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#94A3B8',
                        marginTop: '0.25rem'
                      }}>
                        Reduciendo un 10% tus gastos
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;