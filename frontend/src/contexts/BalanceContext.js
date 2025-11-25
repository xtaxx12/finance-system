import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { loansApi } from '../services/loansApi';

const BalanceContext = createContext();

export const useBalance = () => {
  const context = useContext(BalanceContext);
  if (!context) {
    throw new Error('useBalance must be used within a BalanceProvider');
  }
  return context;
};

export const BalanceProvider = ({ children }) => {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [totalDebt, setTotalDebt] = useState(0);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [debtProgress, setDebtProgress] = useState(0);

  // Calcular el balance total considerando préstamos
  const calculateBalance = async () => {
    if (!user) return;

    try {
      // Obtener transacciones del localStorage (por ahora)
      const transactions = JSON.parse(localStorage.getItem(`transactions_${user.id}`) || '[]');
      
      // Calcular balance de transacciones
      const transactionBalance = transactions.reduce((total, transaction) => {
        return transaction.type === 'income' 
          ? total + transaction.amount 
          : total - transaction.amount;
      }, 0);

      // Obtener resumen de préstamos de la API
      const loansResponse = await loansApi.getLoansSummary();
      const debt = loansResponse.data.remaining_debt || 0;
      const progress = loansResponse.data.completion_percentage || 0;

      setBalance(transactionBalance);
      setTotalDebt(debt);
      setAvailableBalance(transactionBalance - debt);
      setDebtProgress(progress);
    } catch (error) {
      
      // Error silenciado, usando fallback
      // Fallback al localStorage si falla la API
      const transactions = JSON.parse(localStorage.getItem(`transactions_${user.id}`) || '[]');
      const transactionBalance = transactions.reduce((total, transaction) => {
        return transaction.type === 'income' 
          ? total + transaction.amount 
          : total - transaction.amount;
      }, 0);

      const loans = JSON.parse(localStorage.getItem(`loans_${user.id}`) || '[]');
    
      
      const debt = loans.reduce((total, loan) => {
        const totalPaid = loan.payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
        const remaining = loan.amount - totalPaid;
       
        return total + Math.max(0, remaining);
      }, 0);

      

      setBalance(transactionBalance);
      setTotalDebt(debt);
      setAvailableBalance(transactionBalance - debt);
      
      // Calcular progreso de deuda manualmente
      const totalOriginal = loans.reduce((sum, loan) => sum + loan.amount, 0);
      const totalPaidAmount = loans.reduce((sum, loan) => {
        const paid = loan.payments?.reduce((pSum, payment) => pSum + payment.amount, 0) || 0;
        return sum + paid;
      }, 0);
      const progress = totalOriginal > 0 ? (totalPaidAmount / totalOriginal) * 100 : 0;
      setDebtProgress(progress);
    }
  };

  // Recalcular cuando cambie el usuario
  useEffect(() => {
    calculateBalance();
  }, [user]);

  // Función para actualizar el balance (llamar cuando se agreguen transacciones o pagos)
  const updateBalance = () => {
    calculateBalance();
  };

  const value = {
    balance,
    totalDebt,
    availableBalance,
    debtProgress,
    updateBalance
  };

  return (
    <BalanceContext.Provider value={value}>
      {children}
    </BalanceContext.Provider>
  );
};