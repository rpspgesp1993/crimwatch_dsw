import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000', // Altere se seu backend usar outra URL/porta
});

export default api;
