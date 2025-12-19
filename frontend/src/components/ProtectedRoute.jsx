import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const { colors } = useTheme();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem',
        background: colors.background
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: `4px solid ${colors.border}`,
          borderTop: `4px solid ${colors.primary}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ 
          color: colors.textSecondary, 
          fontSize: '1.125rem',
          margin: 0
        }}>
          Cargando aplicación...
        </p>
      </div>
    );
  }

  return user ? children : <Navigate to="/welcome" />;
};

export default ProtectedRoute;