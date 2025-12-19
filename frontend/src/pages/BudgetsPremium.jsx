import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
    Wallet,
    Plus,
    X,
    Edit2,
    Trash2,
    TrendingUp,
    TrendingDown,
    Sparkles,
    MoreHorizontal,
    ShoppingCart,
    Home,
    Car,
    Utensils,
    Coffee,
    Film,
    Heart,
    Zap,
    Package,
    AlertTriangle,
    Check,
    Calendar,
    ArrowRight,
    PieChart
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
    orange: '#FB923C',
    orangeGlow: 'rgba(251, 146, 60, 0.2)',
});

// Category icons and colors
const CATEGORY_CONFIG = {
    'alimentos': { icon: Utensils, color: '#10B981' },
    'comida': { icon: Utensils, color: '#10B981' },
    'vivienda': { icon: Home, color: '#3B82F6' },
    'casa': { icon: Home, color: '#3B82F6' },
    'transporte': { icon: Car, color: '#8B5CF6' },
    'entretenimiento': { icon: Film, color: '#F59E0B' },
    'ocio': { icon: Coffee, color: '#F59E0B' },
    'salud': { icon: Heart, color: '#EF4444' },
    'servicios': { icon: Zap, color: '#06B6D4' },
    'compras': { icon: ShoppingCart, color: '#EC4899' },
    'default': { icon: Package, color: '#64748B' }
};

const getCategoryConfig = (categoryName) => {
    if (!categoryName) return CATEGORY_CONFIG.default;
    const name = categoryName.toLowerCase();
    for (const [key, config] of Object.entries(CATEGORY_CONFIG)) {
        if (name.includes(key)) return config;
    }
    return CATEGORY_CONFIG.default;
};

// Get bar color based on percentage
const getProgressColor = (percentage, THEME) => {
    if (percentage >= 100) return THEME.coral;
    if (percentage >= 80) return THEME.orange;
    if (percentage >= 50) return THEME.amber;
    return THEME.emerald;
};

const getProgressGlow = (percentage, THEME) => {
    if (percentage >= 100) return THEME.coralGlow;
    if (percentage >= 80) return THEME.orangeGlow;
    if (percentage >= 50) return THEME.amberGlow;
    return THEME.emeraldGlow;
};

