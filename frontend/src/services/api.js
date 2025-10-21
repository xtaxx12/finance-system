import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://finance-backend-k12z.onrender.com/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Variable para almacenar el token CSRF
let csrfToken = null;
let csrfTokenPromise = null;

// Función para obtener el token CSRF del servidor
const fetchCSRFToken = async () => {
  try {
    const baseURL = api.defaults.baseURL.replace('/api', '');
    const response = await axios.get(`${baseURL}/api/auth/csrf/`, {
      withCredentials: true,
    });
    csrfToken = response.data.csrfToken;
    return csrfToken;
  } catch (error) {
    console.error('Error obteniendo CSRF token:', error);
    return null;
  }
};

// Función para obtener el token CSRF de las cookies
const getCSRFTokenFromCookie = () => {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'csrftoken') {
      return decodeURIComponent(value);
    }
  }
  return null;
};

// Función para obtener el token CSRF (primero de cookie, luego del servidor)
const getCSRFToken = async () => {
  // Primero intentar obtener de la cookie
  let token = getCSRFTokenFromCookie();
  if (token) {
    return token;
  }

  // Si no hay token en cookie y no hay una petición en curso, obtenerlo del servidor
  if (!csrfTokenPromise) {
    csrfTokenPromise = fetchCSRFToken().finally(() => {
      csrfTokenPromise = null;
    });
  }

  token = await csrfTokenPromise;
  return token || csrfToken;
};

// Interceptor para agregar el token CSRF a las peticiones
api.interceptors.request.use(
  async (config) => {
    // Solo agregar CSRF token para métodos que lo requieren
    if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase())) {
      const token = await getCSRFToken();
      if (token) {
        config.headers['X-CSRFToken'] = token;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirigir al login si no está autenticado
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;