import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout } = useAuth();
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
    backgroundColor: '#343a40',
    padding: '1rem 0',
    marginBottom: '20px'
  };

  const navContainerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px'
  };

  const logoStyle = {
    color: 'white',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    textDecoration: 'none'
  };

  const navLinksStyle = {
    display: 'flex',
    gap: '20px',
    alignItems: 'center'
  };

  const linkStyle = {
    color: 'white',
    textDecoration: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    transition: 'background-color 0.3s'
  };

  return (
    <nav style={navStyle}>
      <div style={navContainerStyle}>
        <Link to="/" style={logoStyle}>
          💰 Finanzas Personales
        </Link>
        
        <div style={navLinksStyle}>
          {user ? (
            <>
              <Link to="/" style={linkStyle}>Dashboard</Link>
              <Link to="/transactions" style={linkStyle}>Transacciones</Link>
              <Link to="/goals" style={linkStyle}>Metas</Link>
              <span style={{ color: 'white', marginLeft: '20px' }}>
                Hola, {user.first_name || user.username}
              </span>
              <button 
                onClick={handleLogout}
                style={{
                  ...linkStyle,
                  background: '#dc3545',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>
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