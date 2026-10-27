import axios from 'axios';

// Zero-config base URL: defaults to relative /api handled by Vite proxy or Nginx
const rawUrl = import.meta.env.VITE_API_URL;
const baseURL = rawUrl !== undefined && rawUrl !== '' ? rawUrl : '/api';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatic Bearer Token Injection Interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
