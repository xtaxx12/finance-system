import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useBalance } from '../contexts/BalanceContext';
import { loansApi } from '../services/loansApi';
import toast from 'react-hot-toast';

const Loans = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { updateBalance } = useBalance();
  const [loans, setLoans] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(null);
  const [newLoan, setNewLoan] = useState({
    name: '',
    amount: '',
    installments: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });
  const [payment, setPayment] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  const containerStyle = {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 1rem',
    '@media (min-width: 768px)': {
      padding: '0 1.5rem'
    }
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '3rem'
  };

  const titleStyle = {
    fontSize: window.innerWidth <= 768 ? '2rem' : '2.5rem',
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: '0.5rem'
  };

  const subtitleStyle = {
    color: colors.textSecondary,
    fontSize: '1.125rem',
    margin: 0
  };

  const addButtonStyle = {
    background: colors.gradientPrimary,
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.75rem',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    marginBottom: '2rem',
    boxShadow: colors.shadowMd,
    transition: 'all 0.2s ease'
  };

  const cardStyle = {
    background: colors.surface,
    borderRadius: '1rem',
    padding: '1.5rem',
    marginBottom: '1rem',
    boxShadow: colors.shadowMd,
    border: `1px solid ${colors.border}`
  };

  const formStyle = {
    background: colors.surface,
    borderRadius: '1rem',
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: colors.shadowLg,
    border: `1px solid ${colors.border}`
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '0.5rem',
    border: `1px solid ${colors.border}`,
    background: colors.background,
    color: colors.textPrimary,
    fontSize: '1rem',
    marginBottom: '1rem'
  };

  const buttonStyle = {
    background: colors.gradientPrimary,
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    marginRight: '0.5rem'
  };

  const cancelButtonStyle = {
    ...buttonStyle,
    background: colors.textSecondary
  };

  const payButtonStyle = {
    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '600',
    marginLeft: '0.5rem'
  };

  const deleteButtonStyle = {
    background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '600',
    marginLeft: '0.5rem'
  };

  // Cargar préstamos de la API
  useEffect(() => {
    if (user) {
      fetchLoans();
    }
  }, [user]);

  const fetchLoans = async () => {
    try {
      const response = await loansApi.getLoans();
      setLoans(response.data.results || response.data);
      updateBalance();
    } catch (error) {
      console.error('Error al cargar préstamos:', error);
      toast.error('Error al cargar los préstamos');
    }
  };

  const handleAddLoan = async (e) => {
    e.preventDefault();
    if (!newLoan.name || !newLoan.amount || !newLoan.installments) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      const loanData = {
        ...newLoan,
        amount: parseFloat(newLoan.amount),
        installments: parseInt(newLoan.installments)
      };

      await loansApi.createLoan(loanData);
      
      setNewLoan({
        name: '',
        amount: '',
        installments: '',
        date: new Date().toISOString().split('T')[0],
        description: ''
      });
      setShowAddForm(false);
      toast.success('Préstamo agregado exitosamente');
      fetchLoans(); // Recargar la lista
    } catch (error) {
      console.error('Error al crear préstamo:', error);
      toast.error('Error al crear el préstamo');
    }
  };

  const handlePayment = async (e, loanId) => {
    e.preventDefault();
    if (!payment.amount) {
      toast.error('Por favor ingresa el monto del pago');
      return;
    }

    try {
      const paymentData = {
        amount: parseFloat(payment.amount),
        date: payment.date
      };

      await loansApi.addPayment(loanId, paymentData);
      
      setPayment({ amount: '', date: new Date().toISOString().split('T')[0] });
      setShowPaymentForm(null);
      toast.success('Pago registrado exitosamente');
      fetchLoans(); // Recargar la lista
    } catch (error) {
      console.error('Error al registrar pago:', error);
      toast.error('Error al registrar el pago');
    }
  };

  const deleteLoan = async (loanId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este préstamo?')) {
      try {
        await loansApi.deleteLoan(loanId);
        toast.success('Préstamo eliminado');
        fetchLoans(); // Recargar la lista
      } catch (error) {
        console.error('Error al eliminar préstamo:', error);
        toast.error('Error al eliminar el préstamo');
      }
    }
  };

  const calculateProgress = (loan) => {
    return loan.progress_percentage || 0;
  };

  const calculateRemaining = (loan) => {
    return loan.remaining_amount || 0;
  };

  const calculateInstallmentAmount = (loan) => {
    return loan.installment_amount || 0;
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>
          🏦 Préstamos y Deudas
        </h1>
        <p style={subtitleStyle}>
          Gestiona tus préstamos y realiza seguimiento de tus pagos
        </p>
      </div>

      <button
        onClick={() => setShowAddForm(!showAddForm)}
        style={addButtonStyle}
        onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
        onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
      >
        ➕ Agregar Préstamo
      </button>

      {showAddForm && (
        <form onSubmit={handleAddLoan} style={formStyle}>
          <h3 style={{ color: colors.textPrimary, marginBottom: '1.5rem' }}>Nuevo Préstamo</h3>
          
          <input
            type="text"
            placeholder="Nombre del préstamo"
            value={newLoan.name}
            onChange={(e) => setNewLoan({ ...newLoan, name: e.target.value })}
            style={inputStyle}
            required
          />
          
          <input
            type="number"
            placeholder="Monto total"
            value={newLoan.amount}
            onChange={(e) => setNewLoan({ ...newLoan, amount: e.target.value })}
            style={inputStyle}
            step="0.01"
            required
          />
          
          <input
            type="number"
            placeholder="Número de cuotas"
            value={newLoan.installments}
            onChange={(e) => setNewLoan({ ...newLoan, installments: e.target.value })}
            style={inputStyle}
            required
          />
          
          <input
            type="date"
            value={newLoan.date}
            onChange={(e) => setNewLoan({ ...newLoan, date: e.target.value })}
            style={inputStyle}
          />
          
          <textarea
            placeholder="Descripción (opcional)"
            value={newLoan.description}
            onChange={(e) => setNewLoan({ ...newLoan, description: e.target.value })}
            style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
          />
          
          <div>
            <button type="submit" style={buttonStyle}>Agregar</button>
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)}
              style={cancelButtonStyle}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div style={{ display: 'grid', gap: '1rem' }}>
        {loans.length === 0 ? (
          <div style={{
            ...cardStyle,
            textAlign: 'center',
            padding: '3rem',
            color: colors.textSecondary
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏦</div>
            <h3>No tienes préstamos registrados</h3>
            <p>Agrega tu primer préstamo para comenzar a hacer seguimiento</p>
          </div>
        ) : (
          loans.map(loan => {
            const progress = calculateProgress(loan);
            const remaining = calculateRemaining(loan);
            const installmentAmount = calculateInstallmentAmount(loan);
            const isCompleted = loan.is_completed;

            return (
              <div key={loan.id} style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ color: colors.textPrimary, margin: '0 0 0.5rem 0' }}>
                      {loan.name}
                    </h3>
                    <p style={{ color: colors.textSecondary, margin: 0, fontSize: '0.875rem' }}>
                      Fecha: {new Date(loan.date).toLocaleDateString()}
                    </p>
                    {loan.description && (
                      <p style={{ color: colors.textSecondary, margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>
                        {loan.description}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {!isCompleted && (
                      <button
                        onClick={() => setShowPaymentForm(showPaymentForm === loan.id ? null : loan.id)}
                        style={payButtonStyle}
                      >
                        💰 Pagar
                      </button>
                    )}
                    <button
                      onClick={() => deleteLoan(loan.id)}
                      style={deleteButtonStyle}
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>
                      Progreso: {loan.paid_installments}/{loan.installments} cuotas
                    </span>
                    <span style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>
                      {progress.toFixed(1)}%
                    </span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    background: colors.border,
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${progress}%`,
                      height: '100%',
                      background: isCompleted ? 
                        'linear-gradient(135deg, #10B981 0%, #059669 100%)' :
                        colors.gradientPrimary,
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>

                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: window.innerWidth <= 768 ? '1fr 1fr' : 'repeat(auto-fit, minmax(150px, 1fr))', 
                  gap: '1rem' 
                }}>
                  <div>
                    <p style={{ color: colors.textSecondary, fontSize: '0.875rem', margin: '0 0 0.25rem 0' }}>
                      Monto Total
                    </p>
                    <p style={{ color: colors.textPrimary, fontWeight: '600', margin: 0 }}>
                      ${loan.amount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: colors.textSecondary, fontSize: '0.875rem', margin: '0 0 0.25rem 0' }}>
                      Por Cuota
                    </p>
                    <p style={{ color: colors.textPrimary, fontWeight: '600', margin: 0 }}>
                      ${installmentAmount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: colors.textSecondary, fontSize: '0.875rem', margin: '0 0 0.25rem 0' }}>
                      Restante
                    </p>
                    <p style={{ 
                      color: remaining > 0 ? '#EF4444' : '#10B981', 
                      fontWeight: '600', 
                      margin: 0 
                    }}>
                      ${remaining.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: colors.textSecondary, fontSize: '0.875rem', margin: '0 0 0.25rem 0' }}>
                      Estado
                    </p>
                    <p style={{ 
                      color: isCompleted ? '#10B981' : colors.textPrimary, 
                      fontWeight: '600', 
                      margin: 0 
                    }}>
                      {isCompleted ? '✅ Completado' : '⏳ En progreso'}
                    </p>
                  </div>
                </div>

                {showPaymentForm === loan.id && !isCompleted && (
                  <form onSubmit={(e) => handlePayment(e, loan.id)} style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    background: colors.background,
                    borderRadius: '0.5rem',
                    border: `1px solid ${colors.border}`
                  }}>
                    <h4 style={{ color: colors.textPrimary, marginBottom: '1rem' }}>Registrar Pago</h4>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '1fr 1fr auto', 
                      gap: '0.5rem', 
                      alignItems: 'end' 
                    }}>
                      <input
                        type="number"
                        placeholder="Monto del pago"
                        value={payment.amount}
                        onChange={(e) => setPayment({ ...payment, amount: e.target.value })}
                        style={{ ...inputStyle, marginBottom: 0 }}
                        step="0.01"
                        required
                      />
                      <input
                        type="date"
                        value={payment.date}
                        onChange={(e) => setPayment({ ...payment, date: e.target.value })}
                        style={{ ...inputStyle, marginBottom: 0 }}
                      />
                      <div>
                        <button type="submit" style={payButtonStyle}>Pagar</button>
                        <button 
                          type="button" 
                          onClick={() => setShowPaymentForm(null)}
                          style={{ ...cancelButtonStyle, marginLeft: '0.5rem' }}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {loan.payments.length > 0 && (
                  <div style={{ marginTop: '1.5rem' }}>
                    <h4 style={{ color: colors.textPrimary, marginBottom: '1rem' }}>Historial de Pagos</h4>
                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      {loan.payments.map(payment => (
                        <div key={payment.id} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '0.5rem',
                          background: colors.background,
                          borderRadius: '0.25rem',
                          marginBottom: '0.5rem',
                          fontSize: '0.875rem'
                        }}>
                          <span style={{ color: colors.textSecondary }}>
                            {new Date(payment.date).toLocaleDateString()}
                          </span>
                          <span style={{ color: colors.textPrimary, fontWeight: '600' }}>
                            ${payment.amount.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Loans;