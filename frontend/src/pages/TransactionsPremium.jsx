import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
    ArrowUpRight,
    ArrowDownRight,
    Plus,
    X,
    Calendar,
    Tag,
    MoreHorizontal,
    Edit2,
    Copy,
    Trash2,
    Filter,
    TrendingUp,
    TrendingDown,
    ShoppingCart,
    Coffee,
    Home,
    Car,
    Heart,
    GraduationCap,
    Package,
    Utensils,
    Shirt,
    Repeat,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Receipt,
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
    emeraldGlow: 'rgba(16, 185, 129, 0.15)',
    coral: '#F87171',
    coralGlow: 'rgba(248, 113, 113, 0.15)',
    blue: '#3B82F6',
    blueGlow: 'rgba(59, 130, 246, 0.15)',
    purple: '#8B5CF6',
    purpleGlow: 'rgba(139, 92, 246, 0.15)',
    amber: '#F59E0B',
    amberGlow: 'rgba(245, 158, 11, 0.15)',
});

const CATEGORY_ICONS = {
    comida: Utensils,
    alimento: Utensils,
    restaurante: Coffee,
    transporte: Car,
    auto: Car,
    gasolina: Car,
    salud: Heart,
    médico: Heart,
    medicina: Heart,
    educación: GraduationCap,
    escuela: GraduationCap,
    curso: GraduationCap,
    hogar: Home,
    casa: Home,
    vivienda: Home,
    entretenimiento: Coffee,
    ocio: Coffee,
    compras: ShoppingCart,
    shopping: ShoppingCart,
    ropa: Shirt,
    vestir: Shirt,
    default: Package
};

const CATEGORY_COLORS = [
    '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6',
    '#F87171', '#06B6D4', '#EC4899', '#84CC16'
];

