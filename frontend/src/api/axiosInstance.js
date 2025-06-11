import axios from 'axios';

console.log("API base URL:", process.env.REACT_APP_API_URL);

const api = axios.create({
  // ✅ CORRIGIDO: Remove o /api do final
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de requisição
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  console.log('📤 Fazendo requisição:', config.method?.toUpperCase(), config.url);
  console.log('📦 Base URL:', config.baseURL);
  console.log('🔗 URL completa:', config.baseURL + config.url);

  return config;
}, (error) => {
  console.error('❌ Erro na requisição:', error);
  return Promise.reject(error);
});

// Interceptor de resposta
api.interceptors.response.use(
  (response) => {
    console.log('✅ Resposta recebida:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ Erro na resposta:', {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method
    });

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }

    return Promise.reject(error);
  }
);

export default api;