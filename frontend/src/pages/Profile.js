import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const Profile = () => {
  const { colors } = useTheme();
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Estado para perfil
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: ''
  });
  
  // Estado para cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || ''
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.put('/auth/profile/update/', profileData);
      updateUser(response.data.user);
      toast.success('Perfil actualizado exitosamente');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (passwordData.new_password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/profile/change-password/', {
        old_password: passwordData.old_password,
        new_password: passwordData.new_password
      });
      
      toast.success('Contraseña cambiada exitosamente');
      setPasswordData({
        old_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al cambiar contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in">
      <div style={{
        marginBottom: '2rem'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          color: colors.textPrimary,
          marginBottom: '0.5rem',
        }}>
          👤 Mi Perfil
        </h1>
        <p style={{
          color: colors.textSecondary,
          fontSize: '1.125rem',
          margin: 0
        }}>
          Administra tu información personal y seguridad
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        borderBottom: `2px solid ${colors.border}`
      }}>
        <button
          onClick={() => setActiveTab('profile')}
          style={{
            padding: '1rem 2rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'profile' ? `3px solid ${colors.primary}` : 'none',
            color: activeTab === 'profile' ? colors.primary : colors.textSecondary,
            fontWeight: activeTab === 'profile' ? '600' : '400',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            marginBottom: '-2px'
          }}
        >
          📝 Información Personal
        </button>
        <button
          onClick={() => setActiveTab('password')}
          style={{
            padding: '1rem 2rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'password' ? `3px solid ${colors.primary}` : 'none',
            color: activeTab === 'password' ? colors.primary : colors.textSecondary,
            fontWeight: activeTab === 'password' ? '600' : '400',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            marginBottom: '-2px'
          }}
        >
          🔒 Cambiar Contraseña
        </button>
      </div>

      {/* Contenido de tabs */}
      {activeTab === 'profile' && (
        <div className="modern-card animate-fade-in">
          <div className="modern-card-header">
            <div className="modern-card-title">
              <span>📝</span>
              Información Personal
            </div>
            <div className="modern-card-subtitle">
              Actualiza tu información de perfil
            </div>
          </div>

          <form onSubmit={handleUpdateProfile}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  color: colors.textPrimary
                }}>
                  Nombre de usuario
                </label>
                <input
                  type="text"
                  name="username"
                  value={profileData.username}
                  onChange={handleProfileChange}
                  disabled
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: `1px solid ${colors.border}`,
                    background: colors.surfaceHover,
                    color: colors.textSecondary,
                    fontSize: '1rem',
                    cursor: 'not-allowed'
                  }}
                />
                <small style={{ color: colors.textMuted, fontSize: '0.875rem' }}>
                  El nombre de usuario no se puede cambiar
                </small>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  color: colors.textPrimary
                }}>
                  Correo electrónico
                </label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: `1px solid ${colors.border}`,
                    background: colors.surface,
                    color: colors.textPrimary,
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  color: colors.textPrimary
                }}>
                  Nombre
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={profileData.first_name}
                  onChange={handleProfileChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: `1px solid ${colors.border}`,
                    background: colors.surface,
                    color: colors.textPrimary,
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  color: colors.textPrimary
                }}>
                  Apellido
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={profileData.last_name}
                  onChange={handleProfileChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: `1px solid ${colors.border}`,
                    background: colors.surface,
                    color: colors.textPrimary,
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="modern-button"
              style={{
                background: colors.primary,
                color: 'white',
                padding: '0.75rem 2rem',
                borderRadius: '0.5rem',
                border: 'none',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Guardando...' : '💾 Guardar Cambios'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'password' && (
        <div className="modern-card animate-fade-in">
          <div className="modern-card-header">
            <div className="modern-card-title">
              <span>🔒</span>
              Cambiar Contraseña
            </div>
            <div className="modern-card-subtitle">
              Actualiza tu contraseña para mantener tu cuenta segura
            </div>
          </div>

          <form onSubmit={handleChangePassword}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              maxWidth: '500px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  color: colors.textPrimary
                }}>
                  Contraseña actual
                </label>
                <input
                  type="password"
                  name="old_password"
                  value={passwordData.old_password}
                  onChange={handlePasswordChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: `1px solid ${colors.border}`,
                    background: colors.surface,
                    color: colors.textPrimary,
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  color: colors.textPrimary
                }}>
                  Nueva contraseña
                </label>
                <input
                  type="password"
                  name="new_password"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  required
                  minLength={8}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: `1px solid ${colors.border}`,
                    background: colors.surface,
                    color: colors.textPrimary,
                    fontSize: '1rem'
                  }}
                />
                <small style={{ color: colors.textMuted, fontSize: '0.875rem' }}>
                  Mínimo 8 caracteres
                </small>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  color: colors.textPrimary
                }}>
                  Confirmar nueva contraseña
                </label>
                <input
                  type="password"
                  name="confirm_password"
                  value={passwordData.confirm_password}
                  onChange={handlePasswordChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: `1px solid ${colors.border}`,
                    background: colors.surface,
                    color: colors.textPrimary,
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{
                padding: '1rem',
                background: 'linear-gradient(135deg, #3B82F620 0%, #1E40AF20 100%)',
                borderRadius: '0.75rem',
                border: `1px solid ${colors.primary}30`
              }}>
                <div style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>💡</div>
                <div style={{ color: colors.textPrimary, fontWeight: '500', marginBottom: '0.25rem' }}>
                  Consejos para una contraseña segura:
                </div>
                <ul style={{ 
                  color: colors.textSecondary, 
                  fontSize: '0.875rem',
                  margin: '0.5rem 0 0 1.25rem',
                  lineHeight: '1.6'
                }}>
                  <li>Usa al menos 8 caracteres</li>
                  <li>Combina letras mayúsculas y minúsculas</li>
                  <li>Incluye números y símbolos</li>
                  <li>No uses información personal</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="modern-button"
                style={{
                  background: colors.primary,
                  color: 'white',
                  padding: '0.75rem 2rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? 'Cambiando...' : '🔐 Cambiar Contraseña'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;
