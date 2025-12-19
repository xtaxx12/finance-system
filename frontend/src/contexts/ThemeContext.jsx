import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe ser usado dentro de ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    
    // Aplicar clase al body para estilos globales
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Definir paleta de colores para ambos temas
  const theme = {
    isDarkMode,
    colors: {
      // Colores principales
      primary: isDarkMode ? '#3B82F6' : '#2563EB',
      primaryHover: isDarkMode ? '#2563EB' : '#1D4ED8',
      secondary: isDarkMode ? '#6B7280' : '#4B5563',
      
      // Backgrounds
      background: isDarkMode ? '#0F172A' : '#F8FAFC',
      surface: isDarkMode ? '#1E293B' : '#FFFFFF',
      surfaceHover: isDarkMode ? '#334155' : '#F1F5F9',
      
      // Textos
      textPrimary: isDarkMode ? '#F1F5F9' : '#1E293B',
      textSecondary: isDarkMode ? '#94A3B8' : '#64748B',
      textMuted: isDarkMode ? '#64748B' : '#94A3B8',
      
      // Estados financieros
      income: isDarkMode ? '#10B981' : '#059669',
      expense: isDarkMode ? '#EF4444' : '#DC2626',
      balance: isDarkMode ? '#3B82F6' : '#2563EB',
      
      // Estados de presupuesto
      budgetHealthy: isDarkMode ? '#10B981' : '#059669',
      budgetModerate: isDarkMode ? '#F59E0B' : '#D97706',
      budgetWarning: isDarkMode ? '#F97316' : '#EA580C',
      budgetDanger: isDarkMode ? '#EF4444' : '#DC2626',
      
      // Bordes y divisores
      border: isDarkMode ? '#334155' : '#E2E8F0',
      borderLight: isDarkMode ? '#475569' : '#CBD5E1',
      
      // Sombras
      shadow: isDarkMode 
        ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)' 
        : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      shadowLg: isDarkMode
        ? '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)'
        : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      
      // Gradientes
      gradientPrimary: isDarkMode
        ? 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)'
        : 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)',
      gradientIncome: isDarkMode
        ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
        : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
      gradientExpense: isDarkMode
        ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
        : 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
    },
    
    // Espaciado y tamaños
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
    },
    
    // Bordes redondeados
    borderRadius: {
      sm: '0.375rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
      full: '9999px',
    },
    
    // Tipografía
    typography: {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
    },
  };

  return (
    <ThemeContext.Provider value={{ ...theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};