import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { colors } = useTheme();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData);
      toast.success('¡Bienvenido!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.non_field_errors?.[0] || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: `linear-gradient(135deg, ${colors.primary}20 0%, ${colors.background} 100%)`,
    padding: '1rem'
  };

  const cardStyle = {
    background: colors.surface,
    borderRadius: '1.5rem',
    padding: '3rem',
    boxShadow: colors.shadowLg,
    border: `1px solid ${colors.border}`,
    width: '100%',
    maxWidth: '450px',
    position: 'relative',
    overflow: 'hidden'
  };

  const titleStyle = {
    fontSize: '2rem',
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: '2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem'
  };

  const inputStyle = {
    width: '100%',
    padding: '0.875rem 1rem',
    borderRadius: '0.75rem',
    border: `2px solid ${colors.border}`,
    background: colors.background,
    color: colors.textPrimary,
    fontSize: '1rem',
    transition: 'all 0.2s ease',
    marginBottom: '1.5rem'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '600',
    color: colors.textPrimary,
    fontSize: '0.875rem'
  };

  const buttonStyle = {
    width: '100%',
    padding: '0.875rem',
    borderRadius: '0.75rem',
    border: 'none',
    background: colors.gradientPrimary,
    color: 'white',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    marginBottom: '1.5rem',
    opacity: loading ? 0.7 : 1
  };

  const linkStyle = {
    color: colors.primary,
    textDecoration: 'none',
    fontWeight: '600'
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle} className="animate-fade-in">
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: colors.gradientPrimary
        }} />
        
        <h2 style={titleStyle}>
          <span style={{ fontSize: '1.5rem' }}>🔐</span>
          Iniciar Sesión
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div>
            <label style={labelStyle}>Usuario</label>
            <input
              type="text"
              name="username"
              style={inputStyle}
              value={formData.username}
              onChange={handleChange}
              placeholder="Ingresa tu usuario"
              required
              onFocus={(e) => e.target.style.borderColor = colors.primary}
              onBlur={(e) => e.target.style.borderColor = colors.border}
            />
          </div>

          <div>
            <label style={labelStyle}>Contraseña</label>
            <input
              type="password"
              name="password"
              style={inputStyle}
              value={formData.password}
              onChange={handleChange}
              placeholder="Ingresa tu contraseña"
              required
              onFocus={(e) => e.target.style.borderColor = colors.primary}
              onBlur={(e) => e.target.style.borderColor = colors.border}
            />
          </div>

          <button 
            type="submit" 
            style={buttonStyle}
            disabled={loading}
            onMouseEnter={(e) => !loading && (e.target.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => !loading && (e.target.style.transform = 'translateY(0)')}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Iniciando sesión...
              </span>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <p style={{ color: colors.textSecondary, margin: 0 }}>
            ¿No tienes cuenta?{' '}
            <Link 
              to="/register" 
              style={linkStyle}
              onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
            >
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;