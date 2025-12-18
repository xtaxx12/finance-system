import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useBalance } from '../contexts/BalanceContext';
import { loansApi } from '../services/loansApi';
import toast from 'react-hot-toast';
import {
    CreditCard,
    Plus,
    X,
    Edit2,
    Trash2,
    Calendar,
    TrendingUp,
    TrendingDown,
    Sparkles,
    MoreHorizontal,
    DollarSign,
    Clock,
    Check,
    AlertTriangle,
    FileText,
    Smartphone,
    Home,
    Car,
    GraduationCap,
    ShoppingBag,
    Briefcase,
    Heart,
    ChevronDown,
    ChevronUp,
    Receipt
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
    cyan: '#06B6D4',
    cyanGlow: 'rgba(6, 182, 212, 0.2)',
});

// Loan icon mapping
const getLoanIcon = (name) => {
    if (!name) return CreditCard;
    const lowercaseName = name.toLowerCase();
    if (lowercaseName.includes('iphone') || lowercaseName.includes('celular') || lowercaseName.includes('telefono')) return Smartphone;
    if (lowercaseName.includes('casa') || lowercaseName.includes('hipoteca') || lowercaseName.includes('vivienda')) return Home;
    if (lowercaseName.includes('auto') || lowercaseName.includes('carro') || lowercaseName.includes('coche')) return Car;
    if (lowercaseName.includes('universidad') || lowercaseName.includes('escuela') || lowercaseName.includes('estudi')) return GraduationCap;
    if (lowercaseName.includes('compra') || lowercaseName.includes('tienda')) return ShoppingBag;
    if (lowercaseName.includes('negocio') || lowercaseName.includes('empresa')) return Briefcase;
    if (lowercaseName.includes('médico') || lowercaseName.includes('salud') || lowercaseName.includes('hospital')) return Heart;
    return CreditCard;
};

// Circular Progress Ring
const CircularProgress = ({ percentage, size = 100, strokeWidth = 8, THEME }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const color = percentage >= 100 ? THEME.emerald :
        percentage >= 75 ? THEME.cyan :
            percentage >= 50 ? THEME.amber : THEME.blue;

    return (
        <div style={{ position: 'relative', width: size, height: size }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth={strokeWidth}
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    style={{
                        transition: 'stroke-dashoffset 0.5s ease-in-out',
                        filter: `drop-shadow(0 0 6px ${color})`
                    }}
                />
            </svg>
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center'
            }}>
                <div style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: color
                }}>
                    {percentage.toFixed(0)}%
                </div>
                <div style={{
                    fontSize: '0.625rem',
                    color: THEME.textMuted,
                    textTransform: 'uppercase'
                }}>
                    Pagado
                </div>
            </div>
        </div>
    );
};

