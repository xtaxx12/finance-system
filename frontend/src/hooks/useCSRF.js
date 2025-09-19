import { useEffect } from 'react';
import axios from 'axios';

const useCSRF = () => {
  useEffect(() => {
    const initializeCSRF = async () => {
      try {
        // Hacer una petición inicial para obtener el token CSRF
        const baseURL = process.env.REACT_APP_API_URL || 'https://finance-backend-k12z.onrender.com/api';
        await axios.get(`${baseURL.replace('/api', '')}/api/auth/csrf/`, {
          withCredentials: true,
        });
      } catch (error) {
        console.warn('No se pudo inicializar el token CSRF:', error.message);
      }
    };

    initializeCSRF();
  }, []);
};

export default useCSRF;