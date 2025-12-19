import api from './api';

export const loansApi = {
  // Obtener todos los préstamos
  getLoans: () => api.get('/loans/'),
  
  // Crear un nuevo préstamo
  createLoan: (loanData) => api.post('/loans/', loanData),
  
  // Obtener un préstamo específico
  getLoan: (id) => api.get(`/loans/${id}/`),
  
  // Actualizar un préstamo
  updateLoan: (id, loanData) => api.put(`/loans/${id}/`, loanData),
  
  // Eliminar un préstamo
  deleteLoan: (id) => api.delete(`/loans/${id}/`),
  
  // Obtener resumen de préstamos
  getLoansSummary: () => api.get('/loans/summary/'),
  
  // Agregar un pago a un préstamo
  addPayment: (loanId, paymentData) => api.post(`/loans/${loanId}/add_payment/`, paymentData),
  
  // Obtener pagos de un préstamo
  getLoanPayments: (loanId) => api.get(`/loans/${loanId}/payments/`),
  
  // Obtener todos los pagos
  getAllPayments: () => api.get('/loan-payments/'),
  
  // Eliminar un pago
  deletePayment: (paymentId) => api.delete(`/loan-payments/${paymentId}/`)
};