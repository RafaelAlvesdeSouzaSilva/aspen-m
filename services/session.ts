import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/services/api";

export const SESSION_ID_KEY = "aspen_session_id";

/**
 * ID estável para este aparelho, gerado uma única vez e guardado no
 * AsyncStorage — mesmo papel do getOrCreateSessionId() do web
 * (client/js/core/session.js). É o que identifica "esta sessão" na
 * tela de Sessões ativas.
 */
export async function getOrCreateSessionId(): Promise<string> {
  let id = await AsyncStorage.getItem(SESSION_ID_KEY);
  if (!id) {
    id = `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
    await AsyncStorage.setItem(SESSION_ID_KEY, id);
  }
  return id;
}

/**
 * Registra/atualiza esta sessão no backend — mesmo comportamento do
 * registerSession() do web: dispara em toda carga do app, nunca
 * bloqueia nada se falhar (fire-and-forget), só alimenta a lista de
 * sessões ativas e a detecção de login suspeito no servidor.
 */
export async function registerSession(): Promise<void> {
  try {
    const sessionId = await getOrCreateSessionId();
    await api.post("/auth/sessions", { sessionId });
  } catch {
    // Silencioso de propósito — não deve travar o carregamento do app.
  }
}