import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import NotificationBell from './NotificationBell';
import ThemeToggle from './ThemeToggle';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Sesión cerrada exitosamente');
      navigate('/login');
    } catch (error) {
      toast.error('Error al cerrar sesión');
    }
  };

  const navStyle = {
    background: isDarkMode 
      ? 'linear-gradient(135deg, #1E293B 0%, #334155 100%)'
      : 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
    padding: '1rem 0',
    marginBottom: '2rem',
    boxShadow: colors.shadowLg,
    borderBottom: `1px solid ${colors.border}`,
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
    color: 'white',
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
    gap: '0.5rem',
    alignItems: 'center'
  };

  const linkStyle = {
    color: 'rgba(255, 255, 255, 0.9)',
    textDecoration: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '0.75rem',
    transition: 'all 0.2s ease',
    fontSize: '0.875rem',
    fontWeight: '500',
    position: 'relative',
    overflow: 'hidden'
  };

  const activeLinkStyle = {
    ...linkStyle,
    background: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    backdropFilter: 'blur(10px)'
  };

  const userInfoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    color: 'white',
    fontSize: '0.875rem',
    fontWeight: '500',
    background: 'rgba(255, 255, 255, 0.1)',
    padding: '0.5rem 1rem',
    borderRadius: '0.75rem',
    backdropFilter: 'blur(10px)'
  };

  const logoutButtonStyle = {
    background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '0.75rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  };

  return (
    <nav style={navStyle}>
      <div style={navContainerStyle}>
        <Link 
          to="/" 
          style={logoStyle}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          <span style={{ fontSize: '1.75rem' }}>💰</span>
          Finanzas Personales
        </Link>
        
        <div style={navLinksStyle}>
          {user ? (
            <>
              <Link 
                to="/" 
                style={window.location.pathname === '/' ? activeLinkStyle : linkStyle}
                onMouseEnter={(e) => {
                  if (window.location.pathname !== '/') {
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (window.location.pathname !== '/') {
                    e.target.style.background = 'transparent';
                  }
                }}
              >
                📊 Dashboard
              </Link>
              <Link 
                to="/transactions" 
                style={window.location.pathname === '/transactions' ? activeLinkStyle : linkStyle}
                onMouseEnter={(e) => {
                  if (window.location.pathname !== '/transactions') {
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (window.location.pathname !== '/transactions') {
                    e.target.style.background = 'transparent';
                  }
                }}
              >
                💳 Transacciones
              </Link>
              <Link 
                to="/goals" 
                style={window.location.pathname === '/goals' ? activeLinkStyle : linkStyle}
                onMouseEnter={(e) => {
                  if (window.location.pathname !== '/goals') {
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (window.location.pathname !== '/goals') {
                    e.target.style.background = 'transparent';
                  }
                }}
              >
                🎯 Metas
              </Link>
              <Link 
                to="/budgets" 
                style={window.location.pathname === '/budgets' ? activeLinkStyle : linkStyle}
                onMouseEnter={(e) => {
                  if (window.location.pathname !== '/budgets') {
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (window.location.pathname !== '/budgets') {
                    e.target.style.background = 'transparent';
                  }
                }}
              >
                💰 Presupuestos
              </Link>
              
              <div style={{ height: '24px', width: '1px', background: 'rgba(255, 255, 255, 0.2)', margin: '0 0.5rem' }} />
              
              <NotificationBell />
              <ThemeToggle />
              
              <div style={userInfoStyle}>
                <span style={{ fontSize: '1.25rem' }}>👤</span>
                Hola, {user.first_name || user.username}
              </div>
              
              <button 
                onClick={handleLogout}
                style={logoutButtonStyle}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                }}
              >
                🚪 Salir
              </button>
            </>
          ) : (
            <>
              <ThemeToggle />
              <Link to="/login" style={linkStyle}>Iniciar Sesión</Link>
              <Link to="/register" style={linkStyle}>Registrarse</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;