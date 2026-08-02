import axios from 'axios';

const client = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new CustomEvent('quantix:unauthorized'));
        
        // If not already on auth pages, redirect cleanly
        if (
          typeof window !== 'undefined' &&
          !window.location.pathname.startsWith('/login') &&
          !window.location.pathname.startsWith('/register')
        ) {
          window.location.href = '/login?session_expired=true';
        }
      } else if (error.response.status === 429) {
        error.message = 'Too many requests. Please wait a minute before trying again.';
      }
    } else if (error.request) {
      error.message = 'Unable to connect to QuantiX server. Please check your network connection.';
    }
    return Promise.reject(error);
  }
);

export default client;