const TransactionsPremium = () => {
    const { isDarkMode } = useTheme();
    const THEME = getTheme(isDarkMode);

    const [activeTab, setActiveTab] = useState('gastos');
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [openMenuId, setOpenMenuId] = useState(null);
    const menuRef = useRef(null);

    const [pagination, setPagination] = useState({
        count: 0,
        next: null,
        previous: null,
        currentPage: 1,
        totalPages: 1
    });

    const [formData, setFormData] = useState({
        monto: '',
        descripcion: '',
        fecha: new Date().toISOString().split('T')[0],
        categoria: '',
        es_recurrente: false,
        frecuencia_dias: ''
    });

    useEffect(() => {
        fetchTransactions(1);
        if (activeTab === 'gastos') {
            fetchCategories();
        }
    }, [activeTab]);

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

    const fetchTransactions = async (page = 1) => {
        setLoading(true);
        try {
            const endpoint = activeTab === 'gastos' ? '/transactions/gastos/' : '/transactions/ingresos/';
            const response = await api.get(`${endpoint}?page=${page}`);

            if (response.data.results) {
                setTransactions(response.data.results);
                setPagination({
                    count: response.data.count,
                    next: response.data.next,
                    previous: response.data.previous,
                    currentPage: page,
                    totalPages: Math.ceil(response.data.count / 20)
                });
            } else {
                setTransactions(response.data);
                setPagination({
                    count: response.data.length,
                    next: null,
                    previous: null,
                    currentPage: 1,
                    totalPages: 1
                });
            }
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

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchTransactions(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const endpoint = activeTab === 'gastos' ? '/transactions/gastos/' : '/transactions/ingresos/';
            const data = { ...formData };
            data.es_recurrente = Boolean(data.es_recurrente);
            if (!data.es_recurrente) data.frecuencia_dias = null;
            if (activeTab === 'ingresos') delete data.categoria;

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
            fetchTransactions(1);
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Error al guardar transacción');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar esta transacción?')) {
            try {
                const endpoint = activeTab === 'gastos' ? `/transactions/gastos/${id}/` : `/transactions/ingresos/${id}/`;
                await api.delete(endpoint);
                toast.success('Transacción eliminada');
                setOpenMenuId(null);
                if (transactions.length === 1 && pagination.currentPage > 1) {
                    fetchTransactions(pagination.currentPage - 1);
                } else {
                    fetchTransactions(pagination.currentPage);
                }
            } catch (error) {
                toast.error('Error al eliminar transacción');
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

    const formatCurrencyParts = (amount) => {
        const formatted = formatCurrency(amount);
        const parts = formatted.split('$');
        return { symbol: '$', value: parts[1] || '0.00' };
    };

    const capitalize = (str) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    // Group transactions by date
    const groupTransactionsByDate = useCallback((transactionList) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);

        const groups = {};

        transactionList.forEach(transaction => {
            const transDate = new Date(transaction.fecha);
            transDate.setHours(0, 0, 0, 0);

            let groupKey;
            if (transDate.getTime() === today.getTime()) {
                groupKey = 'Hoy';
            } else if (transDate.getTime() === yesterday.getTime()) {
                groupKey = 'Ayer';
            } else if (transDate >= weekAgo) {
                groupKey = 'Esta Semana';
            } else {
                // Format as month name
                groupKey = transDate.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
                groupKey = groupKey.charAt(0).toUpperCase() + groupKey.slice(1);
            }

            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push(transaction);
        });

        return groups;
    }, []);

    const getCategoryIcon = (categoryName) => {
        if (!categoryName) return Package;
        const name = categoryName.toLowerCase();
        for (const [key, Icon] of Object.entries(CATEGORY_ICONS)) {
            if (name.includes(key)) return Icon;
        }
        return Package;
    };

    const getCategoryColor = (categoryId) => {
        return CATEGORY_COLORS[categoryId % CATEGORY_COLORS.length];
    };

    // Calculate totals
    const totalAmount = transactions.reduce((sum, t) => sum + parseFloat(t.monto), 0);
    const currentMonth = new Date().toLocaleDateString('es-MX', { month: 'long' });
    const capitalizedMonth = currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1);

    // Filter transactions
    const filteredTransactions = selectedCategory === 'all'
        ? transactions
        : transactions.filter(t => t.categoria_info?.id?.toString() === selectedCategory);

    const groupedTransactions = groupTransactionsByDate(filteredTransactions);

    return (
        <div style={{
            minHeight: '100vh',
            background: THEME.background,
            paddingBottom: '3rem'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>

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
                            <Receipt size={28} color={THEME.blue} />
                            <h1 style={{
                                fontSize: '2rem',
                                fontWeight: '700',
                                color: THEME.text,
                                margin: 0,
                                letterSpacing: '-0.02em'
                            }}>
                                Movimientos
                            </h1>
                        </div>
                        <p style={{
                            color: THEME.textSecondary,
                            fontSize: '1rem',
                            margin: '0 0 1rem 0'
                        }}>
                            Gestiona tus ingresos y gastos
                        </p>

                        {/* Dynamic Total */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'baseline',
                            gap: '0.5rem'
                        }}>
                            <span style={{ color: THEME.textSecondary, fontSize: '1rem' }}>
                                {activeTab === 'gastos' ? 'Gastos' : 'Ingresos'} de {capitalizedMonth}:
                            </span>
                            <span style={{
                                fontSize: '1.75rem',
                                fontWeight: '700',
                                color: activeTab === 'gastos' ? THEME.coral : THEME.emerald,
                                fontFamily: 'ui-monospace, monospace'
                            }}>
                                {formatCurrency(totalAmount)}
                            </span>
                        </div>
                    </div>

                    {/* Add Button */}
                    <button
                        onClick={() => setShowForm(!showForm)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.875rem 1.5rem',
                            background: showForm ? THEME.surfaceLight : `linear-gradient(135deg, ${THEME.blue} 0%, ${THEME.purple} 100%)`,
                            color: showForm ? THEME.text : '#FFFFFF',
                            border: showForm ? `1px solid ${THEME.border}` : 'none',
                            borderRadius: '14px',
                            fontSize: '0.938rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: showForm ? 'none' : '0 4px 14px rgba(59, 130, 246, 0.4)'
                        }}
                    >
                        {showForm ? <X size={20} /> : <Plus size={20} />}
                        {showForm ? 'Cancelar' : 'Nuevo Movimiento'}
                    </button>
                </div>

                {/* Sticky Filter Bar */}
                <div style={{
                    position: 'sticky',
                    top: '0',
                    zIndex: 100,
                    background: isDarkMode ? 'rgba(11, 12, 16, 0.95)' : 'rgba(248, 250, 252, 0.95)',
                    backdropFilter: 'blur(12px)',
                    padding: '1rem 0',
                    marginBottom: '1.5rem',
                    borderBottom: `1px solid ${THEME.border}`
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        flexWrap: 'wrap'
                    }}>
                        {/* Segmented Control */}
                        <div style={{
                            display: 'flex',
                            background: THEME.surfaceLight,
                            padding: '4px',
                            borderRadius: '12px',
                            gap: '4px'
                        }}>
                            <button
                                onClick={() => setActiveTab('gastos')}
                                style={{
                                    padding: '0.625rem 1.25rem',
                                    border: 'none',
                                    borderRadius: '10px',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    background: activeTab === 'gastos' ? THEME.surface : 'transparent',
                                    color: activeTab === 'gastos' ? THEME.coral : THEME.textSecondary,
                                    boxShadow: activeTab === 'gastos' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
                                }}
                            >
                                <ArrowDownRight size={16} />
                                Gastos
                            </button>
                            <button
                                onClick={() => setActiveTab('ingresos')}
                                style={{
                                    padding: '0.625rem 1.25rem',
                                    border: 'none',
                                    borderRadius: '10px',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    background: activeTab === 'ingresos' ? THEME.surface : 'transparent',
                                    color: activeTab === 'ingresos' ? THEME.emerald : THEME.textSecondary,
                                    boxShadow: activeTab === 'ingresos' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
                                }}
                            >
                                <ArrowUpRight size={16} />
                                Ingresos
                            </button>
                        </div>

                        {/* Category Filter */}
                        {activeTab === 'gastos' && categories.length > 0 && (
                            <div style={{ position: 'relative' }}>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    style={{
                                        padding: '0.625rem 2.5rem 0.625rem 1rem',
                                        background: THEME.surface,
                                        border: `1px solid ${THEME.border}`,
                                        borderRadius: '10px',
                                        color: THEME.text,
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        appearance: 'none',
                                        minWidth: '160px'
                                    }}
                                >
                                    <option value="all">Todas las categorías</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                    ))}
                                </select>
                                <Filter
                                    size={16}
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: THEME.textMuted,
                                        pointerEvents: 'none'
                                    }}
                                />
                            </div>
                        )}

                        {/* Transaction Count Badge */}
                        <div style={{
                            marginLeft: 'auto',
                            padding: '0.5rem 1rem',
                            background: activeTab === 'gastos' ? THEME.coralGlow : THEME.emeraldGlow,
                            borderRadius: '999px',
                            fontSize: '0.813rem',
                            fontWeight: '600',
                            color: activeTab === 'gastos' ? THEME.coral : THEME.emerald
                        }}>
                            {filteredTransactions.length} {activeTab}
                        </div>
                    </div>
                </div>

                {/* Add Transaction Form */}
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
                                background: activeTab === 'gastos' ? THEME.coralGlow : THEME.emeraldGlow,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {activeTab === 'gastos' ?
                                    <ArrowDownRight size={20} color={THEME.coral} /> :
                                    <ArrowUpRight size={20} color={THEME.emerald} />
                                }
                            </div>
                            <h2 style={{
                                fontSize: '1.25rem',
                                fontWeight: '600',
                                color: THEME.text,
                                margin: 0
                            }}>
                                Agregar {activeTab === 'gastos' ? 'Gasto' : 'Ingreso'}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
                                        Monto
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.monto}
                                        onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
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
                                        Fecha
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.fecha}
                                        onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
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

                                {activeTab === 'gastos' && (
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
                                            value={formData.categoria}
                                            onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
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
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.813rem',
                                    fontWeight: '500',
                                    color: THEME.textSecondary,
                                    marginBottom: '0.5rem'
                                }}>
                                    Descripción
                                </label>
                                <input
                                    type="text"
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                    placeholder="¿En qué gastaste?"
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
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                marginBottom: '1.5rem'
                            }}>
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    cursor: 'pointer',
                                    color: THEME.text,
                                    fontSize: '0.875rem'
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.es_recurrente}
                                        onChange={(e) => setFormData({ ...formData, es_recurrente: e.target.checked })}
                                        style={{ width: '18px', height: '18px', accentColor: THEME.blue }}
                                    />
                                    <Repeat size={16} />
                                    Es recurrente
                                </label>

                                {formData.es_recurrente && (
                                    <input
                                        type="number"
                                        value={formData.frecuencia_dias}
                                        onChange={(e) => setFormData({ ...formData, frecuencia_dias: e.target.value })}
                                        placeholder="Días (ej: 30)"
                                        style={{
                                            width: '140px',
                                            padding: '0.5rem 0.75rem',
                                            background: THEME.surfaceLight,
                                            border: `1px solid ${THEME.border}`,
                                            borderRadius: '8px',
                                            color: THEME.text,
                                            fontSize: '0.875rem'
                                        }}
                                    />
                                )}
                            </div>

                            <button
                                type="submit"
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    background: activeTab === 'gastos'
                                        ? `linear-gradient(135deg, ${THEME.coral} 0%, #EF4444 100%)`
                                        : `linear-gradient(135deg, ${THEME.emerald} 0%, #059669 100%)`,
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
                                Guardar {activeTab === 'gastos' ? 'Gasto' : 'Ingreso'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Transactions List */}
                <div style={{
                    background: THEME.surface,
                    borderRadius: '20px',
                    border: `1px solid ${THEME.border}`,
                    overflow: 'hidden'
                }}>
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
                                width: '48px',
                                height: '48px',
                                border: `3px solid ${THEME.border}`,
                                borderTop: `3px solid ${THEME.blue}`,
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }} />
                            <p style={{ color: THEME.textSecondary }}>Cargando movimientos...</p>
                        </div>
                    ) : filteredTransactions.length === 0 ? (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '4rem',
                            gap: '1rem'
                        }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                background: THEME.surfaceLight,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {activeTab === 'gastos' ?
                                    <ArrowDownRight size={36} color={THEME.textMuted} /> :
                                    <ArrowUpRight size={36} color={THEME.textMuted} />
                                }
                            </div>
                            <h3 style={{ color: THEME.text, margin: 0, fontSize: '1.125rem' }}>
                                No hay {activeTab} registrados
                            </h3>
                            <p style={{ color: THEME.textSecondary, margin: 0, textAlign: 'center' }}>
                                Comienza agregando tu primer {activeTab === 'gastos' ? 'gasto' : 'ingreso'}
                            </p>
                        </div>
                    ) : (
                        <div>
                            {Object.entries(groupedTransactions).map(([dateGroup, groupTransactions]) => (
                                <div key={dateGroup}>
                                    {/* Date Group Header */}
                                    <div style={{
                                        padding: '0.75rem 1.5rem',
                                        background: THEME.surfaceLight,
                                        borderBottom: `1px solid ${THEME.border}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <Calendar size={14} color={THEME.textMuted} />
                                        <span style={{
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            color: THEME.textSecondary,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em'
                                        }}>
                                            {dateGroup}
                                        </span>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            color: THEME.textMuted
                                        }}>
                                            • {groupTransactions.length} movimiento{groupTransactions.length > 1 ? 's' : ''}
                                        </span>
                                    </div>

                                    {/* Transactions in Group */}
                                    {groupTransactions.map((transaction, index) => {
                                        const CategoryIcon = getCategoryIcon(transaction.categoria_info?.nombre);
                                        const categoryColor = getCategoryColor(transaction.categoria_info?.id || 0);

                                        return (
                                            <div
                                                key={transaction.id}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    padding: '1rem 1.5rem',
                                                    borderBottom: index < groupTransactions.length - 1 ? `1px solid ${THEME.border}` : 'none',
                                                    transition: 'background 0.15s ease',
                                                    cursor: 'default'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = THEME.surfaceHover;
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = 'transparent';
                                                }}
                                            >
                                                {/* Category Icon */}
                                                <div style={{
                                                    width: '44px',
                                                    height: '44px',
                                                    borderRadius: '12px',
                                                    background: activeTab === 'gastos'
                                                        ? `${categoryColor}15`
                                                        : THEME.emeraldGlow,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    marginRight: '1rem',
                                                    flexShrink: 0
                                                }}>
                                                    {activeTab === 'gastos' ? (
                                                        <CategoryIcon size={20} color={categoryColor} />
                                                    ) : (
                                                        <TrendingUp size={20} color={THEME.emerald} />
                                                    )}
                                                </div>

                                                {/* Transaction Info */}
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{
                                                        fontWeight: '600',
                                                        color: THEME.text,
                                                        fontSize: '0.938rem',
                                                        marginBottom: '0.25rem',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis'
                                                    }}>
                                                        {capitalize(transaction.descripcion) || 'Sin descripción'}
                                                    </div>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.75rem',
                                                        flexWrap: 'wrap'
                                                    }}>
                                                        {activeTab === 'gastos' && transaction.categoria_info && (
                                                            <span style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.25rem',
                                                                fontSize: '0.75rem',
                                                                color: THEME.textMuted
                                                            }}>
                                                                <Tag size={12} />
                                                                {transaction.categoria_info.nombre}
                                                            </span>
                                                        )}
                                                        {transaction.es_recurrente && (
                                                            <span style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.25rem',
                                                                padding: '0.125rem 0.5rem',
                                                                background: THEME.blueGlow,
                                                                borderRadius: '6px',
                                                                fontSize: '0.688rem',
                                                                fontWeight: '600',
                                                                color: THEME.blue
                                                            }}>
                                                                <Repeat size={10} />
                                                                Recurrente
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Amount */}
                                                <div style={{
                                                    textAlign: 'right',
                                                    marginRight: '1rem'
                                                }}>
                                                    <span style={{
                                                        fontSize: '1.125rem',
                                                        fontWeight: '700',
                                                        fontFamily: 'ui-monospace, monospace',
                                                        color: activeTab === 'gastos' ? THEME.coral : THEME.emerald
                                                    }}>
                                                        {activeTab === 'gastos' ? '-' : '+'}{formatCurrency(transaction.monto)}
                                                    </span>
                                                </div>

                                                {/* Actions Menu */}
                                                <div style={{ position: 'relative' }} ref={openMenuId === transaction.id ? menuRef : null}>
                                                    <button
                                                        onClick={() => setOpenMenuId(openMenuId === transaction.id ? null : transaction.id)}
                                                        style={{
                                                            width: '36px',
                                                            height: '36px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            background: openMenuId === transaction.id ? THEME.surfaceLight : 'transparent',
                                                            border: 'none',
                                                            borderRadius: '10px',
                                                            cursor: 'pointer',
                                                            color: THEME.textMuted,
                                                            transition: 'all 0.15s ease'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            if (openMenuId !== transaction.id) {
                                                                e.currentTarget.style.background = THEME.surfaceLight;
                                                            }
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            if (openMenuId !== transaction.id) {
                                                                e.currentTarget.style.background = 'transparent';
                                                            }
                                                        }}
                                                    >
                                                        <MoreHorizontal size={18} />
                                                    </button>

                                                    {/* Dropdown Menu */}
                                                    {openMenuId === transaction.id && (
                                                        <div style={{
                                                            position: 'absolute',
                                                            top: '100%',
                                                            right: 0,
                                                            marginTop: '0.5rem',
                                                            background: THEME.surface,
                                                            border: `1px solid ${THEME.border}`,
                                                            borderRadius: '12px',
                                                            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                                                            minWidth: '160px',
                                                            zIndex: 1000,
                                                            overflow: 'hidden'
                                                        }}>
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
                                                            <button
                                                                onClick={() => {
                                                                    toast('Función de duplicar próximamente');
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
                                                                <Copy size={16} color={THEME.textMuted} />
                                                                Duplicar
                                                            </button>
                                                            <div style={{ height: '1px', background: THEME.border }} />
                                                            <button
                                                                onClick={() => handleDelete(transaction.id)}
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
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {!loading && filteredTransactions.length > 0 && pagination.totalPages > 1 && (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '1.5rem',
                            borderTop: `1px solid ${THEME.border}`
                        }}>
                            <button
                                onClick={() => handlePageChange(1)}
                                disabled={pagination.currentPage === 1}
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: THEME.surfaceLight,
                                    border: `1px solid ${THEME.border}`,
                                    borderRadius: '10px',
                                    color: pagination.currentPage === 1 ? THEME.textMuted : THEME.text,
                                    cursor: pagination.currentPage === 1 ? 'not-allowed' : 'pointer',
                                    opacity: pagination.currentPage === 1 ? 0.5 : 1
                                }}
                            >
                                <ChevronsLeft size={16} />
                            </button>

                            <button
                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                disabled={!pagination.previous}
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: THEME.surfaceLight,
                                    border: `1px solid ${THEME.border}`,
                                    borderRadius: '10px',
                                    color: !pagination.previous ? THEME.textMuted : THEME.text,
                                    cursor: !pagination.previous ? 'not-allowed' : 'pointer',
                                    opacity: !pagination.previous ? 0.5 : 1
                                }}
                            >
                                <ChevronLeft size={16} />
                            </button>

                            <div style={{
                                display: 'flex',
                                gap: '0.25rem'
                            }}>
                                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (pagination.totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (pagination.currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (pagination.currentPage >= pagination.totalPages - 2) {
                                        pageNum = pagination.totalPages - 4 + i;
                                    } else {
                                        pageNum = pagination.currentPage - 2 + i;
                                    }

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            style={{
                                                width: '36px',
                                                height: '36px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: pagination.currentPage === pageNum
                                                    ? `linear-gradient(135deg, ${THEME.blue} 0%, ${THEME.purple} 100%)`
                                                    : THEME.surfaceLight,
                                                border: `1px solid ${pagination.currentPage === pageNum ? 'transparent' : THEME.border}`,
                                                borderRadius: '10px',
                                                color: pagination.currentPage === pageNum ? '#FFFFFF' : THEME.text,
                                                fontSize: '0.875rem',
                                                fontWeight: pagination.currentPage === pageNum ? '600' : '500',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                                disabled={!pagination.next}
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: THEME.surfaceLight,
                                    border: `1px solid ${THEME.border}`,
                                    borderRadius: '10px',
                                    color: !pagination.next ? THEME.textMuted : THEME.text,
                                    cursor: !pagination.next ? 'not-allowed' : 'pointer',
                                    opacity: !pagination.next ? 0.5 : 1
                                }}
                            >
                                <ChevronRight size={16} />
                            </button>

                            <button
                                onClick={() => handlePageChange(pagination.totalPages)}
                                disabled={pagination.currentPage === pagination.totalPages}
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: THEME.surfaceLight,
                                    border: `1px solid ${THEME.border}`,
                                    borderRadius: '10px',
                                    color: pagination.currentPage === pagination.totalPages ? THEME.textMuted : THEME.text,
                                    cursor: pagination.currentPage === pagination.totalPages ? 'not-allowed' : 'pointer',
                                    opacity: pagination.currentPage === pagination.totalPages ? 0.5 : 1
                                }}
                            >
                                <ChevronsRight size={16} />
                            </button>

                            <span style={{
                                marginLeft: '1rem',
                                padding: '0.5rem 1rem',
                                background: THEME.surfaceLight,
                                borderRadius: '8px',
                                fontSize: '0.813rem',
                                color: THEME.textSecondary
                            }}>
                                Página {pagination.currentPage} de {pagination.totalPages}
                            </span>
                        </div>
                    )}
                </div>
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
        select option {
          background: ${THEME.surface};
          color: ${THEME.text};
        }
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: ${isDarkMode ? 'invert(1)' : 'none'};
        }
      `}</style>
        </div>
    );
};

export default TransactionsPremium;
