import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUnreadCount();
    fetchRecentNotifications();
    
    // Verificar notificaciones cada 5 minutos
    const interval = setInterval(() => {
      fetchUnreadCount();
      fetchRecentNotifications();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/notifications/notifications/unread_count/');
      setUnreadCount(response.data.unread_count);
    } catch (error) {
      // Error silenciado
    }
  };

  const fetchRecentNotifications = async () => {
    try {
      const response = await api.get('/notifications/notifications/recent/');
      setNotifications(response.data);
    } catch (error) {
      // Error silenciado
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.post(`/notifications/notifications/${notificationId}/mark_read/`);
      fetchUnreadCount();
      fetchRecentNotifications();
    } catch (error) {
      // Error silenciado
    }
  };

  const markAllAsRead = async () => {
    setLoading(true);
    try {
      await api.post('/notifications/notifications/mark_all_read/');
      setUnreadCount(0);
      fetchRecentNotifications();
      toast.success('Todas las notificaciones marcadas como leídas');
    } catch (error) {
      toast.error('Error al marcar notificaciones como leídas');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'goal_completed': return '🎉';
      case 'goal_deadline': return '⏰';
      case 'goal_overdue': return '📅';
      case 'savings_reminder': return '💰';
      case 'milestone_reached': return '🎯';
      default: return '📢';
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Campana de notificaciones */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          fontSize: '20px',
          cursor: 'pointer',
          position: 'relative',
          padding: '8px'
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '0',
            right: '0',
            backgroundColor: '#dc3545',
            color: 'white',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold'
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown de notificaciones */}
      {showDropdown && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: '0',
          backgroundColor: 'white',
          border: '1px solid #ddd',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          width: '350px',
          maxHeight: '400px',
          overflowY: 'auto',
          zIndex: 1000
        }}>
          {/* Header */}
          <div style={{
            padding: '15px',
            borderBottom: '1px solid #eee',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h4 style={{ margin: 0, color: '#333' }}>Notificaciones</h4>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                disabled={loading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#007bff',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                {loading ? 'Marcando...' : 'Marcar todas como leídas'}
              </button>
            )}
          </div>

          {/* Lista de notificaciones */}
          <div>
            {notifications.length === 0 ? (
              <div style={{
                padding: '20px',
                textAlign: 'center',
                color: '#666'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>📭</div>
                <p>No tienes notificaciones</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  onClick={() => !notification.leida && markAsRead(notification.id)}
                  style={{
                    padding: '12px 15px',
                    borderBottom: '1px solid #f0f0f0',
                    cursor: notification.leida ? 'default' : 'pointer',
                    backgroundColor: notification.leida ? 'white' : '#f8f9ff',
                    borderLeft: `4px solid ${getPriorityColor(notification.prioridad)}`,
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px'
                  }}>
                    <span style={{ fontSize: '20px', flexShrink: 0 }}>
                      {getNotificationIcon(notification.tipo)}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontWeight: notification.leida ? 'normal' : 'bold',
                        color: '#333',
                        fontSize: '14px',
                        marginBottom: '4px'
                      }}>
                        {notification.titulo}
                      </div>
                      <div style={{
                        color: '#666',
                        fontSize: '13px',
                        lineHeight: '1.4',
                        marginBottom: '4px'
                      }}>
                        {notification.mensaje}
                      </div>
                      <div style={{
                        color: '#999',
                        fontSize: '11px'
                      }}>
                        {notification.tiempo_transcurrido}
                      </div>
                    </div>
                    {!notification.leida && (
                      <div style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#007bff',
                        borderRadius: '50%',
                        flexShrink: 0,
                        marginTop: '4px'
                      }} />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div style={{
              padding: '10px 15px',
              borderTop: '1px solid #eee',
              textAlign: 'center'
            }}>
              <button
                onClick={() => setShowDropdown(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#007bff',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      )}

      {/* Overlay para cerrar dropdown */}
      {showDropdown && (
        <div
          onClick={() => setShowDropdown(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
        />
      )}
    </div>
  );
};

export default NotificationBell;