const LoansPremium = () => {
    const { isDarkMode } = useTheme();
    const THEME = getTheme(isDarkMode);
    const { user } = useAuth();
    const { updateBalance } = useBalance();

    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showPaymentForm, setShowPaymentForm] = useState(null);
    const [expandedHistory, setExpandedHistory] = useState(null);
    const [openMenuId, setOpenMenuId] = useState(null);
    const menuRef = useRef(null);

    const [newLoan, setNewLoan] = useState({
        name: '',
        amount: '',
        installments: '',
        date: new Date().toISOString().split('T')[0],
        description: ''
    });

    const [payment, setPayment] = useState({
        amount: '',
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        if (user) fetchLoans();
    }, [user]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchLoans = async () => {
        setLoading(true);
        try {
            const response = await loansApi.getLoans();
            setLoans(response.data.results || response.data);
            updateBalance();
        } catch (error) {
            toast.error('Error al cargar los préstamos');
        } finally {
            setLoading(false);
        }
    };

    const handleAddLoan = async (e) => {
        e.preventDefault();
        if (!newLoan.name || !newLoan.amount || !newLoan.installments) {
            toast.error('Por favor completa todos los campos requeridos');
            return;
        }
        try {
            await loansApi.createLoan({
                ...newLoan,
                amount: parseFloat(newLoan.amount),
                installments: parseInt(newLoan.installments)
            });
            setNewLoan({
                name: '',
                amount: '',
                installments: '',
                date: new Date().toISOString().split('T')[0],
                description: ''
            });
            setShowAddForm(false);
            toast.success('Préstamo agregado exitosamente');
            fetchLoans();
        } catch (error) {
            toast.error('Error al crear el préstamo');
        }
    };

    const handlePayment = async (e, loanId) => {
        e.preventDefault();
        if (!payment.amount) {
            toast.error('Por favor ingresa el monto del pago');
            return;
        }
        try {
            await loansApi.addPayment(loanId, {
                amount: parseFloat(payment.amount),
                date: payment.date
            });
            setPayment({ amount: '', date: new Date().toISOString().split('T')[0] });
            setShowPaymentForm(null);
            toast.success('¡Pago registrado! 🎉');
            fetchLoans();
        } catch (error) {
            toast.error('Error al registrar el pago');
        }
    };

    const deleteLoan = async (loanId) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este préstamo?')) {
            try {
                await loansApi.deleteLoan(loanId);
                toast.success('Préstamo eliminado');
                setOpenMenuId(null);
                fetchLoans();
            } catch (error) {
                toast.error('Error al eliminar el préstamo');
            }
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-MX', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatShortDate = (dateString) => {
        const date = new Date(dateString);
        return {
            day: date.getDate(),
            month: date.toLocaleDateString('es-MX', { month: 'short' }).toUpperCase()
        };
    };

    // Calculate KPIs
    const totalDebt = loans.reduce((sum, loan) => sum + (loan.remaining_amount || 0), 0);
    const totalPaid = loans.reduce((sum, loan) => {
        const paid = (loan.amount || 0) - (loan.remaining_amount || 0);
        return sum + paid;
    }, 0);
    const totalOriginal = loans.reduce((sum, loan) => sum + (loan.amount || 0), 0);
    const overallProgress = totalOriginal > 0 ? (totalPaid / totalOriginal) * 100 : 0;

    // Find next payment
    const activeLoans = loans.filter(l => !l.is_completed);
    const nextPayment = activeLoans.length > 0 ? activeLoans[0] : null;

    return (
        <div style={{
            minHeight: '100vh',
            background: THEME.background,
            paddingBottom: '3rem'
        }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>

                {/* Header Section */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '2rem',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                            <CreditCard size={28} color={THEME.coral} />
                            <h1 style={{
                                fontSize: '2rem',
                                fontWeight: '700',
                                color: THEME.text,
                                margin: 0,
                                letterSpacing: '-0.02em'
                            }}>
                                Préstamos y Deudas
                            </h1>
                        </div>
                        <p style={{
                            color: THEME.textSecondary,
                            fontSize: '1rem',
                            margin: 0
                        }}>
                            Control de deudas y seguimiento de pagos
                        </p>
                    </div>

                    {/* New Loan Button */}
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.875rem 1.5rem',
                            background: showAddForm ? THEME.surfaceLight : `linear-gradient(135deg, ${THEME.coral} 0%, #EF4444 100%)`,
                            color: showAddForm ? THEME.text : '#FFFFFF',
                            border: showAddForm ? `1px solid ${THEME.border}` : 'none',
                            borderRadius: '14px',
                            fontSize: '0.938rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: showAddForm ? 'none' : '0 4px 14px rgba(248, 113, 113, 0.4)'
                        }}
                    >
                        {showAddForm ? <X size={20} /> : <Plus size={20} />}
                        {showAddForm ? 'Cancelar' : 'Nuevo Préstamo'}
                    </button>
                </div>

                {/* KPI Cards */}
                {loans.length > 0 && (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '1.5rem',
                        marginBottom: '2rem'
                    }}>
                        {/* Total Debt */}
                        <div style={{
                            background: `linear-gradient(135deg, ${THEME.surface} 0%, ${THEME.surfaceLight} 100%)`,
                            borderRadius: '20px',
                            padding: '1.5rem',
                            border: `1px solid ${THEME.border}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem'
                        }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '16px',
                                background: THEME.coralGlow,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <TrendingDown size={26} color={THEME.coral} />
                            </div>
                            <div>
                                <p style={{
                                    color: THEME.textSecondary,
                                    fontSize: '0.813rem',
                                    margin: '0 0 0.25rem 0',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>Deuda Total Restante</p>
                                <p style={{
                                    color: THEME.coral,
                                    fontSize: '1.75rem',
                                    fontWeight: '700',
                                    margin: 0,
                                    fontFamily: 'ui-monospace, monospace'
                                }}>{formatCurrency(totalDebt)}</p>
                            </div>
                        </div>

                        {/* Next Payment */}
                        <div style={{
                            background: `linear-gradient(135deg, ${THEME.surface} 0%, ${THEME.surfaceLight} 100%)`,
                            borderRadius: '20px',
                            padding: '1.5rem',
                            border: `1px solid ${THEME.border}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem'
                        }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '16px',
                                background: THEME.amberGlow,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Calendar size={26} color={THEME.amber} />
                            </div>
                            <div>
                                <p style={{
                                    color: THEME.textSecondary,
                                    fontSize: '0.813rem',
                                    margin: '0 0 0.25rem 0',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>Próximo Vencimiento</p>
                                {nextPayment ? (
                                    <div>
                                        <p style={{
                                            color: THEME.text,
                                            fontSize: '1rem',
                                            fontWeight: '600',
                                            margin: 0
                                        }}>{nextPayment.name}</p>
                                        <p style={{
                                            color: THEME.amber,
                                            fontSize: '0.875rem',
                                            fontWeight: '600',
                                            margin: 0,
                                            fontFamily: 'ui-monospace, monospace'
                                        }}>{formatCurrency(nextPayment.installment_amount || 0)}</p>
                                    </div>
                                ) : (
                                    <p style={{
                                        color: THEME.emerald,
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        margin: 0
                                    }}>¡Sin deudas pendientes!</p>
                                )}
                            </div>
                        </div>

                        {/* Global Progress */}
                        <div style={{
                            background: `linear-gradient(135deg, ${THEME.surface} 0%, ${THEME.surfaceLight} 100%)`,
                            borderRadius: '20px',
                            padding: '1.5rem',
                            border: `1px solid ${THEME.border}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem'
                        }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '16px',
                                background: THEME.emeraldGlow,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <TrendingUp size={26} color={THEME.emerald} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{
                                    color: THEME.textSecondary,
                                    fontSize: '0.813rem',
                                    margin: '0 0 0.5rem 0',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>Progreso Global</p>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem'
                                }}>
                                    <div style={{
                                        flex: 1,
                                        height: '8px',
                                        background: THEME.surfaceLight,
                                        borderRadius: '999px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            width: `${overallProgress}%`,
                                            height: '100%',
                                            background: `linear-gradient(90deg, ${THEME.emerald}, ${THEME.cyan})`,
                                            borderRadius: '999px',
                                            transition: 'width 0.5s ease'
                                        }} />
                                    </div>
                                    <span style={{
                                        fontSize: '1rem',
                                        fontWeight: '700',
                                        color: THEME.emerald
                                    }}>{overallProgress.toFixed(0)}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add Loan Form */}
                {showAddForm && (
                    <div style={{
                        background: THEME.surface,
                        borderRadius: '24px',
                        padding: '2rem',
                        marginBottom: '2rem',
                        border: `1px solid ${THEME.border}`,
                        animation: 'slideIn 0.3s ease'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            marginBottom: '1.5rem'
                        }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '14px',
                                background: THEME.coralGlow,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <CreditCard size={24} color={THEME.coral} />
                            </div>
                            <h2 style={{
                                fontSize: '1.25rem',
                                fontWeight: '600',
                                color: THEME.text,
                                margin: 0
                            }}>
                                Nuevo Préstamo
                            </h2>
                        </div>

                        <form onSubmit={handleAddLoan}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.813rem',
                                    fontWeight: '500',
                                    color: THEME.textSecondary,
                                    marginBottom: '0.5rem'
                                }}>
                                    Nombre del préstamo
                                </label>
                                <input
                                    type="text"
                                    value={newLoan.name}
                                    onChange={(e) => setNewLoan({ ...newLoan, name: e.target.value })}
                                    placeholder="Ej: Préstamo para iPhone, Crédito Auto..."
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.875rem 1rem',
                                        background: THEME.surfaceLight,
                                        border: `1px solid ${THEME.border}`,
                                        borderRadius: '12px',
                                        color: THEME.text,
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                gap: '1rem',
                                marginBottom: '1rem'
                            }}>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '0.813rem',
                                        fontWeight: '500',
                                        color: THEME.textSecondary,
                                        marginBottom: '0.5rem'
                                    }}>
                                        Monto Total
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={newLoan.amount}
                                        onChange={(e) => setNewLoan({ ...newLoan, amount: e.target.value })}
                                        placeholder="0.00"
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.875rem 1rem',
                                            background: THEME.surfaceLight,
                                            border: `1px solid ${THEME.border}`,
                                            borderRadius: '12px',
                                            color: THEME.text,
                                            fontSize: '1rem',
                                            fontFamily: 'ui-monospace, monospace'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '0.813rem',
                                        fontWeight: '500',
                                        color: THEME.textSecondary,
                                        marginBottom: '0.5rem'
                                    }}>
                                        Número de Cuotas
                                    </label>
                                    <input
                                        type="number"
                                        value={newLoan.installments}
                                        onChange={(e) => setNewLoan({ ...newLoan, installments: e.target.value })}
                                        placeholder="12"
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.875rem 1rem',
                                            background: THEME.surfaceLight,
                                            border: `1px solid ${THEME.border}`,
                                            borderRadius: '12px',
                                            color: THEME.text,
                                            fontSize: '1rem'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '0.813rem',
                                        fontWeight: '500',
                                        color: THEME.textSecondary,
                                        marginBottom: '0.5rem'
                                    }}>
                                        Fecha de Inicio
                                    </label>
                                    <input
                                        type="date"
                                        value={newLoan.date}
                                        onChange={(e) => setNewLoan({ ...newLoan, date: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '0.875rem 1rem',
                                            background: THEME.surfaceLight,
                                            border: `1px solid ${THEME.border}`,
                                            borderRadius: '12px',
                                            color: THEME.text,
                                            fontSize: '1rem'
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.813rem',
                                    fontWeight: '500',
                                    color: THEME.textSecondary,
                                    marginBottom: '0.5rem'
                                }}>
                                    Descripción (opcional)
                                </label>
                                <textarea
                                    value={newLoan.description}
                                    onChange={(e) => setNewLoan({ ...newLoan, description: e.target.value })}
                                    placeholder="Detalles adicionales..."
                                    rows="2"
                                    style={{
                                        width: '100%',
                                        padding: '0.875rem 1rem',
                                        background: THEME.surfaceLight,
                                        border: `1px solid ${THEME.border}`,
                                        borderRadius: '12px',
                                        color: THEME.text,
                                        fontSize: '1rem',
                                        resize: 'vertical',
                                        minHeight: '60px'
                                    }}
                                />
                            </div>

                            <button
                                type="submit"
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    background: `linear-gradient(135deg, ${THEME.coral} 0%, #EF4444 100%)`,
                                    color: '#FFFFFF',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <Sparkles size={18} />
                                Agregar Préstamo
                            </button>
                        </form>
                    </div>
                )}

                {/* Loans List */}
                {loading ? (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4rem',
                        gap: '1rem'
                    }}>
                        <div style={{
                            width: '60px',
                            height: '60px',
                            border: `3px solid ${THEME.border}`,
                            borderTop: `3px solid ${THEME.coral}`,
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }} />
                        <p style={{ color: THEME.textSecondary }}>Cargando préstamos...</p>
                    </div>
                ) : loans.length === 0 ? (
                    <div style={{
                        background: THEME.surface,
                        borderRadius: '24px',
                        padding: '4rem 2rem',
                        textAlign: 'center',
                        border: `1px solid ${THEME.border}`
                    }}>
                        <div style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            background: THEME.coralGlow,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem'
                        }}>
                            <CreditCard size={48} color={THEME.coral} strokeWidth={1.5} />
                        </div>
                        <h3 style={{
                            color: THEME.text,
                            fontSize: '1.5rem',
                            fontWeight: '600',
                            marginBottom: '0.5rem'
                        }}>
                            No tienes préstamos registrados
                        </h3>
                        <p style={{
                            color: THEME.textSecondary,
                            marginBottom: '2rem',
                            maxWidth: '400px',
                            margin: '0 auto 2rem'
                        }}>
                            Agrega tu primer préstamo para comenzar a hacer seguimiento de tus pagos
                        </p>
                        <button
                            onClick={() => setShowAddForm(true)}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '1rem 2rem',
                                background: `linear-gradient(135deg, ${THEME.coral} 0%, #EF4444 100%)`,
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '14px',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                boxShadow: '0 4px 14px rgba(248, 113, 113, 0.4)'
                            }}
                        >
                            <CreditCard size={20} />
                            Agregar Primer Préstamo
                        </button>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gap: '1.5rem'
                    }}>
                        {loans.map((loan) => {
                            const LoanIcon = getLoanIcon(loan.name);
                            const progress = loan.progress_percentage || 0;
                            const remaining = loan.remaining_amount || 0;
                            const isCompleted = loan.is_completed;

                            return (
                                <div
                                    key={loan.id}
                                    style={{
                                        background: THEME.surface,
                                        borderRadius: '24px',
                                        border: `1px solid ${THEME.border}`,
                                        overflow: 'hidden',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    {/* Loan Card Header */}
                                    <div style={{
                                        padding: '1.5rem',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        gap: '1rem',
                                        flexWrap: 'wrap'
                                    }}>
                                        {/* Left - Info */}
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: 1 }}>
                                            <div style={{
                                                width: '56px',
                                                height: '56px',
                                                borderRadius: '16px',
                                                background: isCompleted ? THEME.emeraldGlow : THEME.blueGlow,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0
                                            }}>
                                                <LoanIcon size={28} color={isCompleted ? THEME.emerald : THEME.blue} />
                                            </div>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                                    <h3 style={{
                                                        fontSize: '1.25rem',
                                                        fontWeight: '600',
                                                        color: THEME.text,
                                                        margin: 0
                                                    }}>
                                                        {loan.name}
                                                    </h3>
                                                    <span style={{
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '999px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '600',
                                                        background: isCompleted ? THEME.emeraldGlow : THEME.amberGlow,
                                                        color: isCompleted ? THEME.emerald : THEME.amber
                                                    }}>
                                                        {isCompleted ? '✓ Completado' : 'En progreso'}
                                                    </span>
                                                </div>
                                                <p style={{
                                                    color: THEME.textMuted,
                                                    fontSize: '0.875rem',
                                                    margin: 0
                                                }}>
                                                    Inicio: {formatDate(loan.date)}
                                                </p>
                                                {loan.description && (
                                                    <p style={{
                                                        color: THEME.textSecondary,
                                                        fontSize: '0.875rem',
                                                        margin: '0.5rem 0 0 0'
                                                    }}>
                                                        {loan.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right - Actions */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            {!isCompleted && (
                                                <button
                                                    onClick={() => setShowPaymentForm(showPaymentForm === loan.id ? null : loan.id)}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem',
                                                        padding: '0.75rem 1.25rem',
                                                        background: showPaymentForm === loan.id ? THEME.surfaceLight : `linear-gradient(135deg, ${THEME.emerald} 0%, #059669 100%)`,
                                                        color: showPaymentForm === loan.id ? THEME.text : '#FFFFFF',
                                                        border: showPaymentForm === loan.id ? `1px solid ${THEME.border}` : 'none',
                                                        borderRadius: '12px',
                                                        fontSize: '0.875rem',
                                                        fontWeight: '600',
                                                        cursor: 'pointer',
                                                        boxShadow: showPaymentForm === loan.id ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.3)'
                                                    }}
                                                >
                                                    <DollarSign size={18} />
                                                    {showPaymentForm === loan.id ? 'Cancelar' : 'Registrar Pago'}
                                                </button>
                                            )}

                                            {/* Menu Button */}
                                            <div style={{ position: 'relative' }} ref={openMenuId === loan.id ? menuRef : null}>
                                                <button
                                                    onClick={() => setOpenMenuId(openMenuId === loan.id ? null : loan.id)}
                                                    style={{
                                                        width: '44px',
                                                        height: '44px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        background: openMenuId === loan.id ? THEME.surfaceLight : 'transparent',
                                                        border: `1px solid ${THEME.border}`,
                                                        borderRadius: '12px',
                                                        cursor: 'pointer',
                                                        color: THEME.textMuted
                                                    }}
                                                >
                                                    <MoreHorizontal size={20} />
                                                </button>

                                                {openMenuId === loan.id && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '100%',
                                                        right: 0,
                                                        marginTop: '0.5rem',
                                                        background: THEME.surface,
                                                        border: `1px solid ${THEME.border}`,
                                                        borderRadius: '12px',
                                                        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                                                        minWidth: '180px',
                                                        zIndex: 1000,
                                                        overflow: 'hidden'
                                                    }}>
                                                        <button
                                                            onClick={() => {
                                                                toast('Ver amortización próximamente');
                                                                setOpenMenuId(null);
                                                            }}
                                                            style={{
                                                                width: '100%',
                                                                padding: '0.75rem 1rem',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.75rem',
                                                                background: 'transparent',
                                                                border: 'none',
                                                                color: THEME.text,
                                                                fontSize: '0.875rem',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            <FileText size={16} color={THEME.textMuted} />
                                                            Ver Amortización
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                toast('Función de edición próximamente');
                                                                setOpenMenuId(null);
                                                            }}
                                                            style={{
                                                                width: '100%',
                                                                padding: '0.75rem 1rem',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.75rem',
                                                                background: 'transparent',
                                                                border: 'none',
                                                                color: THEME.text,
                                                                fontSize: '0.875rem',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            <Edit2 size={16} color={THEME.textMuted} />
                                                            Editar
                                                        </button>
                                                        <div style={{ height: '1px', background: THEME.border }} />
                                                        <button
                                                            onClick={() => deleteLoan(loan.id)}
                                                            style={{
                                                                width: '100%',
                                                                padding: '0.75rem 1rem',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.75rem',
                                                                background: 'transparent',
                                                                border: 'none',
                                                                color: THEME.coral,
                                                                fontSize: '0.875rem',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            <Trash2 size={16} />
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Form */}
                                    {showPaymentForm === loan.id && (
                                        <div style={{
                                            padding: '0 1.5rem 1.5rem',
                                            animation: 'slideIn 0.2s ease'
                                        }}>
                                            <div style={{
                                                padding: '1.5rem',
                                                background: THEME.surfaceLight,
                                                borderRadius: '16px',
                                                border: `1px solid ${THEME.border}`
                                            }}>
                                                <h4 style={{
                                                    color: THEME.text,
                                                    fontSize: '1rem',
                                                    fontWeight: '600',
                                                    margin: '0 0 1rem 0',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem'
                                                }}>
                                                    <DollarSign size={18} color={THEME.emerald} />
                                                    Registrar Pago
                                                </h4>
                                                <form onSubmit={(e) => handlePayment(e, loan.id)}>
                                                    <div style={{
                                                        display: 'flex',
                                                        gap: '0.75rem',
                                                        flexWrap: 'wrap'
                                                    }}>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={payment.amount}
                                                            onChange={(e) => setPayment({ ...payment, amount: e.target.value })}
                                                            placeholder={`Cuota sugerida: ${formatCurrency(loan.installment_amount || 0)}`}
                                                            style={{
                                                                flex: '1 1 200px',
                                                                padding: '0.875rem 1rem',
                                                                background: THEME.surface,
                                                                border: `1px solid ${THEME.border}`,
                                                                borderRadius: '10px',
                                                                color: THEME.text,
                                                                fontSize: '1rem',
                                                                fontFamily: 'ui-monospace, monospace'
                                                            }}
                                                            required
                                                        />
                                                        <input
                                                            type="date"
                                                            value={payment.date}
                                                            onChange={(e) => setPayment({ ...payment, date: e.target.value })}
                                                            style={{
                                                                flex: '0 0 160px',
                                                                padding: '0.875rem 1rem',
                                                                background: THEME.surface,
                                                                border: `1px solid ${THEME.border}`,
                                                                borderRadius: '10px',
                                                                color: THEME.text,
                                                                fontSize: '1rem'
                                                            }}
                                                        />
                                                        <button
                                                            type="submit"
                                                            style={{
                                                                padding: '0.875rem 1.5rem',
                                                                background: THEME.emerald,
                                                                color: '#FFFFFF',
                                                                border: 'none',
                                                                borderRadius: '10px',
                                                                fontSize: '0.938rem',
                                                                fontWeight: '600',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.5rem'
                                                            }}
                                                        >
                                                            <Check size={18} />
                                                            Pagar
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    )}

                                    {/* Loan Details */}
                                    <div style={{
                                        padding: '0 1.5rem 1.5rem',
                                        display: 'grid',
                                        gridTemplateColumns: '1fr auto',
                                        gap: '2rem',
                                        alignItems: 'center'
                                    }}>
                                        {/* Left - Stats */}
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                                            gap: '1rem'
                                        }}>
                                            <div style={{
                                                padding: '1rem',
                                                background: THEME.surfaceLight,
                                                borderRadius: '12px'
                                            }}>
                                                <p style={{
                                                    color: THEME.textMuted,
                                                    fontSize: '0.75rem',
                                                    margin: '0 0 0.25rem 0',
                                                    textTransform: 'uppercase'
                                                }}>Monto Original</p>
                                                <p style={{
                                                    color: THEME.text,
                                                    fontSize: '1.125rem',
                                                    fontWeight: '700',
                                                    margin: 0,
                                                    fontFamily: 'ui-monospace, monospace'
                                                }}>{formatCurrency(loan.amount)}</p>
                                            </div>
                                            <div style={{
                                                padding: '1rem',
                                                background: THEME.surfaceLight,
                                                borderRadius: '12px'
                                            }}>
                                                <p style={{
                                                    color: THEME.textMuted,
                                                    fontSize: '0.75rem',
                                                    margin: '0 0 0.25rem 0',
                                                    textTransform: 'uppercase'
                                                }}>Cuota Mensual</p>
                                                <p style={{
                                                    color: THEME.text,
                                                    fontSize: '1.125rem',
                                                    fontWeight: '700',
                                                    margin: 0,
                                                    fontFamily: 'ui-monospace, monospace'
                                                }}>{formatCurrency(loan.installment_amount || 0)}</p>
                                            </div>
                                            <div style={{
                                                padding: '1rem',
                                                background: THEME.surfaceLight,
                                                borderRadius: '12px'
                                            }}>
                                                <p style={{
                                                    color: THEME.textMuted,
                                                    fontSize: '0.75rem',
                                                    margin: '0 0 0.25rem 0',
                                                    textTransform: 'uppercase'
                                                }}>Cuotas</p>
                                                <p style={{
                                                    color: THEME.text,
                                                    fontSize: '1.125rem',
                                                    fontWeight: '700',
                                                    margin: 0
                                                }}>{loan.paid_installments || 0} / {loan.installments}</p>
                                            </div>
                                            <div style={{
                                                padding: '1rem',
                                                background: THEME.surfaceLight,
                                                borderRadius: '12px'
                                            }}>
                                                <p style={{
                                                    color: THEME.textMuted,
                                                    fontSize: '0.75rem',
                                                    margin: '0 0 0.25rem 0',
                                                    textTransform: 'uppercase'
                                                }}>Restante</p>
                                                <p style={{
                                                    color: remaining > 0 ? THEME.coral : THEME.emerald,
                                                    fontSize: '1.125rem',
                                                    fontWeight: '700',
                                                    margin: 0,
                                                    fontFamily: 'ui-monospace, monospace'
                                                }}>{formatCurrency(remaining)}</p>
                                            </div>
                                        </div>

                                        {/* Right - Progress Circle */}
                                        <CircularProgress percentage={progress} THEME={THEME} />
                                    </div>

                                    {/* Payment History Timeline */}
                                    {loan.payments && loan.payments.length > 0 && (
                                        <div style={{
                                            borderTop: `1px solid ${THEME.border}`
                                        }}>
                                            <button
                                                onClick={() => setExpandedHistory(expandedHistory === loan.id ? null : loan.id)}
                                                style={{
                                                    width: '100%',
                                                    padding: '1rem 1.5rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    background: 'transparent',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    color: THEME.text
                                                }}
                                            >
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem'
                                                }}>
                                                    <Receipt size={18} color={THEME.textMuted} />
                                                    <span style={{ fontSize: '0.938rem', fontWeight: '600' }}>
                                                        Historial de Pagos
                                                    </span>
                                                    <span style={{
                                                        padding: '0.125rem 0.5rem',
                                                        background: THEME.surfaceLight,
                                                        borderRadius: '999px',
                                                        fontSize: '0.75rem',
                                                        color: THEME.textSecondary
                                                    }}>
                                                        {loan.payments.length} pagos
                                                    </span>
                                                </div>
                                                {expandedHistory === loan.id ? (
                                                    <ChevronUp size={20} color={THEME.textMuted} />
                                                ) : (
                                                    <ChevronDown size={20} color={THEME.textMuted} />
                                                )}
                                            </button>

                                            {expandedHistory === loan.id && (
                                                <div style={{
                                                    padding: '0 1.5rem 1.5rem',
                                                    animation: 'slideIn 0.2s ease'
                                                }}>
                                                    <div style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '0.5rem'
                                                    }}>
                                                        {loan.payments.map((pay, index) => {
                                                            const dateInfo = formatShortDate(pay.date);
                                                            return (
                                                                <div
                                                                    key={pay.id || index}
                                                                    style={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '1rem',
                                                                        padding: '0.75rem 1rem',
                                                                        background: THEME.surfaceLight,
                                                                        borderRadius: '10px'
                                                                    }}
                                                                >
                                                                    {/* Date Badge */}
                                                                    <div style={{
                                                                        width: '48px',
                                                                        height: '48px',
                                                                        borderRadius: '10px',
                                                                        background: THEME.surface,
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        flexShrink: 0
                                                                    }}>
                                                                        <span style={{
                                                                            fontSize: '1.125rem',
                                                                            fontWeight: '700',
                                                                            color: THEME.text,
                                                                            lineHeight: 1
                                                                        }}>{dateInfo.day}</span>
                                                                        <span style={{
                                                                            fontSize: '0.625rem',
                                                                            color: THEME.textMuted,
                                                                            textTransform: 'uppercase'
                                                                        }}>{dateInfo.month}</span>
                                                                    </div>

                                                                    {/* Payment Info */}
                                                                    <div style={{ flex: 1 }}>
                                                                        <p style={{
                                                                            color: THEME.text,
                                                                            fontSize: '0.938rem',
                                                                            fontWeight: '600',
                                                                            margin: 0,
                                                                            fontFamily: 'ui-monospace, monospace'
                                                                        }}>{formatCurrency(pay.amount)}</p>
                                                                    </div>

                                                                    {/* Status */}
                                                                    <div style={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '0.25rem',
                                                                        padding: '0.25rem 0.75rem',
                                                                        background: THEME.emeraldGlow,
                                                                        borderRadius: '999px',
                                                                        color: THEME.emerald,
                                                                        fontSize: '0.75rem',
                                                                        fontWeight: '600'
                                                                    }}>
                                                                        <Check size={12} />
                                                                        Confirmado
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* CSS Animations */}
            <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from { 
            opacity: 0;
            transform: translateY(-10px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: ${isDarkMode ? 'invert(1)' : 'none'};
        }
      `}</style>
        </div>
    );
};

export default LoansPremium;
