import axios from 'axios';
import { auth } from './firebase';

const BASE_URL = 'https://aspen-api-crqt.onrender.com';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    // getIdToken() renova automaticamente o token quando necessário —
    // por isso buscamos na hora da requisição, nunca em cache.
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;