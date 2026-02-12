import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add language and auth token headers
api.interceptors.request.use((config) => {
  const lang = localStorage.getItem('lang') || 'fr';
  config.headers['Accept-Language'] = lang;
  
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  
  return config;
});

export default api;
