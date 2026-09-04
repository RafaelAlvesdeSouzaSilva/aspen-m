import axios from 'axios';
import { auth } from './firebase';

const BASE_URL = 'https://aspen-api-crqt.onrender.com';

const api = axios.create({
  baseURL: BASE_URL,
  // 30s em vez de 10s: o backend roda no plano free do Render, que
  // hiberna após alguns minutos sem uso — a primeira requisição depois
  // de um tempo parado pode levar 30-50s só pra "acordar" o servidor.
  // Com 10s, essa primeira chamada sempre estourava o timeout antes do
  // servidor responder, mesmo com o app e o backend funcionando direito.
  timeout: 30000,
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

// Se a requisição falhar por timeout (backend ainda "acordando") ou por
// erro de rede, tenta mais UMA vez automaticamente antes de desistir —
// cobre exatamente o caso de cold start do Render sem precisar que o
// usuário toque em "tentar novamente" manualmente.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    const éTimeoutOuRede = error.code === 'ECONNABORTED' || !error.response;
    if (éTimeoutOuRede && config && !config.__retriedAfterColdStart) {
      config.__retriedAfterColdStart = true;
      return api(config);
    }
    return Promise.reject(error);
  },
);

export default api;