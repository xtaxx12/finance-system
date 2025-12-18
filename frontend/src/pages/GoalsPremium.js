import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
    Target,
    Plus,
    X,
    Edit2,
    Trash2,
    Calendar,
    TrendingUp,
    Sparkles,
    Check,
    MoreHorizontal,
    PiggyBank,
    Clock,
    Trophy,
    Flame
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

// Goal emoji mapping
const getGoalEmoji = (name) => {
    const lowercaseName = name.toLowerCase();
    if (lowercaseName.includes('iphone') || lowercaseName.includes('celular') || lowercaseName.includes('telefono')) return '📱';
    if (lowercaseName.includes('laptop') || lowercaseName.includes('computadora') || lowercaseName.includes('mac')) return '💻';
    if (lowercaseName.includes('carro') || lowercaseName.includes('auto') || lowercaseName.includes('coche')) return '🚗';
    if (lowercaseName.includes('casa') || lowercaseName.includes('depa') || lowercaseName.includes('apartamento')) return '🏠';
    if (lowercaseName.includes('viaje') || lowercaseName.includes('vacacion') || lowercaseName.includes('playa')) return '✈️';
    if (lowercaseName.includes('boda') || lowercaseName.includes('matrimonio')) return '💍';
    if (lowercaseName.includes('universidad') || lowercaseName.includes('escuela') || lowercaseName.includes('curso')) return '🎓';
    if (lowercaseName.includes('gym') || lowercaseName.includes('ejercicio') || lowercaseName.includes('deporte')) return '💪';
    if (lowercaseName.includes('emergencia') || lowercaseName.includes('urgencia')) return '🏥';
    if (lowercaseName.includes('fondo') || lowercaseName.includes('retiro') || lowercaseName.includes('jubilacion')) return '🏦';
    if (lowercaseName.includes('negocio') || lowercaseName.includes('emprender')) return '💼';
    if (lowercaseName.includes('reloj') || lowercaseName.includes('watch')) return '⌚';
    if (lowercaseName.includes('moto') || lowercaseName.includes('motocicleta')) return '🏍️';
    if (lowercaseName.includes('tv') || lowercaseName.includes('television')) return '📺';
    if (lowercaseName.includes('consola') || lowercaseName.includes('playstation') || lowercaseName.includes('xbox') || lowercaseName.includes('nintendo')) return '🎮';
    return '🎯';
};

// Circular Progress Component
const CircularProgress = ({ percentage, size = 140, strokeWidth = 10, color, emoji }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div style={{ position: 'relative', width: size, height: size }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth={strokeWidth}
                />
                {/* Progress circle */}
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
            {/* Center content */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{emoji}</div>
                <div style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: color
                }}>
                    {percentage.toFixed(0)}%
                </div>
            </div>
        </div>
    );
};

