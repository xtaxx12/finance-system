import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const Welcome = () => {
  const { colors } = useTheme();

  const containerStyle = {
    minHeight: '100vh',
    background: `linear-gradient(135deg, ${colors.primary}10 0%, ${colors.background} 50%, ${colors.primary}05 100%)`,
    display: 'flex',
    flexDirection: 'column',
    paddingTop: '80px' // Espacio para el navbar fijo
  };

  const heroStyle = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    textAlign: 'center'
  };

  const contentStyle = {
    maxWidth: '800px',
    margin: '0 auto'
  };

  const titleStyle = {
    fontSize: window.innerWidth <= 768 ? '2.5rem' : '3.5rem',
    fontWeight: '800',
    background: colors.gradientPrimary,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '1rem',
    lineHeight: '1.2'
  };

  const subtitleStyle = {
    fontSize: window.innerWidth <= 768 ? '1.125rem' : '1.25rem',
    color: colors.textSecondary,
    marginBottom: '3rem',
    lineHeight: '1.6'
  };

  const buttonContainerStyle = {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: '4rem'
  };

  const primaryButtonStyle = {
    padding: '1rem 2rem',
    borderRadius: '0.75rem',
    border: 'none',
    background: colors.gradientPrimary,
    color: 'white',
    fontSize: '1.125rem',
    fontWeight: '600',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.3s ease',
    boxShadow: colors.shadowMd
  };

  const secondaryButtonStyle = {
    padding: '1rem 2rem',
    borderRadius: '0.75rem',
    border: `2px solid ${colors.primary}`,
    background: 'transparent',
    color: colors.primary,
    fontSize: '1.125rem',
    fontWeight: '600',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.3s ease'
  };

  const featuresStyle = {
    display: 'grid',
    gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(3, 1fr)',
    gap: '2rem',
    marginTop: '2rem'
  };

  const featureCardStyle = {
    background: colors.surface,
    padding: '2rem',
    borderRadius: '1rem',
    border: `1px solid ${colors.border}`,
    boxShadow: colors.shadowMd,
    textAlign: 'center',
    transition: 'all 0.3s ease'
  };

  const features = [
    {
      icon: '📊',
      title: 'Dashboard Inteligente',
      description: 'Visualiza tus finanzas con gráficas interactivas y métricas en tiempo real'
    },
    {
      icon: '🏦',
      title: 'Gestión de Préstamos',
      description: 'Controla tus deudas y pagos con seguimiento automático del progreso'
    },
    {
      icon: '🎯',
      title: 'Metas de Ahorro',
      description: 'Establece objetivos financieros y recibe recomendaciones personalizadas'
    }
  ];

  return (
    <div style={containerStyle}>
      <div style={heroStyle}>
        <div style={contentStyle} className="animate-fade-in">
          <h1 style={titleStyle}>
            Controla tus Finanzas Personales
          </h1>
          
          <p style={subtitleStyle}>
            La aplicación completa para gestionar ingresos, gastos, préstamos y metas de ahorro. 
            Toma el control de tu futuro financiero con herramientas inteligentes y visualizaciones claras.
          </p>

          <div style={buttonContainerStyle}>
            <Link 
              to="/register" 
              style={primaryButtonStyle}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = colors.shadowLg;
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = colors.shadowMd;
              }}
            >
              <span>🚀</span>
              Comenzar Gratis
            </Link>
            
            <Link 
              to="/login" 
              style={secondaryButtonStyle}
              onMouseEnter={(e) => {
                e.target.style.background = colors.primary;
                e.target.style.color = 'white';
                e.target.style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = colors.primary;
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <span>🔐</span>
              Iniciar Sesión
            </Link>
          </div>

          <div style={featuresStyle}>
            {features.map((feature, index) => (
              <div 
                key={index} 
                style={featureCardStyle}
                className="animate-slide-in"
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-5px)';
                  e.target.style.boxShadow = colors.shadowLg;
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = colors.shadowMd;
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                  {feature.icon}
                </div>
                <h3 style={{ 
                  color: colors.textPrimary, 
                  marginBottom: '1rem',
                  fontSize: '1.25rem',
                  fontWeight: '600'
                }}>
                  {feature.title}
                </h3>
                <p style={{ 
                  color: colors.textSecondary, 
                  lineHeight: '1.5',
                  margin: 0
                }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer style={{
        padding: '2rem',
        textAlign: 'center',
        borderTop: `1px solid ${colors.border}`,
        background: colors.surface
      }}>
        <p style={{ color: colors.textSecondary, margin: 0 }}>
          © 2024 Sistema de Finanzas Personales - Desarrollado con ❤️
        </p>
      </footer>
    </div>
  );
};

export default Welcome;