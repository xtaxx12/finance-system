import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { BalanceProvider } from './contexts/BalanceContext';
import Navbar from './components/Navbar';
import PublicNavbar from './components/PublicNavbar';
import Dashboard from './pages/DashboardPremium';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Register from './pages/Register';
import Transactions from './pages/TransactionsPremium';
import Goals from './pages/GoalsPremium';
import Budgets from './pages/BudgetsPremium';
import Loans from './pages/LoansPremium';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import useCSRF from './hooks/useCSRF';

function App() {
  useCSRF(); // Inicializar CSRF token

  return (
    <ThemeProvider>
      <AuthProvider>
        <BalanceProvider>
          <Router>
            <div className="App">
              <PublicNavbar />
              <Navbar />
              <main>
                <Routes>
                  <Route path="/welcome" element={<Welcome />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/transactions" element={
                    <ProtectedRoute>
                      <Transactions />
                    </ProtectedRoute>
                  } />
                  <Route path="/goals" element={
                    <ProtectedRoute>
                      <Goals />
                    </ProtectedRoute>
                  } />
                  <Route path="/budgets" element={
                    <ProtectedRoute>
                      <Budgets />
                    </ProtectedRoute>
                  } />
                  <Route path="/loans" element={
                    <ProtectedRoute>
                      <Loans />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                </Routes>
              </main>
              <Toaster
                position="top-right"
                toastOptions={{
                  style: {
                    background: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '0.75rem',
                    boxShadow: 'var(--shadow-lg)',
                  },
                }}
              />
            </div>
          </Router>
        </BalanceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;