const GoalsPremium = () => {
    const { isDarkMode } = useTheme();
    const THEME = getTheme(isDarkMode);

    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [showAddSavings, setShowAddSavings] = useState(null);
    const [openMenuId, setOpenMenuId] = useState(null);
    const menuRef = useRef(null);

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
            toast.success(response.data.message || 'Ahorro agregado exitosamente');
            setSavingsAmount('');
            setShowAddSavings(null);
            fetchGoals();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Error al agregar ahorro');
        }
    };

    const handleMarkCompleted = async (goalId) => {
        try {
            await api.post(`/goals/${goalId}/mark_completed/`);
            toast.success('¡Felicidades! Meta completada 🎉');
            setOpenMenuId(null);
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
                setOpenMenuId(null);
                fetchGoals();
            } catch (error) {
                toast.error('Error al eliminar meta');
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

    // Calculate days remaining correctly
    const calculateDaysRemaining = (dateString) => {
        if (!dateString) return null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const targetDate = new Date(dateString);
        targetDate.setHours(0, 0, 0, 0);
        const diffTime = targetDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    // Get progress color based on percentage
    const getProgressColor = (percentage) => {
        if (percentage >= 100) return THEME.emerald;
        if (percentage >= 75) return THEME.cyan;
        if (percentage >= 50) return THEME.amber;
        if (percentage >= 25) return '#FB923C'; // Orange
        return THEME.coral;
    };

    // Calculate total savings
    const totalSavings = goals.reduce((sum, goal) => sum + parseFloat(goal.monto_actual || 0), 0);
    const totalGoals = goals.reduce((sum, goal) => sum + parseFloat(goal.monto_objetivo || 0), 0);

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
                            <Target size={28} color={THEME.purple} />
                            <h1 style={{
                                fontSize: '2rem',
                                fontWeight: '700',
                                color: THEME.text,
                                margin: 0,
                                letterSpacing: '-0.02em'
                            }}>
                                Mis Objetivos
                            </h1>
                        </div>
                        <p style={{
                            color: THEME.textSecondary,
                            fontSize: '1rem',
                            margin: '0 0 1rem 0'
                        }}>
                            Planifica y alcanza tus metas financieras
                        </p>

                        {/* Total Savings Summary */}
                        {goals.length > 0 && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1.5rem',
                                flexWrap: 'wrap'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 1rem',
                                    background: THEME.emeraldGlow,
                                    borderRadius: '999px'
                                }}>
                                    <PiggyBank size={18} color={THEME.emerald} />
                                    <span style={{ color: THEME.textSecondary, fontSize: '0.875rem' }}>
                                        Ahorro Total:
                                    </span>
                                    <span style={{
                                        color: THEME.emerald,
                                        fontSize: '1rem',
                                        fontWeight: '700',
                                        fontFamily: 'ui-monospace, monospace'
                                    }}>
                                        {formatCurrency(totalSavings)}
                                    </span>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 1rem',
                                    background: THEME.purpleGlow,
                                    borderRadius: '999px'
                                }}>
                                    <Trophy size={18} color={THEME.purple} />
                                    <span style={{ color: THEME.textSecondary, fontSize: '0.875rem' }}>
                                        {goals.filter(g => g.completada).length} / {goals.length} completadas
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* New Goal Button */}
                    <button
                        onClick={() => setShowForm(!showForm)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.875rem 1.5rem',
                            background: showForm ? THEME.surfaceLight : `linear-gradient(135deg, ${THEME.purple} 0%, ${THEME.blue} 100%)`,
                            color: showForm ? THEME.text : '#FFFFFF',
                            border: showForm ? `1px solid ${THEME.border}` : 'none',
                            borderRadius: '14px',
                            fontSize: '0.938rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: showForm ? 'none' : '0 4px 14px rgba(139, 92, 246, 0.4)'
                        }}
                    >
                        {showForm ? <X size={20} /> : <Plus size={20} />}
                        {showForm ? 'Cancelar' : 'Nueva Meta'}
                    </button>
                </div>

                {/* Create Goal Form */}
                {showForm && (
                    <div style={{
                        background: THEME.surface,
                        borderRadius: '20px',
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
                                width: '40px',
                                height: '40px',
                                borderRadius: '12px',
                                background: THEME.purpleGlow,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Target size={20} color={THEME.purple} />
                            </div>
                            <h2 style={{
                                fontSize: '1.25rem',
                                fontWeight: '600',
                                color: THEME.text,
                                margin: 0
                            }}>
                                Crear Nueva Meta
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.813rem',
                                    fontWeight: '500',
                                    color: THEME.textSecondary,
                                    marginBottom: '0.5rem'
                                }}>
                                    Nombre de la meta
                                </label>
                                <input
                                    type="text"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    placeholder="Ej: Comprar iPhone, Viaje a Europa..."
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

                            <div style={{ marginBottom: '1rem' }}>
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
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                    placeholder="Describe tu objetivo..."
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

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                gap: '1rem',
                                marginBottom: '1.5rem'
                            }}>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '0.813rem',
                                        fontWeight: '500',
                                        color: THEME.textSecondary,
                                        marginBottom: '0.5rem'
                                    }}>
                                        Monto objetivo
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.monto_objetivo}
                                        onChange={(e) => setFormData({ ...formData, monto_objetivo: e.target.value })}
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
                                        Monto inicial
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.monto_actual}
                                        onChange={(e) => setFormData({ ...formData, monto_actual: e.target.value })}
                                        placeholder="0.00"
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
                                        Fecha límite
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.fecha_limite}
                                        onChange={(e) => setFormData({ ...formData, fecha_limite: e.target.value })}
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

                            <button
                                type="submit"
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    background: `linear-gradient(135deg, ${THEME.purple} 0%, ${THEME.blue} 100%)`,
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
                                Crear Meta
                            </button>
                        </form>
                    </div>
                )}

                {/* Goals Grid */}
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
                            borderTop: `3px solid ${THEME.purple}`,
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }} />
                        <p style={{ color: THEME.textSecondary }}>Cargando tus metas...</p>
                    </div>
                ) : goals.length === 0 ? (
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
                            background: THEME.purpleGlow,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem'
                        }}>
                            <Target size={48} color={THEME.purple} strokeWidth={1.5} />
                        </div>
                        <h3 style={{
                            color: THEME.text,
                            fontSize: '1.5rem',
                            fontWeight: '600',
                            marginBottom: '0.5rem'
                        }}>
                            No tienes metas de ahorro
                        </h3>
                        <p style={{
                            color: THEME.textSecondary,
                            marginBottom: '2rem',
                            maxWidth: '400px',
                            margin: '0 auto 2rem'
                        }}>
                            Crea tu primera meta para empezar a ahorrar de manera organizada y visualizar tu progreso
                        </p>
                        <button
                            onClick={() => setShowForm(true)}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '1rem 2rem',
                                background: `linear-gradient(135deg, ${THEME.purple} 0%, ${THEME.blue} 100%)`,
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '14px',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)'
                            }}
                        >
                            <Target size={20} />
                            Crear Primera Meta
                        </button>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        {goals.map((goal) => {
                            const percentage = goal.porcentaje_completado || 0;
                            const progressColor = getProgressColor(percentage);
                            const emoji = getGoalEmoji(goal.nombre);
                            const daysRemaining = calculateDaysRemaining(goal.fecha_limite);

                            return (
                                <div
                                    key={goal.id}
                                    style={{
                                        background: THEME.surface,
                                        borderRadius: '20px',
                                        padding: '1.5rem',
                                        border: `1px solid ${THEME.border}`,
                                        transition: 'all 0.3s ease',
                                        cursor: 'default',
                                        position: 'relative'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                        e.currentTarget.style.boxShadow = `0 12px 40px rgba(0,0,0,0.3), 0 0 0 1px ${progressColor}40`;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    {/* Completed Badge */}
                                    {goal.completada && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '1rem',
                                            right: '1rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.25rem',
                                            padding: '0.25rem 0.75rem',
                                            background: THEME.emeraldGlow,
                                            borderRadius: '999px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            color: THEME.emerald
                                        }}>
                                            <Check size={14} />
                                            Completada
                                        </div>
                                    )}

                                    {/* Goal Title */}
                                    <h3 style={{
                                        fontSize: '1.125rem',
                                        fontWeight: '600',
                                        color: THEME.text,
                                        margin: '0 0 0.5rem 0',
                                        paddingRight: goal.completada ? '100px' : '0'
                                    }}>
                                        {goal.nombre}
                                    </h3>

                                    {goal.descripcion && (
                                        <p style={{
                                            fontSize: '0.813rem',
                                            color: THEME.textMuted,
                                            margin: '0 0 1.5rem 0',
                                            lineHeight: '1.4'
                                        }}>
                                            {goal.descripcion}
                                        </p>
                                    )}

                                    {/* Circular Progress */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        marginBottom: '1.5rem'
                                    }}>
                                        <CircularProgress
                                            percentage={Math.min(percentage, 100)}
                                            color={progressColor}
                                            emoji={emoji}
                                        />
                                    </div>

                                    {/* Amount Info */}
                                    <div style={{
                                        textAlign: 'center',
                                        marginBottom: '1rem'
                                    }}>
                                        <span style={{
                                            fontSize: '1.25rem',
                                            fontWeight: '700',
                                            color: THEME.emerald,
                                            fontFamily: 'ui-monospace, monospace'
                                        }}>
                                            {formatCurrency(goal.monto_actual)}
                                        </span>
                                        <span style={{
                                            fontSize: '1rem',
                                            color: THEME.textMuted,
                                            margin: '0 0.5rem'
                                        }}>
                                            /
                                        </span>
                                        <span style={{
                                            fontSize: '1rem',
                                            color: THEME.textSecondary,
                                            fontFamily: 'ui-monospace, monospace'
                                        }}>
                                            {formatCurrency(goal.monto_objetivo)}
                                        </span>
                                    </div>

                                    {/* Days Remaining Badge */}
                                    {daysRemaining !== null && (
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            marginBottom: '1.5rem'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                padding: '0.5rem 1rem',
                                                background: daysRemaining <= 7 ? THEME.coralGlow :
                                                    daysRemaining <= 30 ? THEME.amberGlow : THEME.surfaceLight,
                                                borderRadius: '999px',
                                                fontSize: '0.813rem',
                                                fontWeight: '500',
                                                color: daysRemaining <= 7 ? THEME.coral :
                                                    daysRemaining <= 30 ? THEME.amber : THEME.textSecondary
                                            }}>
                                                {daysRemaining <= 0 ? (
                                                    <>
                                                        <Flame size={14} />
                                                        ¡Fecha límite pasada!
                                                    </>
                                                ) : (
                                                    <>
                                                        <Clock size={14} />
                                                        Faltan {daysRemaining} día{daysRemaining !== 1 ? 's' : ''}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    {!goal.completada && (
                                        <div style={{
                                            display: 'flex',
                                            gap: '0.75rem',
                                            justifyContent: 'center'
                                        }}>
                                            {/* Add Savings Button */}
                                            <button
                                                onClick={() => setShowAddSavings(showAddSavings === goal.id ? null : goal.id)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '0.5rem',
                                                    padding: '0.75rem 1.5rem',
                                                    background: showAddSavings === goal.id ? THEME.surfaceLight : THEME.emeraldGlow,
                                                    color: THEME.emerald,
                                                    border: `1px solid ${showAddSavings === goal.id ? THEME.border : THEME.emerald}40`,
                                                    borderRadius: '12px',
                                                    fontSize: '0.875rem',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    flex: 1
                                                }}
                                            >
                                                <Plus size={18} />
                                                Agregar
                                            </button>

                                            {/* Menu Button */}
                                            <div style={{ position: 'relative' }} ref={openMenuId === goal.id ? menuRef : null}>
                                                <button
                                                    onClick={() => setOpenMenuId(openMenuId === goal.id ? null : goal.id)}
                                                    style={{
                                                        width: '44px',
                                                        height: '44px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        background: openMenuId === goal.id ? THEME.surfaceLight : 'transparent',
                                                        border: `1px solid ${THEME.border}`,
                                                        borderRadius: '12px',
                                                        cursor: 'pointer',
                                                        color: THEME.textMuted,
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                >
                                                    <MoreHorizontal size={20} />
                                                </button>

                                                {/* Dropdown Menu */}
                                                {openMenuId === goal.id && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        bottom: '100%',
                                                        right: 0,
                                                        marginBottom: '0.5rem',
                                                        background: THEME.surface,
                                                        border: `1px solid ${THEME.border}`,
                                                        borderRadius: '12px',
                                                        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                                                        minWidth: '160px',
                                                        zIndex: 1000,
                                                        overflow: 'hidden'
                                                    }}>
                                                        {percentage >= 100 && (
                                                            <button
                                                                onClick={() => handleMarkCompleted(goal.id)}
                                                                style={{
                                                                    width: '100%',
                                                                    padding: '0.75rem 1rem',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '0.75rem',
                                                                    background: 'transparent',
                                                                    border: 'none',
                                                                    color: THEME.emerald,
                                                                    fontSize: '0.875rem',
                                                                    cursor: 'pointer',
                                                                    transition: 'background 0.15s ease'
                                                                }}
                                                                onMouseEnter={(e) => e.currentTarget.style.background = THEME.emeraldGlow}
                                                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                            >
                                                                <Trophy size={16} />
                                                                Completar
                                                            </button>
                                                        )}
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
                                                                cursor: 'pointer',
                                                                transition: 'background 0.15s ease'
                                                            }}
                                                            onMouseEnter={(e) => e.currentTarget.style.background = THEME.surfaceLight}
                                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                        >
                                                            <Edit2 size={16} color={THEME.textMuted} />
                                                            Editar
                                                        </button>
                                                        <div style={{ height: '1px', background: THEME.border }} />
                                                        <button
                                                            onClick={() => handleDelete(goal.id)}
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
                                                                cursor: 'pointer',
                                                                transition: 'background 0.15s ease'
                                                            }}
                                                            onMouseEnter={(e) => e.currentTarget.style.background = THEME.coralGlow}
                                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                        >
                                                            <Trash2 size={16} />
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Add Savings Form */}
                                    {showAddSavings === goal.id && (
                                        <div style={{
                                            marginTop: '1rem',
                                            padding: '1rem',
                                            background: THEME.surfaceLight,
                                            borderRadius: '12px',
                                            animation: 'slideIn 0.2s ease'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                gap: '0.75rem'
                                            }}>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={savingsAmount}
                                                    onChange={(e) => setSavingsAmount(e.target.value)}
                                                    placeholder="Monto..."
                                                    style={{
                                                        flex: 1,
                                                        padding: '0.75rem',
                                                        background: THEME.surface,
                                                        border: `1px solid ${THEME.border}`,
                                                        borderRadius: '10px',
                                                        color: THEME.text,
                                                        fontSize: '1rem',
                                                        fontFamily: 'ui-monospace, monospace'
                                                    }}
                                                />
                                                <button
                                                    onClick={() => handleAddSavings(goal.id)}
                                                    disabled={!savingsAmount || parseFloat(savingsAmount) <= 0}
                                                    style={{
                                                        padding: '0.75rem 1rem',
                                                        background: THEME.emerald,
                                                        color: '#FFFFFF',
                                                        border: 'none',
                                                        borderRadius: '10px',
                                                        fontSize: '0.875rem',
                                                        fontWeight: '600',
                                                        cursor: 'pointer',
                                                        opacity: (!savingsAmount || parseFloat(savingsAmount) <= 0) ? 0.5 : 1
                                                    }}
                                                >
                                                    <Check size={18} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setShowAddSavings(null);
                                                        setSavingsAmount('');
                                                    }}
                                                    style={{
                                                        padding: '0.75rem',
                                                        background: 'transparent',
                                                        color: THEME.textMuted,
                                                        border: `1px solid ${THEME.border}`,
                                                        borderRadius: '10px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                            <p style={{
                                                fontSize: '0.75rem',
                                                color: THEME.textMuted,
                                                margin: '0.75rem 0 0 0',
                                                textAlign: 'center'
                                            }}>
                                                💡 Se registrará como gasto de ahorro
                                            </p>
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

export default GoalsPremium;
