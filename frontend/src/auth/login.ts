import api from '@/api/axiosInstance';

export const login = async (email: string, senha: string) => {
  try {
    const response = await api.post('/auth/login', { email, senha });
    const { token } = response.data;
    localStorage.setItem('token', token);
    return true;
  } catch (err) {
    console.error('Falha no login:', err);
    return false;
  }
};
