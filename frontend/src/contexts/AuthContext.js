import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Primero obtener el token CSRF
      await api.get('/auth/profile/');
      const response = await api.get('/auth/profile/');
      setUser(response.data);
    } catch (error) {
      // Si falla, intentar obtener solo el token CSRF
      try {
        await fetch('http://localhost:8000/api/auth/profile/', {
          credentials: 'include'
        });
      } catch (csrfError) {
        // Error silenciado al obtener CSRF token
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const checkAuthStatus = async () => {
    try {
      const response = await api.get('/auth/profile/');
      setUser(response.data);
    } catch (error) {
      setUser(null);
    }
  };

  const login = async (credentials) => {
    // Primero obtener el token CSRF
    try {
      await api.get('/auth/csrf/');
    } catch (error) {
      console.log('Error obteniendo CSRF token, continuando...');
    }
    
    // Luego hacer login
    const response = await api.post('/auth/login/', credentials);
    setUser(response.data.user);
    return response.data;
  };

  const register = async (userData) => {
    const response = await api.post('/auth/register/', userData);
    setUser(response.data.user);
    return response.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout/');
    } catch (error) {
      // Error silenciado al cerrar sesión
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};