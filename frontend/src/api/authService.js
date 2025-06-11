import api from './axiosInstance';

export const verifyToken = async (token) => {
  try {
    const response = await api.get('/auth/verify', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.isValid;
  } catch (error) {
    console.error('Token verification failed:', error);
    return false;
  }
};

// Optional: Add other auth-related functions
export const logout = () => {
  localStorage.removeItem('token');
  delete api.defaults.headers.common['Authorization'];
};