const BudgetsPremium = () => {
    const { isDarkMode } = useTheme();
    const THEME = getTheme(isDarkMode);

    const [currentBudget, setCurrentBudget] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [openMenuId, setOpenMenuId] = useState(null);
    const menuRef = useRef(null);

    const [formData, setFormData] = useState({
        presupuesto_total: ''
    });
    const [categoryFormData, setCategoryFormData] = useState({
        categoria: '',
        limite_asignado: '',
        alerta_porcentaje: 80
    });

    useEffect(() => {
        fetchCurrentBudget();
        fetchCategories();
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

    const fetchCurrentBudget = async () => {
        setLoading(true);
        try {
            const response = await api.get('/budgets/monthly/current_month/');
            setCurrentBudget(response.data);
        } catch (error) {
            if (error.response?.status === 404) {
                setCurrentBudget(null);
            } else {
                toast.error('Error al cargar presupuesto');
            }
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

    const handleCreateBudget = async (e) => {
        e.preventDefault();
        try {
            await api.post('/budgets/monthly/create_current_month/', formData);
            toast.success('Presupuesto creado exitosamente');
            setShowCreateForm(false);
            setFormData({ presupuesto_total: '' });
            fetchCurrentBudget();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Error al crear presupuesto');
        }
    };

    const handleAddCategoryBudget = async (e) => {
        e.preventDefault();
        if (!currentBudget) return;
        try {
            await api.post(`/budgets/monthly/${currentBudget.id}/add_category_budget/`, categoryFormData);
            toast.success('Categoría agregada al presupuesto');
            setShowCategoryForm(false);
            setCategoryFormData({ categoria: '', limite_asignado: '', alerta_porcentaje: 80 });
            fetchCurrentBudget();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Error al agregar categoría');
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const getCurrentMonth = () => {
        const now = new Date();
        const months = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        return `${months[now.getMonth()]} ${now.getFullYear()}`;
    };

    // Calculate totals
    const totalBudget = currentBudget?.presupuesto_total || 0;
    const totalSpent = currentBudget?.gastado_actual || 0;
    const totalRemaining = totalBudget - totalSpent;
    const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    const daysRemaining = currentBudget?.dias_restantes_mes || 14;

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
                            <Wallet size={28} color={THEME.amber} />
                            <h1 style={{
                                fontSize: '2rem',
                                fontWeight: '700',
                                color: THEME.text,
                                margin: 0,
                                letterSpacing: '-0.02em'
                            }}>
                                Presupuestos
                            </h1>
                        </div>
                        <p style={{
                            color: THEME.textSecondary,
                            fontSize: '1rem',
                            margin: 0
                        }}>
                            Control de gastos • {getCurrentMonth()}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        {currentBudget && (
                            <button
                                onClick={() => setShowCategoryForm(!showCategoryForm)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.875rem 1.5rem',
                                    background: showCategoryForm ? THEME.surfaceLight : THEME.emeraldGlow,
                                    color: THEME.emerald,
                                    border: `1px solid ${THEME.emerald}40`,
                                    borderRadius: '14px',
                                    fontSize: '0.938rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {showCategoryForm ? <X size={20} /> : <Plus size={20} />}
                                {showCategoryForm ? 'Cancelar' : 'Categoría'}
                            </button>
                        )}
                        {!currentBudget && (
                            <button
                                onClick={() => setShowCreateForm(!showCreateForm)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.875rem 1.5rem',
                                    background: showCreateForm ? THEME.surfaceLight : `linear-gradient(135deg, ${THEME.amber} 0%, ${THEME.orange} 100%)`,
                                    color: showCreateForm ? THEME.text : '#FFFFFF',
                                    border: showCreateForm ? `1px solid ${THEME.border}` : 'none',
                                    borderRadius: '14px',
                                    fontSize: '0.938rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    boxShadow: showCreateForm ? 'none' : '0 4px 14px rgba(245, 158, 11, 0.4)'
                                }}
                            >
                                {showCreateForm ? <X size={20} /> : <Plus size={20} />}
                                {showCreateForm ? 'Cancelar' : 'Nuevo Presupuesto'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Loading State */}
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
                            borderTop: `3px solid ${THEME.amber}`,
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }} />
                        <p style={{ color: THEME.textSecondary }}>Cargando presupuesto...</p>
                    </div>
                ) : currentBudget ? (
                    <>
                        {/* Executive Summary Card */}
                        <div style={{
                            background: `linear-gradient(135deg, ${THEME.surface} 0%, ${THEME.surfaceLight} 100%)`,
                            borderRadius: '24px',
                            padding: '2rem',
                            border: `1px solid ${THEME.border}`,
                            marginBottom: '2rem'
                        }}>
                            {/* Top Stats Row */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '1.5rem',
                                marginBottom: '2rem'
                            }}>
                                {/* Total Budget */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem'
                                }}>
                                    <div style={{
                                        width: '56px',
                                        height: '56px',
                                        borderRadius: '16px',
                                        background: THEME.blueGlow,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Wallet size={26} color={THEME.blue} />
                                    </div>
                                    <div>
                                        <p style={{
                                            color: THEME.textSecondary,
                                            fontSize: '0.813rem',
                                            margin: '0 0 0.25rem 0',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em'
                                        }}>Presupuesto Total</p>
                                        <p style={{
                                            color: THEME.text,
                                            fontSize: '1.75rem',
                                            fontWeight: '700',
                                            margin: 0,
                                            fontFamily: 'ui-monospace, monospace'
                                        }}>{formatCurrency(totalBudget)}</p>
                                    </div>
                                </div>

                                {/* Spent */}
                                <div style={{
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
                                        }}>Gastado</p>
                                        <p style={{
                                            color: THEME.coral,
                                            fontSize: '1.75rem',
                                            fontWeight: '700',
                                            margin: 0,
                                            fontFamily: 'ui-monospace, monospace'
                                        }}>{formatCurrency(totalSpent)}</p>
                                    </div>
                                </div>

                                {/* Remaining */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem'
                                }}>
                                    <div style={{
                                        width: '56px',
                                        height: '56px',
                                        borderRadius: '16px',
                                        background: totalRemaining >= 0 ? THEME.emeraldGlow : THEME.coralGlow,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {totalRemaining >= 0 ? (
                                            <TrendingUp size={26} color={THEME.emerald} />
                                        ) : (
                                            <AlertTriangle size={26} color={THEME.coral} />
                                        )}
                                    </div>
                                    <div>
                                        <p style={{
                                            color: THEME.textSecondary,
                                            fontSize: '0.813rem',
                                            margin: '0 0 0.25rem 0',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em'
                                        }}>{totalRemaining >= 0 ? 'Disponible' : 'Excedido'}</p>
                                        <p style={{
                                            color: totalRemaining >= 0 ? THEME.emerald : THEME.coral,
                                            fontSize: '1.75rem',
                                            fontWeight: '700',
                                            margin: 0,
                                            fontFamily: 'ui-monospace, monospace'
                                        }}>{formatCurrency(Math.abs(totalRemaining))}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '0.75rem'
                                }}>
                                    <span style={{
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        color: THEME.text
                                    }}>Progreso del mes</span>
                                    <span style={{
                                        fontSize: '0.875rem',
                                        fontWeight: '700',
                                        color: getProgressColor(overallPercentage, THEME)
                                    }}>
                                        {overallPercentage.toFixed(1)}%
                                    </span>
                                </div>
                                <div style={{
                                    width: '100%',
                                    height: '16px',
                                    background: THEME.surfaceLight,
                                    borderRadius: '999px',
                                    overflow: 'hidden',
                                    position: 'relative'
                                }}>
                                    <div style={{
                                        width: `${Math.min(overallPercentage, 100)}%`,
                                        height: '100%',
                                        background: `linear-gradient(90deg, ${getProgressColor(overallPercentage, THEME)}, ${getProgressColor(overallPercentage, THEME)}CC)`,
                                        borderRadius: '999px',
                                        transition: 'width 0.5s ease',
                                        boxShadow: `0 0 12px ${getProgressGlow(overallPercentage, THEME)}`
                                    }} />
                                    {overallPercentage > 100 && (
                                        <div style={{
                                            position: 'absolute',
                                            top: 0,
                                            right: 0,
                                            bottom: 0,
                                            width: '4px',
                                            background: THEME.coral,
                                            animation: 'pulse 1s ease-in-out infinite'
                                        }} />
                                    )}
                                </div>
                            </div>

                            {/* Footer Info */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 1.5rem',
                                background: THEME.surfaceLight,
                                borderRadius: '12px',
                                color: THEME.textSecondary,
                                fontSize: '0.938rem'
                            }}>
                                <Calendar size={18} />
                                <span>
                                    Te quedan <strong style={{ color: THEME.text }}>{formatCurrency(Math.max(totalRemaining, 0))}</strong> para los próximos <strong style={{ color: THEME.text }}>{daysRemaining} días</strong>
                                </span>
                            </div>
                        </div>

                        {/* Add Category Form */}
                        {showCategoryForm && (
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
                                        background: THEME.emeraldGlow,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Plus size={20} color={THEME.emerald} />
                                    </div>
                                    <h2 style={{
                                        fontSize: '1.25rem',
                                        fontWeight: '600',
                                        color: THEME.text,
                                        margin: 0
                                    }}>
                                        Agregar Categoría al Presupuesto
                                    </h2>
                                </div>

                                <form onSubmit={handleAddCategoryBudget}>
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
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
                                                Categoría
                                            </label>
                                            <select
                                                value={categoryFormData.categoria}
                                                onChange={(e) => setCategoryFormData({ ...categoryFormData, categoria: e.target.value })}
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
                                            >
                                                <option value="">Seleccionar...</option>
                                                {categories.filter(cat =>
                                                    !currentBudget.category_budgets?.some(cb => cb.categoria === cat.id)
                                                ).map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label style={{
                                                display: 'block',
                                                fontSize: '0.813rem',
                                                fontWeight: '500',
                                                color: THEME.textSecondary,
                                                marginBottom: '0.5rem'
                                            }}>
                                                Límite
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={categoryFormData.limite_asignado}
                                                onChange={(e) => setCategoryFormData({ ...categoryFormData, limite_asignado: e.target.value })}
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
                                                Alerta (%)
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="100"
                                                value={categoryFormData.alerta_porcentaje}
                                                onChange={(e) => setCategoryFormData({ ...categoryFormData, alerta_porcentaje: e.target.value })}
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
                                            background: `linear-gradient(135deg, ${THEME.emerald} 0%, #059669 100%)`,
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
                                        Agregar Categoría
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* Category Budgets Grid */}
                        {currentBudget.category_budgets && currentBudget.category_budgets.length > 0 && (
                            <div>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '1.5rem'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <PieChart size={22} color={THEME.purple} />
                                        <h2 style={{
                                            fontSize: '1.25rem',
                                            fontWeight: '600',
                                            color: THEME.text,
                                            margin: 0
                                        }}>
                                            Por Categoría
                                        </h2>
                                    </div>
                                    <span style={{
                                        padding: '0.5rem 1rem',
                                        background: THEME.purpleGlow,
                                        borderRadius: '999px',
                                        fontSize: '0.813rem',
                                        fontWeight: '600',
                                        color: THEME.purple
                                    }}>
                                        {currentBudget.category_budgets.length} categorías
                                    </span>
                                </div>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                                    gap: '1.5rem'
                                }}>
                                    {currentBudget.category_budgets.map((categoryBudget) => {
                                        const percentage = categoryBudget.porcentaje_gastado || 0;
                                        const categoryName = categoryBudget.categoria_info?.nombre || categoryBudget.categoria_nombre || 'Categoría';
                                        const config = getCategoryConfig(categoryName);
                                        const CategoryIcon = config.icon;
                                        const remaining = (categoryBudget.limite_asignado || 0) - (categoryBudget.gastado_actual || 0);
                                        const isExceeded = remaining < 0;

                                        return (
                                            <div
                                                key={categoryBudget.id}
                                                style={{
                                                    background: THEME.surface,
                                                    borderRadius: '20px',
                                                    padding: '1.5rem',
                                                    border: `1px solid ${THEME.border}`,
                                                    transition: 'all 0.3s ease',
                                                    position: 'relative'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                                    e.currentTarget.style.boxShadow = `0 12px 40px rgba(0,0,0,0.2), 0 0 0 1px ${config.color}40`;
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                }}
                                            >
                                                {/* Header */}
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'flex-start',
                                                    marginBottom: '1.25rem'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <div style={{
                                                            width: '44px',
                                                            height: '44px',
                                                            borderRadius: '12px',
                                                            background: `${config.color}20`,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}>
                                                            <CategoryIcon size={22} color={config.color} />
                                                        </div>
                                                        <div>
                                                            <h3 style={{
                                                                fontSize: '1rem',
                                                                fontWeight: '600',
                                                                color: THEME.text,
                                                                margin: 0
                                                            }}>
                                                                {categoryName}
                                                            </h3>
                                                            <p style={{
                                                                fontSize: '0.75rem',
                                                                color: THEME.textMuted,
                                                                margin: 0
                                                            }}>
                                                                Límite: {formatCurrency(categoryBudget.limite_asignado)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Remaining Amount */}
                                                    <div style={{ textAlign: 'right' }}>
                                                        <p style={{
                                                            fontSize: '1.125rem',
                                                            fontWeight: '700',
                                                            color: isExceeded ? THEME.coral : THEME.emerald,
                                                            margin: 0,
                                                            fontFamily: 'ui-monospace, monospace'
                                                        }}>
                                                            {isExceeded ? '-' : ''}{formatCurrency(Math.abs(remaining))}
                                                        </p>
                                                        <p style={{
                                                            fontSize: '0.688rem',
                                                            color: THEME.textMuted,
                                                            margin: 0,
                                                            textTransform: 'uppercase'
                                                        }}>
                                                            {isExceeded ? 'Excedido' : 'Disponible'}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Progress Bar */}
                                                <div style={{ marginBottom: '1rem' }}>
                                                    <div style={{
                                                        width: '100%',
                                                        height: '12px',
                                                        background: THEME.surfaceLight,
                                                        borderRadius: '999px',
                                                        overflow: 'hidden'
                                                    }}>
                                                        <div style={{
                                                            width: `${Math.min(percentage, 100)}%`,
                                                            height: '100%',
                                                            background: getProgressColor(percentage, THEME),
                                                            borderRadius: '999px',
                                                            transition: 'width 0.5s ease'
                                                        }} />
                                                    </div>
                                                </div>

                                                {/* Stats */}
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}>
                                                    <span style={{
                                                        fontSize: '0.813rem',
                                                        color: THEME.textSecondary
                                                    }}>
                                                        {formatCurrency(categoryBudget.gastado_actual || 0)} de {formatCurrency(categoryBudget.limite_asignado || 0)}
                                                    </span>
                                                    <span style={{
                                                        padding: '0.25rem 0.75rem',
                                                        background: getProgressGlow(percentage, THEME),
                                                        borderRadius: '999px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '600',
                                                        color: getProgressColor(percentage, THEME)
                                                    }}>
                                                        {percentage.toFixed(0)}%
                                                    </span>
                                                </div>

                                                {/* Alert Badge */}
                                                {isExceeded && (
                                                    <div style={{
                                                        marginTop: '1rem',
                                                        padding: '0.75rem',
                                                        background: THEME.coralGlow,
                                                        borderRadius: '10px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem'
                                                    }}>
                                                        <AlertTriangle size={16} color={THEME.coral} />
                                                        <span style={{
                                                            fontSize: '0.813rem',
                                                            color: THEME.coral,
                                                            fontWeight: '500'
                                                        }}>
                                                            Excedido por {formatCurrency(Math.abs(remaining))}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Action Buttons */}
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'flex-end',
                                                    gap: '0.5rem',
                                                    marginTop: '1rem',
                                                    paddingTop: '1rem',
                                                    borderTop: `1px solid ${THEME.border}`
                                                }}>
                                                    <button
                                                        onClick={() => toast('Función de edición próximamente')}
                                                        style={{
                                                            width: '36px',
                                                            height: '36px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            background: 'transparent',
                                                            border: `1px solid ${THEME.border}`,
                                                            borderRadius: '10px',
                                                            cursor: 'pointer',
                                                            color: THEME.textMuted,
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                        title="Editar"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => toast('Función de transferir próximamente')}
                                                        style={{
                                                            width: '36px',
                                                            height: '36px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            background: 'transparent',
                                                            border: `1px solid ${THEME.border}`,
                                                            borderRadius: '10px',
                                                            cursor: 'pointer',
                                                            color: THEME.textMuted,
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                        title="Transferir fondos"
                                                    >
                                                        <ArrowRight size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Empty Categories State */}
                        {(!currentBudget.category_budgets || currentBudget.category_budgets.length === 0) && (
                            <div style={{
                                background: THEME.surface,
                                borderRadius: '24px',
                                padding: '3rem 2rem',
                                textAlign: 'center',
                                border: `1px solid ${THEME.border}`
                            }}>
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '50%',
                                    background: THEME.amberGlow,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 1.5rem'
                                }}>
                                    <PieChart size={40} color={THEME.amber} strokeWidth={1.5} />
                                </div>
                                <h3 style={{
                                    color: THEME.text,
                                    fontSize: '1.25rem',
                                    fontWeight: '600',
                                    marginBottom: '0.5rem'
                                }}>
                                    Agrega categorías a tu presupuesto
                                </h3>
                                <p style={{
                                    color: THEME.textSecondary,
                                    marginBottom: '1.5rem',
                                    maxWidth: '400px',
                                    margin: '0 auto 1.5rem'
                                }}>
                                    Divide tu presupuesto en categorías para un mejor control de tus gastos
                                </p>
                                <button
                                    onClick={() => setShowCategoryForm(true)}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.875rem 1.5rem',
                                        background: THEME.emeraldGlow,
                                        color: THEME.emerald,
                                        border: `1px solid ${THEME.emerald}40`,
                                        borderRadius: '14px',
                                        fontSize: '0.938rem',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Plus size={20} />
                                    Agregar Categoría
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    /* Empty Budget State */
                    <>
                        {showCreateForm ? (
                            <div style={{
                                background: THEME.surface,
                                borderRadius: '24px',
                                padding: '2rem',
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
                                        background: THEME.amberGlow,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Wallet size={24} color={THEME.amber} />
                                    </div>
                                    <div>
                                        <h2 style={{
                                            fontSize: '1.25rem',
                                            fontWeight: '600',
                                            color: THEME.text,
                                            margin: 0
                                        }}>
                                            Crear Presupuesto
                                        </h2>
                                        <p style={{
                                            fontSize: '0.875rem',
                                            color: THEME.textSecondary,
                                            margin: 0
                                        }}>{getCurrentMonth()}</p>
                                    </div>
                                </div>

                                <form onSubmit={handleCreateBudget}>
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{
                                            display: 'block',
                                            fontSize: '0.875rem',
                                            fontWeight: '500',
                                            color: THEME.textSecondary,
                                            marginBottom: '0.5rem'
                                        }}>
                                            Presupuesto Total Mensual
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.presupuesto_total}
                                            onChange={(e) => setFormData({ ...formData, presupuesto_total: e.target.value })}
                                            placeholder="15,000.00"
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '1rem',
                                                background: THEME.surfaceLight,
                                                border: `1px solid ${THEME.border}`,
                                                borderRadius: '12px',
                                                color: THEME.text,
                                                fontSize: '1.5rem',
                                                fontWeight: '600',
                                                fontFamily: 'ui-monospace, monospace',
                                                textAlign: 'center'
                                            }}
                                        />
                                        <p style={{
                                            fontSize: '0.813rem',
                                            color: THEME.textMuted,
                                            margin: '0.5rem 0 0 0',
                                            textAlign: 'center'
                                        }}>
                                            Este será tu límite total de gastos para el mes
                                        </p>
                                    </div>

                                    <button
                                        type="submit"
                                        style={{
                                            width: '100%',
                                            padding: '1rem',
                                            background: `linear-gradient(135deg, ${THEME.amber} 0%, ${THEME.orange} 100%)`,
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
                                        Crear Presupuesto
                                    </button>
                                </form>
                            </div>
                        ) : (
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
                                    background: THEME.amberGlow,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 1.5rem'
                                }}>
                                    <Wallet size={48} color={THEME.amber} strokeWidth={1.5} />
                                </div>
                                <h3 style={{
                                    color: THEME.text,
                                    fontSize: '1.5rem',
                                    fontWeight: '600',
                                    marginBottom: '0.5rem'
                                }}>
                                    No tienes presupuesto para este mes
                                </h3>
                                <p style={{
                                    color: THEME.textSecondary,
                                    marginBottom: '2rem',
                                    maxWidth: '400px',
                                    margin: '0 auto 2rem'
                                }}>
                                    Crea un presupuesto mensual para empezar a controlar tus gastos y alcanzar tus metas financieras
                                </p>
                                <button
                                    onClick={() => setShowCreateForm(true)}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '1rem 2rem',
                                        background: `linear-gradient(135deg, ${THEME.amber} 0%, ${THEME.orange} 100%)`,
                                        color: '#FFFFFF',
                                        border: 'none',
                                        borderRadius: '14px',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)'
                                    }}
                                >
                                    <Wallet size={20} />
                                    Crear Presupuesto para {getCurrentMonth()}
                                </button>
                            </div>
                        )}
                    </>
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
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
        </div>
    );
};

export default BudgetsPremium;
