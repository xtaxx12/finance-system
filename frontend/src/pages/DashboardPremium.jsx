import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useBalance } from '../contexts/BalanceContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    CreditCard,
    PiggyBank,
    AlertTriangle,
    ArrowUpRight,
    ArrowDownRight,
    DollarSign,
    Target,
    Sparkles
} from 'lucide-react';

// Theme-aware colors
const getTheme = (isDarkMode) => ({
    background: isDarkMode ? '#0B0C10' : '#F8FAFC',
    surface: isDarkMode ? '#1F2833' : '#FFFFFF',
    surfaceLight: isDarkMode ? '#2A3441' : '#F1F5F9',
    surfaceHover: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
    border: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
    borderLight: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
    text: isDarkMode ? '#FFFFFF' : '#1E293B',
    textSecondary: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : '#64748B',
    textMuted: isDarkMode ? 'rgba(255, 255, 255, 0.4)' : '#94A3B8',
    emerald: '#10B981',
    emeraldGlow: 'rgba(16, 185, 129, 0.2)',
    coral: '#F87171',
    coralGlow: 'rgba(248, 113, 113, 0.2)',
    blue: '#3B82F6',
    blueGlow: 'rgba(59, 130, 246, 0.2)',
    amber: '#F59E0B',
    amberGlow: 'rgba(245, 158, 11, 0.2)',
    purple: '#8B5CF6',
    purpleGlow: 'rgba(139, 92, 246, 0.2)',
});

const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#F87171', '#06B6D4'];

