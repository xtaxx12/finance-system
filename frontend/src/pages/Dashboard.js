import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { useTheme } from '../contexts/ThemeContext';
import api from '../services/api';
import toast from 'react-hot-toast';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { colors, isDarkMode } = useTheme();

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
    <div className="container animate-fade-in">
      {/* Header del Dashboard */}
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
            📊 Dashboard Financiero
          </h1>
          <p style={{
            color: colors.textSecondary,
            fontSize: '1.125rem',
            margin: 0
          }}>
            Resumen de tu situación financiera actual
          </p>
        </div>
        <div style={{
          background: colors.surface,
          padding: '0.75rem 1.5rem',
          borderRadius: '1rem',
          border: `1px solid ${colors.border}`,
          boxShadow: colors.shadow
        }}>
          <div style={{
            fontSize: '0.875rem',
            color: colors.textSecondary,
            marginBottom: '0.25rem'
          }}>
            Último actualizado
          </div>
          <div style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: colors.textPrimary
          }}>
            {new Date().toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </div>
        </div>
      </div>

      {/* Métricas Principales */}
      <div className="modern-grid modern-grid-3" style={{ marginBottom: '2rem' }}>
        <div
          className="financial-metric animate-slide-in"
          style={{
            '--gradient': colors.gradientIncome,
            animationDelay: '0.1s'
          }}
        >
          <div className="financial-metric-icon">💰</div>
          <div className="financial-metric-label">Ingresos del Mes</div>
          <div
            className="financial-metric-value"
            style={{ color: colors.income }}
          >
            {formatCurrency(dashboardData.total_ingresos)}
          </div>
          <div
            className="financial-metric-change"
            style={{ color: colors.income }}
          >
            <span>📈</span>
            <span>+{((dashboardData.total_ingresos / Math.max(dashboardData.total_gastos, 1)) * 100).toFixed(1)}%</span>
          </div>
        </div>

        <div
          className="financial-metric animate-slide-in"
          style={{
            '--gradient': colors.gradientExpense,
            animationDelay: '0.2s'
          }}
        >
          <div className="financial-metric-icon">💸</div>
          <div className="financial-metric-label">Gastos del Mes</div>
          <div
            className="financial-metric-value"
            style={{ color: colors.expense }}
          >
            {formatCurrency(dashboardData.total_gastos)}
          </div>
          <div
            className="financial-metric-change"
            style={{ color: colors.expense }}
          >
            <span>📉</span>
            <span>{((dashboardData.total_gastos / Math.max(dashboardData.total_ingresos, 1)) * 100).toFixed(1)}%</span>
          </div>
        </div>

        <div
          className="financial-metric animate-slide-in"
          style={{
            '--gradient': dashboardData.balance >= 0 ? colors.gradientIncome : colors.gradientExpense,
            animationDelay: '0.3s'
          }}
        >
          <div className="financial-metric-icon">
            {dashboardData.balance >= 0 ? '📊' : '⚠️'}
          </div>
          <div className="financial-metric-label">Balance Actual</div>
          <div
            className="financial-metric-value"
            style={{
              color: dashboardData.balance >= 0 ? colors.income : colors.expense
            }}
          >
            {formatCurrency(dashboardData.balance)}
          </div>
          <div
            className="financial-metric-change"
            style={{
              color: dashboardData.balance >= 0 ? colors.income : colors.expense
            }}
          >
            <span>{dashboardData.balance >= 0 ? '✅' : '❌'}</span>
            <span>{dashboardData.balance >= 0 ? 'Positivo' : 'Negativo'}</span>
          </div>
        </div>
      </div>

      {/* Gráficos Principales */}
      <div className="modern-grid modern-grid-2" style={{ marginBottom: '2rem' }}>
        <div className="modern-card animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="modern-card-header">
            <div>
              <div className="modern-card-title">
                <span>🥧</span>
                Distribución de Gastos
              </div>
              <div className="modern-card-subtitle">
                Gastos organizados por categoría
              </div>
            </div>
          </div>

          {dashboardData.gastos_por_categoria.length > 0 ? (
            <div style={{ height: '400px', position: 'relative' }}>
              <Pie data={pieData} options={pieOptions} />
            </div>
          ) : (
            <div style={{
              height: '400px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{ fontSize: '4rem', opacity: 0.5 }}>📊</div>
              <div style={{ textAlign: 'center' }}>
                <h4 style={{ color: colors.textPrimary, marginBottom: '0.5rem' }}>
                  Sin gastos registrados
                </h4>
                <p style={{ color: colors.textSecondary, margin: 0 }}>
                  Agrega algunos gastos para ver la distribución
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="modern-card animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <div className="modern-card-header">
            <div>
              <div className="modern-card-title">
                <span>📈</span>
                Evolución Temporal
              </div>
              <div className="modern-card-subtitle">
                Tendencia de ingresos y gastos
              </div>
            </div>
          </div>

          {dashboardData.evolucion_mensual.length > 0 ? (
            <div style={{ height: '400px' }}>
              <Bar data={barData} options={barOptions} />
            </div>
          ) : (
            <div style={{
              height: '400px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{ fontSize: '4rem', opacity: 0.5 }}>📈</div>
              <div style={{ textAlign: 'center' }}>
                <h4 style={{ color: colors.textPrimary, marginBottom: '0.5rem' }}>
                  Sin historial disponible
                </h4>
                <p style={{ color: colors.textSecondary, margin: 0 }}>
                  Los datos aparecerán conforme uses la aplicación
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detalles y Análisis */}
      {dashboardData.gastos_por_categoria.length > 0 && (
        <div className="modern-grid modern-grid-2" style={{ marginBottom: '2rem' }}>
          <div className="modern-card animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="modern-card-header">
              <div className="modern-card-title">
                <span>📋</span>
                Análisis por Categoría
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {dashboardData.gastos_por_categoria.map((categoria, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  background: colors.surfaceHover,
                  borderRadius: '0.75rem',
                  border: `1px solid ${colors.border}`,
                  transition: 'all 0.2s ease'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      backgroundColor: categoria.color,
                      borderRadius: '50%',
                      boxShadow: `0 0 0 3px ${categoria.color}20`
                    }} />
                    <div>
                      <div style={{
                        fontWeight: '600',
                        color: colors.textPrimary,
                        marginBottom: '0.25rem'
                      }}>
                        {categoria.categoria}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: colors.textSecondary
                      }}>
                        {((categoria.total / dashboardData.total_gastos) * 100).toFixed(1)}% del total
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontWeight: '700',
                      color: colors.expense,
                      fontSize: '1.125rem'
                    }}>
                      {formatCurrency(categoria.total)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="modern-card animate-fade-in" style={{ animationDelay: '0.7s' }}>
            <div className="modern-card-header">
              <div className="modern-card-title">
                <span>📅</span>
                Historial Mensual
              </div>
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
                  background: colors.surfaceHover,
                  borderRadius: '0.75rem',
                  border: `1px solid ${colors.border}`,
                  borderLeft: `4px solid ${mes.balance >= 0 ? colors.income : colors.expense}`
                }}>
                  <div style={{
                    fontWeight: '600',
                    color: colors.textPrimary,
                    marginBottom: '0.75rem',
                    fontSize: '1.125rem'
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
                        color: colors.textSecondary,
                        marginBottom: '0.25rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Ingresos
                      </div>
                      <div style={{
                        fontWeight: '600',
                        color: colors.income,
                        fontSize: '1rem'
                      }}>
                        {formatCurrency(mes.ingresos)}
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
                        Gastos
                      </div>
                      <div style={{
                        fontWeight: '600',
                        color: colors.expense,
                        fontSize: '1rem'
                      }}>
                        {formatCurrency(mes.gastos)}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    textAlign: 'center',
                    fontWeight: '700',
                    color: mes.balance >= 0 ? colors.income : colors.expense,
                    padding: '0.5rem',
                    borderRadius: '0.5rem',
                    background: mes.balance >= 0 ? `${colors.income}10` : `${colors.expense}10`,
                    fontSize: '1rem'
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
        <div className="modern-card animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <div className="modern-card-header">
            <div className="modern-card-title">
              <span>💡</span>
              Recomendaciones Inteligentes
            </div>
          </div>

          <div className="modern-grid modern-grid-2">
            {dashboardData.gastos_por_categoria.slice(0, 2).map((categoria, index) => {
              const porcentaje = ((categoria.total / dashboardData.total_gastos) * 100).toFixed(1);
              const ahorroSugerido = categoria.total * 0.1;

              return (
                <div key={index} style={{
                  padding: '1.5rem',
                  background: `${categoria.color}08`,
                  borderRadius: '1rem',
                  border: `2px solid ${categoria.color}20`,
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: categoria.color
                  }} />

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '1rem'
                  }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      backgroundColor: categoria.color,
                      borderRadius: '50%'
                    }} />
                    <h4 style={{
                      margin: 0,
                      color: colors.textPrimary,
                      fontSize: '1.25rem',
                      fontWeight: '600'
                    }}>
                      {categoria.categoria}
                    </h4>
                  </div>

                  <p style={{
                    color: colors.textSecondary,
                    marginBottom: '1rem',
                    lineHeight: '1.5'
                  }}>
                    Representa el <strong>{porcentaje}%</strong> de tus gastos totales
                  </p>

                  <div style={{
                    padding: '1rem',
                    background: colors.surface,
                    borderRadius: '0.75rem',
                    border: `1px solid ${colors.border}`
                  }}>
                    <div style={{
                      fontSize: '0.875rem',
                      color: colors.textSecondary,
                      marginBottom: '0.5rem'
                    }}>
                      💰 Potencial de ahorro
                    </div>
                    <div style={{
                      fontSize: '1.25rem',
                      fontWeight: '700',
                      color: colors.income
                    }}>
                      {formatCurrency(ahorroSugerido)}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: colors.textMuted,
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
  );
};

export default Dashboard;