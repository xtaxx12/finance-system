import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';

const PublicNavbar = () => {
  const { colors, isDarkMode } = useTheme();
  const location = useLocation();

  // Solo mostrar en páginas públicas
  const publicPages = ['/welcome', '/login', '/register'];
  const isPublicPage = publicPages.includes(location.pathname);

  if (!isPublicPage) {
    return null;
  }

  const navStyle = {
    background: isDarkMode 
      ? 'rgba(30, 41, 59, 0.95)'
      : 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    padding: '1rem 0',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    borderBottom: `1px solid ${colors.border}`,
    boxShadow: colors.shadowMd
  };

  const navContainerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 1.5rem'
  };

  const logoStyle = {
    color: colors.textPrimary,
    fontSize: '1.5rem',
    fontWeight: '700',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'transform 0.2s ease'
  };

  const navLinksStyle = {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center'
  };

  const linkStyle = {
    color: colors.textSecondary,
    textDecoration: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    transition: 'all 0.2s ease',
    fontSize: '0.875rem',
    fontWeight: '500'
  };

  const activeLinkStyle = {
    ...linkStyle,
    color: colors.primary,
    background: `${colors.primary}10`
  };

  return (
    <nav style={navStyle}>
      <div style={navContainerStyle}>
        <Link 
          to="/welcome" 
          style={logoStyle}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          <span style={{ fontSize: '1.75rem' }}>💰</span>
          Finanzas Personales
        </Link>
        
        <div style={navLinksStyle}>
          <ThemeToggle />
          
          {location.pathname !== '/login' && (
            <Link 
              to="/login" 
              style={location.pathname === '/login' ? activeLinkStyle : linkStyle}
              onMouseEnter={(e) => {
                if (location.pathname !== '/login') {
                  e.target.style.background = `${colors.primary}10`;
                  e.target.style.color = colors.primary;
                }
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== '/login') {
                  e.target.style.background = 'transparent';
                  e.target.style.color = colors.textSecondary;
                }
              }}
            >
              🔐 Iniciar Sesión
            </Link>
          )}
          
          {location.pathname !== '/register' && (
            <Link 
              to="/register" 
              style={{
                ...linkStyle,
                background: colors.gradientPrimary,
                color: 'white',
                fontWeight: '600'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = colors.shadowMd;
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              🚀 Registrarse
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default PublicNavbar;