const DashboardPremium = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const { colors, isDarkMode } = useTheme();
    const THEME = getTheme(isDarkMode);
    const { balance, totalDebt, availableBalance, debtProgress } = useBalance();

    useEffect(() => {
        fetchDashboardData();
        fetchLoans();
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

    const fetchLoans = async () => {
        try {
            const response = await api.get('/transactions/prestamos/');
            setLoans(response.data.filter(loan => loan.activo));
        } catch (error) {
            console.error('Error fetching loans:', error);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatCurrencyParts = (amount) => {
        const formatted = formatCurrency(amount);
        const parts = formatted.split('$');
        return { symbol: '$', value: parts[1] || '0.00' };
    };

    // Generate mock sparkline data based on evolution
    const generateSparklineData = () => {
        if (!dashboardData?.evolucion_mensual?.length) {
            return [
                { value: 1200 }, { value: 1400 }, { value: 1100 },
                { value: 1600 }, { value: 1300 }, { value: 1800 }
            ];
        }
        return dashboardData.evolucion_mensual.map(item => ({
            name: item.mes.substring(0, 3),
            ingresos: item.ingresos,
            gastos: item.gastos,
            balance: item.ingresos - item.gastos
        }));
    };

    // Calculate savings rate
    const savingsRate = dashboardData
        ? ((dashboardData.total_ingresos - dashboardData.total_gastos) / Math.max(dashboardData.total_ingresos, 1) * 100)
        : 0;

    // Debt to income ratio
    const debtRatio = dashboardData?.total_ingresos > 0
        ? ((totalDebt / dashboardData.total_ingresos) * 100)
        : 0;

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                background: THEME.background,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        border: `3px solid ${THEME.border}`,
                        borderTop: `3px solid ${THEME.blue}`,
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 1rem'
                    }} />
                    <p style={{ color: THEME.textSecondary, fontSize: '0.95rem' }}>
                        Cargando tu dashboard...
                    </p>
                </div>
                <style>{`
          @keyframes spin { 
            from { transform: rotate(0deg); } 
            to { transform: rotate(360deg); } 
          }
        `}</style>
            </div>
        );
    }

    if (!dashboardData) {
        return (
            <div style={{
                minHeight: '100vh',
                background: THEME.background,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '2rem'
            }}>
                <div style={{
                    background: THEME.surface,
                    padding: '3rem',
                    borderRadius: '24px',
                    textAlign: 'center',
                    border: `1px solid ${THEME.border}`
                }}>
                    <AlertTriangle size={48} color={THEME.amber} style={{ marginBottom: '1rem' }} />
                    <h3 style={{ color: THEME.text, marginBottom: '0.5rem', fontSize: '1.25rem' }}>
                        Error al cargar datos
                    </h3>
                    <p style={{ color: THEME.textSecondary }}>
                        No se pudieron cargar los datos del dashboard
                    </p>
                </div>
            </div>
        );
    }

    const sparklineData = generateSparklineData();

    // Donut chart data for debt ratio
    const donutData = [
        { name: 'Deuda', value: Math.min(debtRatio, 100), color: THEME.coral },
        { name: 'Disponible', value: Math.max(100 - debtRatio, 0), color: THEME.surfaceLight }
    ];

    return (
        <div style={{
            minHeight: '100vh',
            background: THEME.background,
            paddingBottom: '3rem'
        }}>
            {/* Main Content */}
            <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '2rem' }}>

                {/* Header Section */}
                <div style={{ marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <Sparkles size={24} color={THEME.blue} />
                        <h1 style={{
                            fontSize: '2rem',
                            fontWeight: '700',
                            color: THEME.text,
                            margin: 0,
                            letterSpacing: '-0.02em'
                        }}>
                            Dashboard Financiero
                        </h1>
                    </div>
                    <p style={{
                        color: THEME.textSecondary,
                        fontSize: '1rem',
                        margin: 0
                    }}>
                        Bienvenido de vuelta. Aquí está tu resumen financiero.
                    </p>
                </div>

                {/* Hero Section - KPIs Redesigned */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr',
                    gap: '1.5rem',
                    marginBottom: '2rem'
                }}>

                    {/* Main Balance Card - Large */}
                    <div style={{
                        background: `linear-gradient(135deg, ${THEME.surface} 0%, ${THEME.surfaceLight} 100%)`,
                        borderRadius: '24px',
                        padding: '2rem',
                        border: `1px solid ${THEME.border}`,
                        position: 'relative',
                        overflow: 'hidden',
                        minHeight: '280px'
                    }}>
                        {/* Background Chart */}
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: '120px',
                            opacity: 0.6
                        }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={sparklineData}>
                                    <defs>
                                        <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={THEME.blue} stopOpacity={0.4} />
                                            <stop offset="100%" stopColor={THEME.blue} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Area
                                        type="monotone"
                                        dataKey="balance"
                                        stroke={THEME.blue}
                                        strokeWidth={2}
                                        fill="url(#balanceGradient)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Content */}
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                marginBottom: '1.5rem'
                            }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '16px',
                                    background: THEME.blueGlow,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Wallet size={24} color={THEME.blue} />
                                </div>
                                <div>
                                    <p style={{
                                        color: THEME.textSecondary,
                                        fontSize: '0.875rem',
                                        margin: 0,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em'
                                    }}>
                                        Balance Total
                                    </p>
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <span style={{
                                    fontSize: '1.25rem',
                                    color: THEME.textMuted,
                                    fontWeight: '500'
                                }}>$</span>
                                <span style={{
                                    fontSize: '3.5rem',
                                    fontWeight: '700',
                                    color: THEME.text,
                                    letterSpacing: '-0.02em',
                                    background: dashboardData.balance >= 0
                                        ? `linear-gradient(135deg, ${THEME.text} 0%, ${THEME.emerald} 100%)`
                                        : `linear-gradient(135deg, ${THEME.text} 0%, ${THEME.coral} 100%)`,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text'
                                }}>
                                    {formatCurrencyParts(dashboardData.balance).value}
                                </span>
                            </div>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                background: dashboardData.balance >= 0 ? THEME.emeraldGlow : THEME.coralGlow,
                                borderRadius: '999px',
                                width: 'fit-content'
                            }}>
                                {dashboardData.balance >= 0 ? (
                                    <ArrowUpRight size={18} color={THEME.emerald} />
                                ) : (
                                    <ArrowDownRight size={18} color={THEME.coral} />
                                )}
                                <span style={{
                                    color: dashboardData.balance >= 0 ? THEME.emerald : THEME.coral,
                                    fontSize: '0.875rem',
                                    fontWeight: '600'
                                }}>
                                    {dashboardData.balance >= 0 ? 'Positivo' : 'Negativo'} este mes
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Secondary KPI Cards - Vertical Stack */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem'
                    }}>
                        {/* Income Card */}
                        <div style={{
                            background: THEME.surface,
                            borderRadius: '20px',
                            padding: '1.25rem',
                            border: `1px solid ${THEME.border}`,
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer'
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = THEME.surfaceLight;
                                e.currentTarget.style.borderColor = THEME.emerald;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = THEME.surface;
                                e.currentTarget.style.borderColor = THEME.border;
                            }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '14px',
                                background: THEME.emeraldGlow,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <TrendingUp size={22} color={THEME.emerald} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{
                                    color: THEME.textSecondary,
                                    fontSize: '0.75rem',
                                    margin: '0 0 0.25rem 0',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>Ingresos</p>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                                    <span style={{ color: THEME.textMuted, fontSize: '0.875rem' }}>$</span>
                                    <span style={{
                                        fontSize: '1.5rem',
                                        fontWeight: '700',
                                        color: THEME.text
                                    }}>
                                        {formatCurrencyParts(dashboardData.total_ingresos).value}
                                    </span>
                                </div>
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                color: THEME.emerald,
                                fontSize: '0.75rem',
                                fontWeight: '600'
                            }}>
                                <ArrowUpRight size={14} />
                                +12.5%
                            </div>
                        </div>

                        {/* Expense Card */}
                        <div style={{
                            background: THEME.surface,
                            borderRadius: '20px',
                            padding: '1.25rem',
                            border: `1px solid ${THEME.border}`,
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer'
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = THEME.surfaceLight;
                                e.currentTarget.style.borderColor = THEME.coral;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = THEME.surface;
                                e.currentTarget.style.borderColor = THEME.border;
                            }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '14px',
                                background: THEME.coralGlow,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <TrendingDown size={22} color={THEME.coral} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{
                                    color: THEME.textSecondary,
                                    fontSize: '0.75rem',
                                    margin: '0 0 0.25rem 0',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>Gastos</p>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                                    <span style={{ color: THEME.textMuted, fontSize: '0.875rem' }}>$</span>
                                    <span style={{
                                        fontSize: '1.5rem',
                                        fontWeight: '700',
                                        color: THEME.text
                                    }}>
                                        {formatCurrencyParts(dashboardData.total_gastos).value}
                                    </span>
                                </div>
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                color: THEME.coral,
                                fontSize: '0.75rem',
                                fontWeight: '600'
                            }}>
                                <ArrowDownRight size={14} />
                                -8.3%
                            </div>
                        </div>

                        {/* Savings Card */}
                        <div style={{
                            background: THEME.surface,
                            borderRadius: '20px',
                            padding: '1.25rem',
                            border: `1px solid ${THEME.border}`,
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer'
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = THEME.surfaceLight;
                                e.currentTarget.style.borderColor = THEME.purple;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = THEME.surface;
                                e.currentTarget.style.borderColor = THEME.border;
                            }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '14px',
                                background: THEME.purpleGlow,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <PiggyBank size={22} color={THEME.purple} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{
                                    color: THEME.textSecondary,
                                    fontSize: '0.75rem',
                                    margin: '0 0 0.25rem 0',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>Tasa de Ahorro</p>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                                    <span style={{
                                        fontSize: '1.5rem',
                                        fontWeight: '700',
                                        color: savingsRate >= 0 ? THEME.emerald : THEME.coral
                                    }}>
                                        {savingsRate.toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                            <div style={{
                                padding: '0.25rem 0.75rem',
                                background: savingsRate >= 20 ? THEME.emeraldGlow : THEME.amberGlow,
                                borderRadius: '999px',
                                fontSize: '0.7rem',
                                fontWeight: '600',
                                color: savingsRate >= 20 ? THEME.emerald : THEME.amber
                            }}>
                                {savingsRate >= 20 ? 'Excelente' : 'Mejorable'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Loans & Debts Section */}
                {totalDebt > 0 && (
                    <div style={{
                        background: THEME.surface,
                        borderRadius: '24px',
                        padding: '2rem',
                        border: `1px solid ${THEME.border}`,
                        marginBottom: '2rem'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '2rem'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '12px',
                                    background: THEME.amberGlow,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <CreditCard size={20} color={THEME.amber} />
                                </div>
                                <div>
                                    <h2 style={{
                                        fontSize: '1.25rem',
                                        fontWeight: '700',
                                        color: THEME.text,
                                        margin: 0
                                    }}>
                                        Gestión de Deudas
                                    </h2>
                                    <p style={{
                                        color: THEME.textSecondary,
                                        fontSize: '0.875rem',
                                        margin: 0
                                    }}>
                                        Control de préstamos y compromisos
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '300px 1fr',
                            gap: '2rem',
                            alignItems: 'start'
                        }}>
                            {/* Donut Chart - Debt Ratio */}
                            <div style={{
                                background: THEME.surfaceLight,
                                borderRadius: '20px',
                                padding: '1.5rem',
                                textAlign: 'center'
                            }}>
                                <p style={{
                                    color: THEME.textSecondary,
                                    fontSize: '0.75rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    marginBottom: '1rem'
                                }}>
                                    Ratio Deuda/Ingresos
                                </p>

                                <div style={{ height: '180px', position: 'relative' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={donutData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={55}
                                                outerRadius={75}
                                                paddingAngle={2}
                                                dataKey="value"
                                                startAngle={90}
                                                endAngle={-270}
                                            >
                                                {donutData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>

                                    {/* Center Label */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{
                                            fontSize: '1.75rem',
                                            fontWeight: '700',
                                            color: debtRatio > 50 ? THEME.coral : THEME.text
                                        }}>
                                            {debtRatio.toFixed(0)}%
                                        </div>
                                    </div>
                                </div>

                                <div style={{
                                    padding: '0.75rem',
                                    background: debtRatio > 50 ? THEME.coralGlow : THEME.emeraldGlow,
                                    borderRadius: '12px',
                                    marginTop: '1rem'
                                }}>
                                    <p style={{
                                        color: debtRatio > 50 ? THEME.coral : THEME.emerald,
                                        fontSize: '0.813rem',
                                        fontWeight: '500',
                                        margin: 0
                                    }}>
                                        {debtRatio > 50 ? '⚠️ Ratio alto' : '✓ Ratio saludable'}
                                    </p>
                                </div>
                            </div>

                            {/* Loans List */}
                            <div>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '1rem',
                                    padding: '0 0.5rem'
                                }}>
                                    <p style={{
                                        color: THEME.textSecondary,
                                        fontSize: '0.75rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        margin: 0
                                    }}>
                                        Préstamos Activos
                                    </p>
                                    <p style={{
                                        color: THEME.text,
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        margin: 0
                                    }}>
                                        Total: {formatCurrency(totalDebt)}
                                    </p>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.75rem',
                                    maxHeight: '280px',
                                    overflowY: 'auto'
                                }}>
                                    {loans.length > 0 ? loans.map((loan, index) => {
                                        const progress = loan.monto_original > 0
                                            ? ((loan.monto_original - loan.monto_restante) / loan.monto_original) * 100
                                            : 0;

                                        return (
                                            <div key={loan.id || index} style={{
                                                background: THEME.surfaceLight,
                                                borderRadius: '16px',
                                                padding: '1rem 1.25rem',
                                                transition: 'all 0.2s ease'
                                            }}>
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    marginBottom: '0.75rem'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <div style={{
                                                            width: '36px',
                                                            height: '36px',
                                                            borderRadius: '10px',
                                                            background: CHART_COLORS[index % CHART_COLORS.length] + '20',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}>
                                                            <DollarSign size={18} color={CHART_COLORS[index % CHART_COLORS.length]} />
                                                        </div>
                                                        <div>
                                                            <p style={{
                                                                color: THEME.text,
                                                                fontSize: '0.938rem',
                                                                fontWeight: '600',
                                                                margin: 0
                                                            }}>
                                                                {loan.nombre || loan.descripcion || `Préstamo ${index + 1}`}
                                                            </p>
                                                            <p style={{
                                                                color: THEME.textMuted,
                                                                fontSize: '0.75rem',
                                                                margin: 0
                                                            }}>
                                                                Original: {formatCurrency(loan.monto_original || loan.monto)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <p style={{
                                                            color: THEME.coral,
                                                            fontSize: '1rem',
                                                            fontWeight: '700',
                                                            margin: 0
                                                        }}>
                                                            {formatCurrency(loan.monto_restante || loan.monto)}
                                                        </p>
                                                        <p style={{
                                                            color: THEME.textMuted,
                                                            fontSize: '0.75rem',
                                                            margin: 0
                                                        }}>
                                                            restante
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Progress Bar */}
                                                <div style={{
                                                    background: 'rgba(255,255,255,0.1)',
                                                    borderRadius: '999px',
                                                    height: '6px',
                                                    overflow: 'hidden',
                                                    marginBottom: '0.5rem'
                                                }}>
                                                    <div style={{
                                                        width: `${progress}%`,
                                                        height: '100%',
                                                        background: `linear-gradient(90deg, ${THEME.emerald}, ${THEME.blue})`,
                                                        borderRadius: '999px',
                                                        transition: 'width 0.5s ease'
                                                    }} />
                                                </div>
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between'
                                                }}>
                                                    <span style={{
                                                        color: THEME.emerald,
                                                        fontSize: '0.75rem',
                                                        fontWeight: '600'
                                                    }}>
                                                        {progress.toFixed(0)}% pagado
                                                    </span>
                                                    <span style={{
                                                        color: THEME.textMuted,
                                                        fontSize: '0.75rem'
                                                    }}>
                                                        {(100 - progress).toFixed(0)}% restante
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    }) : (
                                        // Fallback if no loans data from API
                                        <div style={{
                                            background: THEME.surfaceLight,
                                            borderRadius: '16px',
                                            padding: '1.5rem',
                                            textAlign: 'center'
                                        }}>
                                            <Target size={32} color={THEME.textMuted} style={{ marginBottom: '0.75rem' }} />
                                            <p style={{ color: THEME.textSecondary, margin: 0 }}>
                                                No hay préstamos activos registrados
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Overall Progress */}
                                <div style={{
                                    marginTop: '1.5rem',
                                    padding: '1rem 1.25rem',
                                    background: `linear-gradient(135deg, ${THEME.blueGlow} 0%, ${THEME.emeraldGlow} 100%)`,
                                    borderRadius: '16px',
                                    border: `1px solid ${THEME.borderLight}`
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '0.75rem'
                                    }}>
                                        <span style={{
                                            color: THEME.textSecondary,
                                            fontSize: '0.813rem',
                                            fontWeight: '500'
                                        }}>
                                            Progreso total de pago
                                        </span>
                                        <span style={{
                                            color: THEME.blue,
                                            fontSize: '1rem',
                                            fontWeight: '700'
                                        }}>
                                            {debtProgress >= 100 ? '100%' : `${debtProgress.toFixed(1)}%`}
                                        </span>
                                    </div>
                                    <div style={{
                                        background: 'rgba(255,255,255,0.15)',
                                        borderRadius: '999px',
                                        height: '10px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            width: `${Math.min(debtProgress, 100)}%`,
                                            height: '100%',
                                            background: debtProgress >= 100
                                                ? `linear-gradient(90deg, ${THEME.emerald}, #34D399)`
                                                : `linear-gradient(90deg, ${THEME.blue}, ${THEME.purple})`,
                                            borderRadius: '999px',
                                            transition: 'width 0.5s ease',
                                            boxShadow: `0 0 12px ${debtProgress >= 100 ? THEME.emerald : THEME.blue}`
                                        }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Charts Section */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {/* Cash Flow Chart */}
                    <div style={{
                        background: THEME.surface,
                        borderRadius: '24px',
                        padding: '2rem',
                        border: `1px solid ${THEME.border}`
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            marginBottom: '1.5rem'
                        }}>
                            <TrendingUp size={20} color={THEME.blue} />
                            <h3 style={{
                                fontSize: '1.125rem',
                                fontWeight: '600',
                                color: THEME.text,
                                margin: 0
                            }}>
                                Flujo de Efectivo
                            </h3>
                        </div>

                        <div style={{ height: '280px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={sparklineData}>
                                    <defs>
                                        <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={THEME.emerald} stopOpacity={0.3} />
                                            <stop offset="100%" stopColor={THEME.emerald} stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={THEME.coral} stopOpacity={0.3} />
                                            <stop offset="100%" stopColor={THEME.coral} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="name"
                                        stroke={THEME.textMuted}
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke={THEME.textMuted}
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            background: THEME.surfaceLight,
                                            border: `1px solid ${THEME.border}`,
                                            borderRadius: '12px',
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                                        }}
                                        labelStyle={{ color: THEME.text }}
                                        formatter={(value) => [formatCurrency(value), '']}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="ingresos"
                                        stroke={THEME.emerald}
                                        strokeWidth={2}
                                        fill="url(#incomeGradient)"
                                        name="Ingresos"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="gastos"
                                        stroke={THEME.coral}
                                        strokeWidth={2}
                                        fill="url(#expenseGradient)"
                                        name="Gastos"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Legend */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '2rem',
                            marginTop: '1rem'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    background: THEME.emerald
                                }} />
                                <span style={{ color: THEME.textSecondary, fontSize: '0.813rem' }}>Ingresos</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    background: THEME.coral
                                }} />
                                <span style={{ color: THEME.textSecondary, fontSize: '0.813rem' }}>Gastos</span>
                            </div>
                        </div>
                    </div>

                    {/* Category Distribution */}
                    <div style={{
                        background: THEME.surface,
                        borderRadius: '24px',
                        padding: '2rem',
                        border: `1px solid ${THEME.border}`
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            marginBottom: '1.5rem'
                        }}>
                            <Target size={20} color={THEME.purple} />
                            <h3 style={{
                                fontSize: '1.125rem',
                                fontWeight: '600',
                                color: THEME.text,
                                margin: 0
                            }}>
                                Distribución por Categoría
                            </h3>
                        </div>

                        {dashboardData.gastos_por_categoria?.length > 0 ? (
                            <>
                                <div style={{ height: '200px', marginBottom: '1.5rem' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={dashboardData.gastos_por_categoria.map((cat, i) => ({
                                                    name: cat.categoria,
                                                    value: cat.total,
                                                    color: CHART_COLORS[i % CHART_COLORS.length]
                                                }))}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={80}
                                                paddingAngle={3}
                                                dataKey="value"
                                            >
                                                {dashboardData.gastos_por_categoria.map((_, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{
                                                    background: THEME.surfaceLight,
                                                    border: `1px solid ${THEME.border}`,
                                                    borderRadius: '12px'
                                                }}
                                                formatter={(value) => [formatCurrency(value), '']}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Category List */}
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.5rem'
                                }}>
                                    {dashboardData.gastos_por_categoria.slice(0, 4).map((cat, index) => (
                                        <div key={index} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '0.75rem',
                                            background: THEME.surfaceLight,
                                            borderRadius: '12px'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{
                                                    width: '10px',
                                                    height: '10px',
                                                    borderRadius: '50%',
                                                    background: CHART_COLORS[index % CHART_COLORS.length]
                                                }} />
                                                <span style={{ color: THEME.text, fontSize: '0.875rem' }}>
                                                    {cat.categoria}
                                                </span>
                                            </div>
                                            <span style={{
                                                color: THEME.textSecondary,
                                                fontSize: '0.875rem',
                                                fontWeight: '600'
                                            }}>
                                                {formatCurrency(cat.total)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div style={{
                                height: '280px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: THEME.textMuted
                            }}>
                                <Target size={48} strokeWidth={1} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                <p>Sin datos de categorías</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Responsive Styles */}
            <style>{`
        @media (max-width: 1024px) {
          div[style*="gridTemplateColumns: '2fr 1fr'"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="gridTemplateColumns: '300px 1fr'"] {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))'"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
        </div>
    );
};

export default DashboardPremium;
