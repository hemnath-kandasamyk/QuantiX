import axios from 'axios';

// In dev, '/api' is proxied to the backend by vite.config.ts, so a relative
// path just works. In production, the frontend is often deployed to a
// different origin than the backend (e.g. Vercel + Render) — set
// VITE_API_URL at build time to point at the deployed backend, e.g.
// VITE_API_URL=https://quantix-api.onrender.com/api
const baseURL = import.meta.env.VITE_API_URL || '/api';

const client = axios.create({
  baseURL,
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
