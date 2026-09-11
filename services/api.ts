import axios from 'axios';
import { auth } from './firebase';

// Trocado de aspen-api-crqt.onrender.com pra esse: aquele backend
// separado não tinha /feedback nem /dashboard/summary (dava 404),
// enquanto esse é o mesmo backend que o site usa — já testado com
// pagamento de verdade — e tem TODAS as rotas do projeto, incluindo
// as novas (feedback, dashboard/summary, consents, sessions).
// IMPORTANTE: se depois de testar alguma coisa que já funcionava parar
// de funcionar (login, /auth/me, /devices), pode ser que esse backend
// use um caminho diferente pra alguma rota específica — me avisa que a
// gente ajusta pontualmente, sem precisar voltar pro domínio antigo.
const BASE_URL = 'https://aspencore.onrender.com/api';

const api = axios.create({
  baseURL: BASE_URL,
  // 20s: o backend roda no plano free do Render, que hiberna após
  // alguns minutos sem uso — a primeira requisição depois de um tempo
  // parado pode levar bem mais que os 10s originais só pra "acordar" o
  // servidor. 20s é um meio-termo: cobre a maioria dos cold starts sem
  // deixar o app "travado" esperando de mais numa falha real.
  timeout: 20000,
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